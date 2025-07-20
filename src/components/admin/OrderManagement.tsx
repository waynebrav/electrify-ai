
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Package, Search, Eye, Filter } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  currency: string;
  tracking_number?: string;
  customer_email?: string;
  customer_name?: string;
}

const OrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders", searchTerm, statusFilter, paymentFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          id,
          user_id,
          total_amount,
          status,
          payment_status,
          created_at,
          currency,
          tracking_number
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (paymentFilter !== "all") {
        query = query.eq("payment_status", paymentFilter);
      }

      const { data: ordersData, error } = await query;
      if (error) throw error;

      // Get unique user IDs to fetch profile data
      const userIds = [...new Set(ordersData?.map(order => order.user_id).filter(Boolean))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      // Create a map of user profiles for quick lookup
      const profileMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Combine orders with profile data
      const ordersWithProfiles = ordersData?.map(order => ({
        ...order,
        customer_email: profileMap.get(order.user_id)?.email || 'Unknown',
        customer_name: profileMap.get(order.user_id) 
          ? `${profileMap.get(order.user_id)?.first_name || ''} ${profileMap.get(order.user_id)?.last_name || ''}`.trim()
          : 'Unknown Customer'
      })) || [];

      // Apply search filter
      let filteredData = ordersWithProfiles;
      if (searchTerm) {
        filteredData = ordersWithProfiles.filter(order => 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredData as Order[];
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>
            Manage customer orders, update statuses, and track shipments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders, emails, or tracking numbers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.customer_name || 'Unknown Customer'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email || 'No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.currency} {order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentBadgeColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(status) => 
                              updateOrderMutation.mutate({ orderId: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
