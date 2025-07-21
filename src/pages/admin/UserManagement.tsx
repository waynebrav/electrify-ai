
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Search, Loader2, RefreshCw } from "lucide-react";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth } from "@/integrations/firebase/client"; 

interface User {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

const UserManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  console.log('Current frontend user:', currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isAdmin: false,
  });

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get all users from profiles table, including auth_provider
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*, auth_provider");

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const users = profilesData.map((profile: any) => {
        const userRoles = rolesData
          .filter((role: any) => role.user_id === profile.id)
          .map((role: any) => role.role);
        return {
          id: profile.id,
          email: profile.email,
          created_at: profile.created_at,
          roles: userRoles,
          authMethod: profile.auth_provider || "password",
          profile: {
            first_name: profile.first_name,
            last_name: profile.last_name,
          },
        };
      });

      setUsers(users);
      console.log('Fetched users:', users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create user in Firebase
      const { email, password, firstName, lastName, isAdmin } = formData;
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Create profile in Supabase
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: newUser.uid,
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Add role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: newUser.uid,
        role: isAdmin ? "admin" : "customer",
      });

      if (roleError) throw roleError;

      // Close dialog and refresh user list
      setIsAddUserOpen(false);
      toast({
        title: "Success",
        description: `User ${email} has been created successfully`,
      });
      
      // Reset form
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        isAdmin: false,
      });
      
      // Refresh user list
      fetchUsers();
      
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      // First delete user roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
        
      if (roleError) throw roleError;
      
      // Then delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
        
      if (profileError) throw profileError;
      
      // Then update UI
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Success",
        description: "User has been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        // Add admin role
        const { error } = await supabase.from("user_roles").upsert({
          user_id: userId,
          role: "admin",
        });
        if (error) throw error;
      } else {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .match({ user_id: userId, role: "admin" });
        if (error) throw error;
      }

      // Update UI
      setUsers(users.map(user => {
        if (user.id === userId) {
          const newRoles = isAdmin 
            ? [...user.roles.filter(r => r !== 'admin'), 'admin'] 
            : user.roles.filter(r => r !== 'admin');
            
          return { ...user, roles: newRoles };
        }
        return user;
      }));

      toast({
        title: "Success",
        description: `User ${isAdmin ? "is now" : "is no longer"} an admin`,
      });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Restore search and filter logic
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.profile?.first_name?.toLowerCase().includes(query) ||
      user.profile?.last_name?.toLowerCase().includes(query)
    );
  });
  console.log('Filtered users:', filteredUsers);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="space-x-2 flex items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <Input 
              placeholder="Search users" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-56"
            />
          </div>
          <Button 
            size="icon"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isAdmin: checked === true }))
                    }
                  />
                  <Label htmlFor="isAdmin">Grant admin privileges</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow">
        <Tabs defaultValue="all">
          <div className="border-b px-4">
            <TabsList className="bg-transparent">
              <TabsTrigger value="all" className="py-3">All Users</TabsTrigger>
              <TabsTrigger value="admin" className="py-3">Admins</TabsTrigger>
              <TabsTrigger value="customer" className="py-3">Customers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <UserList 
              users={filteredUsers}
              isLoading={isLoading}
              onDeleteUser={handleDeleteUser}
              onToggleAdmin={handleToggleAdmin}
              currentUserId={currentUser?.id || ''}
            />
          </TabsContent>
          
          <TabsContent value="admin">
            <UserList 
              users={filteredUsers.filter(user => user.roles.includes('admin'))}
              isLoading={isLoading}
              onDeleteUser={handleDeleteUser}
              onToggleAdmin={handleToggleAdmin}
              currentUserId={currentUser?.id || ''}
            />
          </TabsContent>
          
          <TabsContent value="customer">
            <UserList 
              users={filteredUsers.filter(user => !user.roles.includes('admin'))}
              isLoading={isLoading}
              onDeleteUser={handleDeleteUser}
              onToggleAdmin={handleToggleAdmin}
              currentUserId={currentUser?.id || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser: (id: string) => void;
  onToggleAdmin: (id: string, isAdmin: boolean) => void;
  currentUserId: string;
}

const UserList = ({ users, isLoading, onDeleteUser, onToggleAdmin, currentUserId }: UserListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-gray-500">
                  {user.profile?.first_name && user.profile?.last_name
                    ? `${user.profile.first_name} ${user.profile.last_name}`
                    : ''}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {user.roles.includes('admin') ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Customer
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.roles.includes('admin') ? (
                    <DropdownMenuItem 
                      onClick={() => onToggleAdmin(user.id, false)}
                      disabled={user.id === currentUserId}
                    >
                      Remove Admin Role
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onToggleAdmin(user.id, true)}>
                      Make Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDeleteUser(user.id)}
                    disabled={user.id === currentUserId}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserManagement;
