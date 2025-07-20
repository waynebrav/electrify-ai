import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const FeaturedProducts: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          original_price,
          is_new,
          is_featured,
          stock_quantity,
          product_images (url, is_primary)
        `)
        .eq("is_featured", true)
        .eq("status", "Active")
        .limit(8);
      
      if (error) {
        console.error("Error fetching featured products:", error);
        throw error;
      }
      
      // Format data for the component
      return data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price,
        image: product.product_images?.find((img: any) => img.is_primary)?.url || 
               (product.product_images && product.product_images[0] ? product.product_images[0].url : '/placeholder.svg'),
        // Mock data for demo purposes
        rating: 4 + Math.random() * 0.9,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        isNew: product.is_new,
        isFeatured: product.is_featured,
        stockQuantity: product.stock_quantity
      }));
    }
  });

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      console.log(`Adding ${productName} (ID: ${productId}) to cart...`);
      console.log("Current user:", user ? user.id : "Guest user");
      
      let cartId;
      
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        return;
      }

      console.log("User is authenticated:", user.id);
      // Get or create user cart using UUID user ID
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (cartError) {
        console.error("Error fetching user cart:", cartError);
        throw cartError;
      }
      
      if (!cart) {
        console.log("Creating new cart for user");
        // Create new cart for user
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ 
            user_id: user.id
          })
          .select('id')
          .single();
        
        if (error) {
          console.error("Error creating user cart:", error);
          throw error;
        }
        cartId = newCart.id;
        console.log("Created new cart with ID:", cartId);
      } else {
        cartId = cart.id;
        console.log("Using existing cart with ID:", cartId);
      }
      
      console.log("Using cart ID:", cartId);
      
      // Check if product already exists in cart
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (existingError) {
        console.error("Error checking existing cart item:", existingError);
        throw existingError;
      }
      
      if (existingItem) {
        console.log("Updating existing cart item");
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) {
          console.error("Error updating cart item:", error);
          throw error;
        }
      } else {
        console.log("Inserting new cart item");
        // Insert new cart item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity: 1
          });
        
        if (error) {
          console.error("Error inserting cart item:", error);
          throw error;
        }
      }
      
      console.log("Successfully added to cart");
      
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
      
      // Get or create user wishlist using UUID user ID
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

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Featured Products
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Discover our hand-picked selection of premium products
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="hidden md:flex items-center">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))
          ) : featuredProducts && featuredProducts.length > 0 ? (
            // Show featured products
            featuredProducts.map((product) => (
              <div key={product.id} className="group">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  isNew={product.isNew}
                  isFeatured={product.isFeatured}
                  onAddToCart={() => {
                    console.log("ProductCard onAddToCart clicked for:", product.name);
                    handleAddToCart(product.id, product.name);
                  }}
                  onAddToWishlist={() => handleAddToWishlist(product.id, product.name)}
                />
                
                {/* Quick action buttons for better UX */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Quick Add button clicked for:", product.name);
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
            // No products found
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                No featured products available at the moment.
              </p>
              <Link to="/products" className="mt-4 inline-block">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile view all button */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/products">
            <Button variant="outline" className="w-full">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
