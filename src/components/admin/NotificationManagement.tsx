import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Plus, Edit, Trash2, Save, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

const NotificationManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    }
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowCreateForm(false);
      resetForm();
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Notification> & { id: string }) => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setEditingNotification(null);
      toast({
        title: "Success",
        description: "Notification updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const handleCreate = () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...formData,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingNotification) return;

    updateMutation.mutate({
      id: editingNotification.id,
      ...formData,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });
  };

  const startEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_active: notification.is_active,
      start_date: notification.start_date?.split('T')[0] || '',
      end_date: notification.end_date?.split('T')[0] || ''
    });
    setShowCreateForm(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Notification Management</h2>
        </div>
        <Button onClick={() => {
          setShowCreateForm(true);
          setEditingNotification(null);
          resetForm();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNotification ? 'Edit' : 'Create'} Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Notification message"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.is_active.toString()}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date (optional)</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">End Date (optional)</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={editingNotification ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingNotification ? 'Update' : 'Create'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingNotification(null);
                  resetForm();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Badge variant={notification.is_active ? "default" : "secondary"}>
                      {notification.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(notification.created_at).toLocaleDateString()}
                    {notification.start_date && (
                      <span className="ml-4">
                        Start: {new Date(notification.start_date).toLocaleDateString()}
                      </span>
                    )}
                    {notification.end_date && (
                      <span className="ml-4">
                        End: {new Date(notification.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(notification)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(notification.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationManagement;