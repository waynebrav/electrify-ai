import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, MoreHorizontal, Ticket, Calendar, Percent } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_purchase: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  currency: string;
  created_at: string;
}

interface FormData {
  code: string;
  description: string;
  discount_type: string;
  discount_value: string;
  minimum_purchase: string;
  max_uses: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  currency: string;
}

const VoucherManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<FormData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_purchase: "0",
    max_uses: "",
    is_active: true,
    start_date: "",
    end_date: "",
    currency: "KES",
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: Omit<Coupon, "id" | "created_at">) => {
      const { error } = await supabase.from("coupons").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setShowCreateForm(false);
      resetForm();
      toast({ title: "Success", description: "Coupon created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const { error } = await supabase.from("coupons").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setEditingCoupon(null);
      resetForm();
      toast({ title: "Success", description: "Coupon updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({ title: "Success", description: "Coupon deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      minimum_purchase: "0",
      max_uses: "",
      is_active: true,
      start_date: "",
      end_date: "",
      currency: "KES",
    });
  };

  const handleSubmit = () => {
    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      minimum_purchase: parseFloat(formData.minimum_purchase),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      currency: formData.currency,
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, data: couponData });
    } else {
      createCouponMutation.mutate({ ...couponData, current_uses: 0 });
    }
  };

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      minimum_purchase: coupon.minimum_purchase.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      is_active: coupon.is_active,
      start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : "",
      end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().slice(0, 16) : "",
      currency: coupon.currency,
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (startDate && startDate > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (endDate && endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return <Badge variant="destructive">Used Up</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            Voucher Management
          </h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Dialog open={showCreateForm || !!editingCoupon} onOpenChange={(open) => {
          if (!open) {
            setShowCreateForm(false);
            setEditingCoupon(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? "Update coupon details" : "Create a new discount coupon for customers"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code*</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="SAVE20"
                  className="uppercase"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Save 20% on all electronics"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type*</Label>
                <Select value={formData.discount_type} onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value* {formData.discount_type === "percentage" ? "(%)" : `(${formData.currency})`}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  placeholder={formData.discount_type === "percentage" ? "20" : "100"}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimum_purchase">Minimum Purchase ({formData.currency})</Label>
                <Input
                  id="minimum_purchase"
                  type="number"
                  value={formData.minimum_purchase}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_purchase: e.target.value }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date (optional)</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (optional)</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateForm(false);
                setEditingCoupon(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons?.filter(c => c.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons?.reduce((sum, c) => sum + c.current_uses, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>Manage your discount coupons and track their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                  <TableCell>{coupon.description || "—"}</TableCell>
                  <TableCell>
                    {coupon.discount_type === "percentage" 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.currency} ${coupon.discount_value}`}
                  </TableCell>
                  <TableCell>
                    {coupon.current_uses}{coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(coupon)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No coupons found. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherManagement;