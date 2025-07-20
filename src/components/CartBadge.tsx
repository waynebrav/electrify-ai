
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { themeMode } = useTheme();
  const { user } = useAuth();
  const isFuturistic = themeMode === "future" || themeMode === "cyberpunk";

  useEffect(() => {
    fetchCartItemCount();

    // Set up subscription to cart changes
    const channel = supabase
      .channel('cart_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cart_items' 
      }, () => {
        fetchCartItemCount();
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCartItemCount = async () => {
    if (!user) {
      setItemCount(0);
      return;
    }
    
    try {
      // Get user cart using authenticated user ID only
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cartError) {
        console.error("Error fetching user cart:", cartError);
        setItemCount(0);
        return;
      }

      const cartId = cart?.id;

      if (cartId) {
        // Get cart items count
        const { count, error } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact' })
          .eq('cart_id', cartId);

        if (error) {
          console.error("Error fetching cart items count:", error);
          setItemCount(0);
        } else {
          setItemCount(count || 0);
        }
      } else {
        setItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart item count:', error);
      setItemCount(0);
    }
  };

  const badgeClass = cn(
    "absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white",
    isAnimating ? "animate-pulse" : "",
    isFuturistic ? (
      themeMode === "future" 
        ? "bg-blue-500 h-5 w-5 border border-blue-300 shadow-glow-blue"
        : "bg-pink-600 h-5 w-5 border border-pink-400 shadow-glow-red"
    ) : "bg-orange-500 h-5 w-5"
  );

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link to="/cart">
        <ShoppingCart className={cn(
          "h-5 w-5",
          isAnimating && isFuturistic && "text-blue-400"
        )} />
        {itemCount > 0 && (
          <span className={badgeClass}>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </Link>
    </Button>
  );
}
