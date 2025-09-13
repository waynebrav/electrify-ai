import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductRecommendations from "@/components/ProductRecommendations";
import FlashSalesSection from "@/components/FlashSalesSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  stockQuantity: number;
}

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Category slug is required');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Fetch products in this category
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', category?.id],
    queryFn: async () => {
      if (!category?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
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
        .eq('category_id', category.id)
        .eq('status', 'Active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price,
        image: item.product_images.find((img: any) => img.is_primary)?.url || 
               (item.product_images[0]?.url || 'https://images.unsplash.com/photo-1593642634367-d91a135587b5'),
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 200) + 1,
        isNew: item.is_new,
        isFeatured: item.is_featured,
        stockQuantity: item.stock_quantity
      }));
    },
    enabled: !!category?.id
  });

  const handleAddToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let cartId;
      if (!user) {
        toast({
          title: "Login required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
        return;
      }

      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!cart) {
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        if (error) throw error;
        cartId = newCart.id;
      } else {
        cartId = cart.id;
      }
      
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();
      
      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity: 1
          });
      }
      
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to add items to your wishlist",
        });
        return;
      }
      
      let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!wishlist) {
        const { data: newWishlist, error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        if (error) throw error;
        wishlist = newWishlist;
      }
      
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('wishlist_id', wishlist.id)
        .eq('product_id', productId)
        .single();
      
      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: "This product is already in your wishlist",
        });
      } else {
        await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlist.id,
            product_id: productId
          });
        
        toast({
          title: "Added to wishlist",
          description: "Product has been added to your wishlist",
        });
      }
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Could not add product to wishlist",
        variant: "destructive",
      });
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link to="/products" className="text-primary hover:underline">
              Browse All Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container py-6 md:py-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{category.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
            )}
          </div>
          
          {/* Flash Sales Section */}
          <FlashSalesSection />
          
          
          {/* Products Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">All {category.name} Products</h2>
            
            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice ?? undefined}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    isNew={product.isNew}
                    isFeatured={product.isFeatured}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onAddToWishlist={() => handleAddToWishlist(product.id)}
                    onViewAr={() => window.location.href = `/ar-room?productId=${product.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No products found in this category.</p>
                <Link to="/products" className="text-primary hover:underline">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;