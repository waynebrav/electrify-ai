
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, ArrowLeft, User, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "processing":
      return <Clock className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-500";
    case "shipped":
      return "bg-blue-500";
    case "processing":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

const OrderHistory = () => {
  const [openOrders, setOpenOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch orders for the current user
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("id, created_at, status, total_amount, order_items:order_items(id, product_name, unit_price, quantity)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOrders(ordersData || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your orders",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate, toast]);

  const toggleOrder = (orderId: string) => {
    setOpenOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="inline-flex items-center text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="inline-flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <Link 
                to="/products" 
                className="inline-flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold mb-2">Order History</h1>
            <p className="text-white/80">Track and manage your orders</p>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">

          <div className="space-y-4">
            {loading ? (
              <div>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div>No orders found.</div>
            ) : (
              orders.map((order) => (
                <Collapsible
                  key={order.id}
                  open={openOrders.includes(order.id)}
                  onOpenChange={() => toggleOrder(order.id)}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {openOrders.includes(order.id) ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <CardTitle className="text-lg">Order {order.id.slice(0, 8)}</CardTitle>
                                <CardDescription>
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Total</p>
                              <p className="text-lg font-bold">KES {order.total_amount}</p>
                            </div>
                            <Badge 
                              className={`${getStatusColor(order.status)} text-white`}
                              variant="secondary"
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        {/* Order Items */}
                        <div className="space-y-3 mb-6">
                          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Items ({order.order_items?.length || 0})
                          </h4>
                          {order.order_items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-muted/50 last:border-0">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">KES {item.total_price || (item.unit_price * item.quantity)}</p>
                                <p className="text-xs text-muted-foreground">
                                  KES {item.unit_price} each
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm">
                                Reorder
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button variant="outline" size="sm">
                                Track Package
                              </Button>
                            )}
                          </div>
                          <div className="bg-muted/50 px-4 py-2 rounded-lg">
                            <p className="text-sm text-muted-foreground">Order Total</p>
                            <p className="text-xl font-bold">KES {order.total_amount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory;
