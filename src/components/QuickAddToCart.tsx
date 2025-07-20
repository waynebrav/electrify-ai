import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart } from "lucide-react";

const QuickAddToCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addSampleProductToCart = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get a sample product (first one from the database)
      const { data: product } = await supabase
        .from('products')
        .select('id, name')
        .eq('status', 'Active')
        .limit(1)
        .single();

      if (!product) {
        toast({
          title: "No products available",
          description: "No products found in the database.",
          variant: "destructive",
        });
        return;
      }

      // Get or create user cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (cartError) throw cartError;
      
      if (!cart) {
        // Create new cart for user
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (error) throw error;
        cart = newCart;
      }
      
      // Check if product already exists in cart
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .maybeSingle();
      
      if (existingError) throw existingError;
      
      if (existingItem) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Insert new cart item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: 1
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Do not render any button or UI
  return null;
};

export default QuickAddToCart; 