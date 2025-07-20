
import { useEffect } from "react";
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
  TrendingUp, ShoppingBag, Eye, Heart, Calendar, DollarSign,
  Package, BarChart3, ArrowLeft 
} from "lucide-react";

// Fetch real analytics data from Supabase

const UserAnalytics = () => {
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

  // Mock data for views and wishlist (these would come from actual tracking)
  const mockActivityData = spendingHistory?.map(item => ({
    ...item,
    views: Math.floor(Math.random() * 50) + 20,
    wishlist: Math.floor(Math.random() * 15) + 5
  })) || [];

  if (!user) {
    return null;
  }

  const isLoading = analyticsLoading || historyLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Detailed Analytics</h1>
            <p className="text-muted-foreground">Deep dive into your shopping behavior and trends</p>
          </div>

          {/* Stats Cards */}
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
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.purchase_frequency || 0}
                </div>
                <p className="text-xs text-muted-foreground">All time purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {analytics?.average_order_value?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Per order value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shopping Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.purchase_frequency ? Math.min(100, (analytics.purchase_frequency * 10)) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Based on activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Spending Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Your spending pattern over time</CardDescription>
              </CardHeader>
              <CardContent>
                {spendingHistory && spendingHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={spendingHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'amount_spent' ? `KES ${value}` : value,
                        name === 'amount_spent' ? 'Amount Spent' : 'Number of Orders'
                      ]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount_spent" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="Amount Spent"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="number_of_orders" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        name="Number of Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    No spending data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
                <CardDescription>Detailed view of monthly spending</CardDescription>
              </CardHeader>
              <CardContent>
                {spendingHistory && spendingHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={spendingHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`KES ${value}`, 'Amount Spent']} />
                      <Bar 
                        dataKey="amount_spent" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shopping Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Insights</CardTitle>
                <CardDescription>Key metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Lifetime Value</span>
                        <span className="text-sm font-bold">
                          KES {analytics.lifetime_value?.toLocaleString() || '0'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Purchase Frequency</span>
                        <span className="text-sm font-bold">
                          {analytics.purchase_frequency || 0} orders
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Order Value</span>
                        <span className="text-sm font-bold">
                          KES {analytics.average_order_value?.toLocaleString() || '0'}
                        </span>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Your shopping score is based on purchase frequency and engagement.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Start shopping to see your insights!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserAnalytics;
