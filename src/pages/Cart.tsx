import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  product: {
    name: string;
    price: number;
    slug: string;
    currency: string;
    description?: string;
    short_description?: string;
  };
}

const Cart = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

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
      
      // Set up real-time subscription for cart updates
      const channel = supabase
        .channel('cart_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'cart_items' 
        }, () => {
          fetchCartItems();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
      
      // Get user's cart using authenticated user ID
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartError) {
        console.error("Error fetching user cart:", cartError);
        setCartItems([]);
        setLoading(false);
        return;
      }

      const cartId = cart?.id;

      if (!cartId) {
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
        .eq("cart_id", cartId);

      if (error) {
        console.error("Error fetching cart items:", error);
        throw error;
      }

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

  const updateItemQuantity = async (itemId: string, productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        await removeCartItem(itemId);
        return;
      }
      
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);
        
      if (error) throw error;
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      setTotalAmount(prev => {
        const itemPrice = cartItems.find(item => item.id === itemId)?.product?.price || 0;
        const oldQuantity = cartItems.find(item => item.id === itemId)?.quantity || 0;
        const difference = (newQuantity - oldQuantity) * itemPrice;
        return prev + difference;
      });
      
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated"
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);
        
      if (error) throw error;
      
      const removedItem = cartItems.find(item => item.id === itemId);
      const removedItemTotal = (removedItem?.product?.price || 0) * (removedItem?.quantity || 0);
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setTotalAmount(prev => prev - removedItemTotal);
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart"
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          <p>Loading your cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render cart if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
                    
                    {cartItems.map((item) => (
                      <div key={item.id} className="mb-6 last:mb-0">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product?.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                              {item.product?.short_description || item.product?.description?.substring(0, 100)}
                            </p>
                            <div className="mt-2 font-medium">
                              {item.product?.currency} {item.product?.price?.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateItemQuantity(item.id, item.product_id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateItemQuantity(item.id, item.product_id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
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
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>KES {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      onClick={() => navigate("/checkout")}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;