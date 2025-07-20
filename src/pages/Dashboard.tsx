import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  DollarSign, ShoppingBag, TrendingUp, Package, 
  Calendar, Eye, Settings, BarChart3, PieChart as PieChartIcon 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch customer analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["customer-analytics", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("customer_analytics")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching analytics:", error);
        return null;
      }
      
      return data || {
        total_spent: 0,
        purchase_frequency: 0,
        average_order_value: 0,
        lifetime_value: 0
      };
    },
    enabled: !!user?.id,
  });

  // Fetch spending history
  const { data: spendingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["spending-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("customer_spending_history")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      
      if (error) {
        console.error("Error fetching spending history:", error);
        return [];
      }
      
      return data.map(item => ({
        ...item,
        monthName: new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["recent-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Sample data for category preferences (this would come from actual user behavior)
  const categoryData = [
    { name: 'Electronics', value: 45, color: '#8884d8' },
    { name: 'Gaming', value: 30, color: '#82ca9d' },
    { name: 'Mobile', value: 15, color: '#ffc658' },
    { name: 'Accessories', value: 10, color: '#ff8042' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  const isLoading = analyticsLoading || historyLoading || ordersLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's your shopping overview and analytics
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {analytics?.total_spent?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime value: KES {analytics?.lifetime_value?.toLocaleString() || '0'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.purchase_frequency || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total orders placed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {analytics?.average_order_value?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average order value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentOrders?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  In the last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Over Time</CardTitle>
                    <CardDescription>
                      Your monthly spending pattern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {spendingHistory && spendingHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={spendingHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthName" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`KES ${value}`, 'Amount Spent']} />
                          <Area 
                            type="monotone" 
                            dataKey="amount_spent" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary) / 0.2)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No spending data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Frequency */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Frequency</CardTitle>
                    <CardDescription>
                      Number of orders per month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {spendingHistory && spendingHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={spendingHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthName" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}`, 'Orders']} />
                          <Bar 
                            dataKey="number_of_orders" 
                            fill="hsl(var(--primary))" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No order data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Your latest order history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders && recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-medium">KES {order.total_amount.toLocaleString()}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/orders')}
                        >
                          View All Orders
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/products')}
                      >
                        Start Shopping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shopping Categories</CardTitle>
                    <CardDescription>
                      Your preferred product categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Quick Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/profile')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/analytics')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;