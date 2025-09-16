
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import PaymentMethodIcon from "@/components/PaymentMethodIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const Checkout = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"bitcoin" | "ethereum" | "usdt" | "mpesa" | "paypal" | "cash">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, get user's cart using UUID user ID
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError;
      }

      if (!cart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Then, get cart items
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
          product:products (
            name,
            price,
            slug,
            currency,
            description,
            short_description
          )
        `)
        .eq("cart_id", cart.id);

      if (error) throw error;

      setCartItems(data || []);
      
      // Calculate total
      const total = (data || []).reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);
      
      setTotalAmount(total);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load your cart",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: "bitcoin" | "ethereum" | "usdt" | "mpesa" | "paypal" | "cash") => {
    setSelectedPaymentMethod(method);
    
    // Reset payment-specific fields
    setPhoneNumber("");
    setTransactionReference("");
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleTransactionReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionReference(e.target.value);
  };

  const handleTermsAcceptance = (checked: boolean) => {
    setTermsAccepted(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Validation for different payment methods
    if (selectedPaymentMethod === "mpesa" && !phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to proceed with M-Pesa payment.",
        variant: "destructive",
      });
      return;
    }

    if ((selectedPaymentMethod === "bitcoin" || selectedPaymentMethod === "ethereum" || selectedPaymentMethod === "usdt") && !transactionReference) {
      toast({
        title: "Transaction reference required",
        description: "Please enter your transaction reference to proceed with crypto payment.",
        variant: "destructive",
      });
      return;
    }

    // Phone number validation for M-Pesa
    if (selectedPaymentMethod === "mpesa") {
      const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Create mock shipping address in the correct format for the database
      const shippingAddress = {
        name: "Default Address",
        address: "Default Street",
        city: "Default City",
        postal_code: "00000",
        country: "Default Country",
        phone: phoneNumber || "1234567890"
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id,
            total_amount: totalAmount,
            payment_method: selectedPaymentMethod,
            shipping_address: shippingAddress, 
            status: "pending",
            payment_status: "pending",
            currency: "KES"
          }
        ])
        .select("id")
        .single();

      if (orderError) {
        console.error("Order insert error:", orderError.message, orderError.details, orderError.hint);
        throw orderError;
      }

      // Create order items with correct field mappings
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Clear cart
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (cartError) throw cartError;

      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart?.id);

      if (clearCartError) throw clearCartError;

      // Handle different payment methods
      if (selectedPaymentMethod === "mpesa") {
        try {
          const { data: stkResponse, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
            body: {
              phoneNumber: phoneNumber,
              amount: totalAmount,
              orderId: order.id
            }
          });

          if (stkError) throw stkError;

          if (stkResponse.success) {
            toast({
              title: "M-Pesa Payment Initiated",
              description: "Please check your phone and enter your M-Pesa PIN to complete payment.",
            });
          } else {
            throw new Error(stkResponse.error || 'Failed to initiate M-Pesa payment');
          }
        } catch (mpesaError) {
          console.error('M-Pesa error:', mpesaError);
          toast({
            title: "M-Pesa Error",
            description: "Failed to initiate M-Pesa payment. Please try again or use another payment method.",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPaymentMethod === "paypal") {
        toast({
          title: "Proceeding to PayPal...",
          description: "Please wait while we redirect you to PayPal",
        });
        
        try {
          const { data: paypalResponse, error: paypalError } = await supabase.functions.invoke('paypal-create-payment', {
            body: {
              orderId: order.id,
              amount: totalAmount,
              currency: "USD" // You can make this dynamic based on user preference
            }
          });

          if (paypalError) throw paypalError;

          if (paypalResponse.success) {
            // Redirect to PayPal for approval
            window.location.href = paypalResponse.approvalUrl;
            return; // Exit function to prevent further navigation
          } else {
            throw new Error(paypalResponse.error || 'Failed to create PayPal payment');
          }
        } catch (paypalError) {
          console.error('PayPal error:', paypalError);
          toast({
            title: "PayPal Error",
            description: "Failed to initiate PayPal payment. Please try again or use another payment method.",
            variant: "destructive",
          });
          return;
        }
      } else if (selectedPaymentMethod === "cash") {
        toast({
          title: "Cash Payment Selected",
          description: "Your order has been placed. Please prepare cash payment upon delivery.",
        });
      } else {
        // For crypto payments
        toast({
          title: "Order placed",
          description: `Your order has been placed with ${selectedPaymentMethod.toUpperCase()} payment. Please complete the payment using the provided address.`,
        });
      }

      // For crypto payments or other methods, pass additional parameters
      const queryParams = new URLSearchParams();
      
      if (selectedPaymentMethod === "bitcoin" || selectedPaymentMethod === "ethereum" || selectedPaymentMethod === "usdt") {
        queryParams.append("method", selectedPaymentMethod);
        // Mock address - in a real app this would be generated based on the selected cryptocurrency
        queryParams.append("address", "0x" + Math.random().toString(16).substring(2, 42));
      } else if (selectedPaymentMethod === "mpesa") {
        queryParams.append("method", "mpesa");
        queryParams.append("phone", phoneNumber);
      } else if (selectedPaymentMethod === "cash") {
        queryParams.append("method", "cash");
      }
      
      // For PayPal, don't navigate here as we redirect to PayPal
      // This check is already handled above in the PayPal payment processing section
      
      navigate(`/order-confirmation/${order.id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place your order",
        variant: "destructive",
      });
    }
  };

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p>Loading your cart...</p>
        </div>
      </>
    );
  }

  // Don't render checkout if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.product?.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {item.product?.short_description || item.product?.description?.substring(0, 100)}
                        </p>
                      </div>
                      <div className="font-medium">
                        {item.product?.currency} {item.product?.price?.toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mt-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mpesa"
                        checked={selectedPaymentMethod === "mpesa"}
                        onChange={() => handlePaymentMethodChange("mpesa")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="mpesa" size={20} />
                      <span>M-Pesa</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={selectedPaymentMethod === "paypal"}
                        onChange={() => handlePaymentMethodChange("paypal")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="card" size={20} />
                      <span>PayPal</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={selectedPaymentMethod === "cash"}
                        onChange={() => handlePaymentMethodChange("cash")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="cash" size={20} />
                      <span>Cash</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bitcoin"
                        checked={selectedPaymentMethod === "bitcoin"}
                        onChange={() => handlePaymentMethodChange("bitcoin")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="bitcoin" size={20} />
                      <span>Bitcoin</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ethereum"
                        checked={selectedPaymentMethod === "ethereum"}
                        onChange={() => handlePaymentMethodChange("ethereum")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="ethereum" size={20} />
                      <span>Ethereum</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="usdt"
                        checked={selectedPaymentMethod === "usdt"}
                        onChange={() => handlePaymentMethodChange("usdt")}
                        className="h-5 w-5"
                      />
                      <PaymentMethodIcon method="usdt" size={20} />
                      <span>USDT</span>
                    </label>
                  </div>
                </div>

                {selectedPaymentMethod === "mpesa" && (
                  <div className="mt-4">
                    <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      type="tel"
                      id="phoneNumber"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className="mt-1 w-full"
                    />
                  </div>
                )}

                {selectedPaymentMethod === "paypal" && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You will be redirected to PayPal to complete your payment securely.
                      After payment, you'll be redirected back to our site.
                    </p>
                  </div>
                )}

                {(selectedPaymentMethod === "bitcoin" || selectedPaymentMethod === "ethereum" || selectedPaymentMethod === "usdt") && (
                  <div className="mt-4">
                    <Label htmlFor="transactionReference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transaction Reference
                    </Label>
                    <Input
                      type="text"
                      id="transactionReference"
                      placeholder="Enter your transaction reference"
                      value={transactionReference}
                      onChange={handleTransactionReferenceChange}
                      className="mt-1 w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>KES {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>KES {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={handleTermsAcceptance}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    I agree to the <a href="/terms" className="text-blue-500">terms and conditions</a>
                  </label>
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={!termsAccepted}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      </div>
    </>
  );
};

export default Checkout;
