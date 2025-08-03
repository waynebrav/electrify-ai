
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, LineChart, BoxIcon, Loader2, ArrowLeft, Package } from "lucide-react";
import UserManagement from "./admin/UserManagement";
import ProductManagement from "./admin/ProductManagement";
import SettingsPanel from "./admin/SettingsPanel";
import OrderManagement from "@/components/admin/OrderManagement";
import { useToast } from "@/components/ui/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Type definitions for our dashboard stats
interface DashboardStats {
  total_users: number;
  total_revenue: number;
  orders_count: number;
  active_products: number;
  user_growth_percentage: number;
  revenue_growth_percentage: number;
  orders_growth_percentage: number;
  products_growth_percentage: number;
}

interface AnalyticsData {
  date: string;
  revenue: number;
  users: number;
  orders: number;
}

interface InventoryItem {
  id: string;
  name: string;
  stock_quantity: number;
  status: string;
  categories: { name: string } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAccess = () => {
      const adminSession = sessionStorage.getItem("adminSession");
      let hasAdminAccess = false;
      
      if (adminSession) {
        try {
          const sessionData = JSON.parse(adminSession);
          // Check if session is not expired (24 hours)
          const isValidSession = sessionData.isAdmin && 
            sessionData.timestamp && 
            (Date.now() - sessionData.timestamp) < 24 * 60 * 60 * 1000;
          hasAdminAccess = isValidSession;
        } catch (error) {
          console.error("Invalid session data:", error);
        }
      }
      
      setIsAdmin(hasAdminAccess);
      
      if (!hasAdminAccess) {
        console.log("User is not admin, redirecting to admin login");
        toast({
          title: "Access denied",
          description: "You must be an admin to access this page.",
          variant: "destructive",
        });
        navigate("/admin/login");
      }
    };
    
    verifyAccess();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      // Clear all admin session data
      sessionStorage.removeItem("adminSession");
      sessionStorage.removeItem("isAdmin");
      sessionStorage.removeItem("adminData");
      
      navigate("/");
      toast({
        title: "Signed out",
        description: "You have been signed out of the admin panel.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBackToSite = () => {
    navigate("/");
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSite}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              title="Back to main site"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "dashboard" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "users" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/products" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "products" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("products")}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Products
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "orders" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                <Package className="mr-3 h-5 w-5" />
                Orders
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/analytics" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "analytics" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <LineChart className="mr-3 h-5 w-5" />
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/inventory" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "inventory" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("inventory")}
              >
                <BoxIcon className="mr-3 h-5 w-5" />
                Inventory
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/settings" 
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === "settings" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
          
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button 
              variant="ghost" 
              className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/analytics" element={<AnalyticsPanel />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/settings" element={<SettingsPanel />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const { data: stats, isLoading, error } = useQuery<DashboardStats | null>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<DashboardStats | null> => {
      try {
        console.log("Fetching admin dashboard stats...");
        const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
        
        if (error) {
          console.error("Error from get_admin_dashboard_stats:", error);
          throw error;
        }
        
        console.log("Raw stats data:", data);
        return data?.[0] || null;
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <p className="text-sm text-slate-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const safeStats: DashboardStats = stats || {
    total_users: 0,
    total_revenue: 0,
    orders_count: 0,
    active_products: 0,
    user_growth_percentage: 0,
    revenue_growth_percentage: 0,
    orders_growth_percentage: 0,
    products_growth_percentage: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard Overview</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor your store's performance and key metrics
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {safeStats.total_users.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${
              safeStats.user_growth_percentage >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {safeStats.user_growth_percentage > 0 ? '+' : ''}
              {safeStats.user_growth_percentage}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              KES {safeStats.total_revenue.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${
              safeStats.revenue_growth_percentage >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {safeStats.revenue_growth_percentage > 0 ? '+' : ''}
              {safeStats.revenue_growth_percentage}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {safeStats.orders_count.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${
              safeStats.orders_growth_percentage >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {safeStats.orders_growth_percentage > 0 ? '+' : ''}
              {safeStats.orders_growth_percentage}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
              <BoxIcon className="h-4 w-4 mr-2" />
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {safeStats.active_products.toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${
              safeStats.products_growth_percentage >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {safeStats.products_growth_percentage > 0 ? '+' : ''}
              {safeStats.products_growth_percentage}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AnalyticsPanel = () => {
  const { data: analyticsData = [], isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ["admin-analytics"],
    queryFn: async (): Promise<AnalyticsData[]> => {
      const { data, error } = await supabase
        .from("admin_analytics")
        .select("*")
        .order("date", { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.total_revenue,
        users: item.total_users,
        orders: item.orders_count,
      }));
    },
  });

  const chartConfig = {
    revenue: {
      label: "Revenue (KES)",
      color: "hsl(var(--chart-1))",
    },
    users: {
      label: "Users",
      color: "hsl(var(--chart-2))",
    },
    orders: {
      label: "Orders", 
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Analytics Overview</h1>
      
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Revenue Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const InventoryManagement = () => {
  const { data: inventoryData = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory-overview"],
    queryFn: async (): Promise<InventoryItem[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          stock_quantity,
          status,
          categories (name)
        `)
        .order("stock_quantity", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Inventory Management</h1>
      
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryData.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.categories?.name || "No category"}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.stock_quantity === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : item.stock_quantity < 20
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    {item.stock_quantity === 0
                      ? "Out of Stock"
                      : item.stock_quantity < 20
                      ? `Low Stock: ${item.stock_quantity}`
                      : `In Stock: ${item.stock_quantity}`}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white">
            Generate Inventory Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
