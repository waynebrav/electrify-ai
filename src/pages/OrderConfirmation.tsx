
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Bitcoin, Wallet, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_address: any;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method");
  const status = searchParams.get("status");
  const address = searchParams.get("address");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Show success toast for successful payments
    if (status === 'success' && method === 'paypal') {
      toast({
        title: "Payment Successful!",
        description: "Your PayPal payment has been processed successfully.",
      });
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else if (status === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
    } else if (status === 'error') {
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
    
    if (id) {
      fetchOrder(id);
      
      // For M-Pesa and crypto payments, check status periodically
      if (method === 'mpesa' || method === 'bitcoin' || method === 'ethereum' || method === 'usdt') {
        const statusInterval = setInterval(() => {
          checkPaymentStatus(id);
        }, 10000); // Check every 10 seconds
        
        return () => clearInterval(statusInterval);
      }
    }
  }, [id, user, navigate, method, status]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user?.id)
        .single();

      if (orderError) throw orderError;
      
      if (!orderData) {
        toast({
          title: "Order not found",
          description: "The requested order could not be found",
          variant: "destructive"
        });
        navigate("/orders");
        return;
      }

      setOrder(orderData);
      setPaymentStatus(
        orderData.payment_status === 'paid' ? 'completed' :
        orderData.payment_status === 'failed' ? 'failed' : 'pending'
      );
      
      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      
      setOrderItems(itemsData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  const checkPaymentStatus = async (orderId: string) => {
    try {
      // Get latest payment transaction for this order
      const { data: transaction } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (transaction) {
        if (transaction.status === 'completed' && transaction.verification_status === 'verified') {
          setPaymentStatus('completed');
        } else if (transaction.status === 'failed') {
          setPaymentStatus('failed');
        }
      }
      
      // Refresh order details
      const { data: orderData } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("id", orderId)
        .single();
        
      if (orderData && orderData.payment_status === 'paid') {
        setPaymentStatus('completed');
      } else if (orderData && orderData.payment_status === 'failed') {
        setPaymentStatus('failed');
      }
      
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
        <p>Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order #{id?.substring(0, 8)}</CardTitle>
            <CardDescription>
              Order created on {new Date(order?.created_at || "").toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">Status:</div>
              <div className="flex items-center gap-1">
                {order?.status === 'processing' && <Clock className="h-4 w-4 text-blue-500" />}
                {order?.status === 'shipped' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {order?.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                {order?.status}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="font-medium">Payment:</div>
              <div className="flex items-center gap-1">
                {paymentStatus === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {paymentStatus === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                {paymentStatus === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                {paymentStatus === 'completed' ? 'Paid' : paymentStatus === 'pending' ? 'Pending' : 'Failed'}
              </div>
            </div>
            
            <div className="font-medium mt-4">Shipping Address:</div>
            <div className="text-sm">
              {order?.shipping_address?.name}<br />
              {order?.shipping_address?.address}<br />
              {order?.shipping_address?.city}, {order?.shipping_address?.postal_code}<br />
              {order?.shipping_address?.country}<br />
              {order?.shipping_address?.phone}
            </div>
            
            <div className="font-medium mt-4">Payment Method:</div>
            <div className="capitalize">{order?.payment_method}</div>
          </CardContent>
        </Card>
        
        {/* Crypto payment specific card */}
        {(method === 'bitcoin' || method === 'ethereum' || method === 'usdt') && address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {method === 'bitcoin' ? <Bitcoin className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                {method.charAt(0).toUpperCase() + method.slice(1)} Payment
              </CardTitle>
              <CardDescription>
                Send payment to complete your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="mx-auto">
                <QRCodeSVG value={address} size={180} />
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Wallet Address:</div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm break-all">
                  {address}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Amount to Pay:</div>
                <div className="text-lg font-bold">
                  KES {order?.total_amount.toLocaleString()} worth of {method.toUpperCase()}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-300">
                <p>After sending your payment, please allow some time for the transaction to be confirmed on the blockchain. Our team will verify the payment and process your order once confirmed.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => navigate("/orders")}>
                View All Orders
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Standard order details */}
        {!(method === 'bitcoin' || method === 'ethereum' || method === 'usdt') && (
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name} x {item.quantity}
                  </span>
                  <span>
                    KES {item.total_price.toLocaleString()}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KES {order?.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>Included</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>KES {order?.total_amount.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => navigate("/orders")}>
                View All Orders
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;
