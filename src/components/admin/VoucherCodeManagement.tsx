import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MoreHorizontal, Ticket, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface VoucherCode {
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
  created_at: string;
}

const VoucherCodeManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumPurchase: 0,
    maxUses: 100,
    startDate: "",
    endDate: "",
  });

  // Fetch voucher codes
  const { data: voucherCodes, isLoading } = useQuery({
    queryKey: ["voucher-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VoucherCode[];
    },
  });

  // Create voucher code
  const createVoucherMutation = useMutation({
    mutationFn: async (voucher: any) => {
      const { error } = await supabase
        .from("coupons")
        .insert({
          code: voucher.code,
          description: voucher.description,
          discount_type: voucher.discountType,
          discount_value: voucher.discountValue,
          minimum_purchase: voucher.minimumPurchase,
          max_uses: voucher.maxUses,
          start_date: voucher.startDate ? new Date(voucher.startDate).toISOString() : null,
          end_date: voucher.endDate ? new Date(voucher.endDate).toISOString() : null,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-codes"] });
      setShowAddDialog(false);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        minimumPurchase: 0,
        maxUses: 100,
        startDate: "",
        endDate: "",
      });
      toast({ title: "Success", description: "Voucher code created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Toggle voucher status
  const toggleVoucherMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-codes"] });
      toast({ title: "Success", description: "Voucher status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete voucher
  const deleteVoucherMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-codes"] });
      toast({ title: "Success", description: "Voucher code deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVoucherMutation.mutate(formData);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const getStatusBadge = (voucher: VoucherCode) => {
    if (!voucher.is_active) return <Badge variant="secondary">Inactive</Badge>;
    
    if (voucher.end_date && new Date(voucher.end_date) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (voucher.max_uses && voucher.current_uses >= voucher.max_uses) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8 text-blue-500" />
            Voucher Code Management
          </h1>
          <p className="text-muted-foreground">Create and manage discount voucher codes</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Voucher Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Voucher Code</DialogTitle>
              <DialogDescription>
                Create a new discount voucher code for customers
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Voucher Code*</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="DISCOUNT10"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="10% off on all items"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type*</Label>
                  <Select value={formData.discountType} onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}>
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
                  <Label htmlFor="discountValue">Discount Value*</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    min={1}
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPurchase">Minimum Purchase</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    value={formData.minimumPurchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumPurchase: Number(e.target.value) }))}
                    min={0}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createVoucherMutation.isPending}>
                  Create Voucher
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voucherCodes?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vouchers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voucherCodes?.filter(v => v.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voucherCodes?.reduce((sum, v) => sum + v.current_uses, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Codes</CardTitle>
          <CardDescription>Manage your discount voucher codes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherCodes?.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <div>
                      <p className="font-mono font-bold">{voucher.code}</p>
                      <p className="text-sm text-muted-foreground">{voucher.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `KES ${voucher.discount_value}`}
                      </p>
                      {voucher.minimum_purchase > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Min: KES {voucher.minimum_purchase}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{voucher.current_uses} / {voucher.max_uses || '∞'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {voucher.end_date
                      ? format(new Date(voucher.end_date), "MMM dd, yyyy")
                      : "No expiry"}
                  </TableCell>
                  <TableCell>{getStatusBadge(voucher)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => 
                          toggleVoucherMutation.mutate({ id: voucher.id, isActive: !voucher.is_active })
                        }>
                          {voucher.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteVoucherMutation.mutate(voucher.id)}
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
                    No voucher codes found. Create your first voucher code.
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

export default VoucherCodeManagement;