import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingCart, ArrowRight, Heart } from "lucide-react";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  similarity_score?: number;
  original_price?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
}

interface ProductRecommendationsProps {
  productId?: string;
  className?: string;
}

const ProductRecommendations = ({ productId, className = "" }: ProductRecommendationsProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [user, productId]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('product-recommendations', {
        body: {
          userId: user?.id || null,
          productId: productId || null,
          userPreferences: profile?.preferences || null
        }
      });

      if (error) throw error;

      // Format the recommendations to match the expected structure
      const formattedRecommendations = (data.recommendations || []).map((product: any) => ({
        ...product,
        image: product.image_url || product.image_url_1 || product.image_url_2 || product.image_url_3 || '/placeholder.svg',
        rating: 4 + Math.random() * 0.9,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        isNew: Math.random() > 0.7,
        isFeatured: false,
        stockQuantity: Math.floor(Math.random() * 50) + 10
      }));

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        return;
      }

      let cartId;
      
      // Get or create user cart using UUID user ID
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
          .insert({ 
            user_id: user.id
          })
          .select('id')
          .single();
        
        if (error) throw error;
        cartId = newCart.id;
      } else {
        cartId = cart.id;
      }
      
      // Check if product already exists in cart
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
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
            cart_id: cartId,
            product_id: productId,
            quantity: 1
          });
        
        if (error) throw error;
      }
      
      // Show success message
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
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

  const handleAddToWishlist = async (productId: string, productName: string) => {
    try {
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to add items to your wishlist.",
          variant: "destructive",
        });
        return;
      }
      
      // Get or create user wishlist
      let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!wishlist) {
        // Create new wishlist for user
        const { data: newWishlist, error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (error) throw error;
        wishlist = newWishlist;
      }
      
      // Check if product already exists in wishlist
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: `${productName} is already in your wishlist.`,
        });
      } else {
        // Insert new wishlist item
        await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlist.id,
            product_id: productId
          });
        
        toast({
          title: "Added to wishlist",
          description: `${productName} has been added to your wishlist.`,
        });
      }
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900 w-screen relative left-1/2 -translate-x-1/2">
      <div className="w-full px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              Recommended Products
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered product recommendations tailored to your preferences
            </p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex items-center"
            onClick={() => navigate("/products")}
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))
          ) : recommendations && recommendations.length > 0 ? (
            recommendations.map((product) => (
              <div key={product.id} className="group">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.image}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  isNew={product.isNew}
                  isFeatured={product.isFeatured}
                  stockQuantity={product.stockQuantity}
                  onAddToCart={() => handleAddToCart(product.id, product.name)}
                  onAddToWishlist={() => handleAddToWishlist(product.id, product.name)}
                />
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product.id, product.name);
                    }}
                    disabled={product.stockQuantity <= 0}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {product.stockQuantity <= 0 ? "Out of Stock" : "Quick Add"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No recommendations available at the moment.
              </p>
              <Button onClick={() => navigate("/products")} className="mt-4">Browse All Products</Button>
            </div>
          )}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>View All Products<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;