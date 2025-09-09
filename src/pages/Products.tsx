
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Layout } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FilterOptions } from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

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
  stockQuantity?: number;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 100000],
    categories: [],
    brands: [],
    rating: null,
    sortBy: "featured",
    inStock: false
  });
  const [gridView, setGridView] = useState<boolean>(true);
  const categorySlug = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const searchQuery = searchParams.get('q');
  const navigate = useNavigate();

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch brands for filter
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);
      
      if (error) throw error;
      
      // Extract unique brands
      const uniqueBrands = [...new Set(data.map(item => item.brand))].filter(Boolean).sort();
      return uniqueBrands;
    }
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', filters, categorySlug, brandParam, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          original_price,
          is_new,
          is_featured,
          stock_quantity,
          image_url,
          image_url_1,
          image_url_2,
          image_url_3
        `);
      
      // Apply filters
      if (filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }
      
      if (filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }
      
      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }
      
      if (brandParam) {
        query = query.eq('brand', brandParam);
      }
      
      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Apply price range filter
      query = query.gte('price', filters.priceRange[0])
                   .lte('price', filters.priceRange[1]);
      
      // Apply search query
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Apply sort
      switch (filters.sortBy) {
        case 'price-low-high':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high-low':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          // Note: Ideally, you would have a rating field or a ratings relation
          // For now, we'll just use a placeholder sort
          query = query.order('is_featured', { ascending: false });
          break;
        default:
          // Default sort by featured and then by newest
          query = query.order('is_featured', { ascending: false })
                       .order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format data for our component
      return data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price,
        image: item.image_url || item.image_url_1 || item.image_url_2 || '/placeholder.svg',
        // Mock data for demo
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 200) + 1,
        isNew: item.is_new,
        isFeatured: item.is_featured,
        stockQuantity: item.stock_quantity
      }));
    },
  });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      // Get user information
      const { data: { user } } = await supabase.auth.getUser();
      
      let cartId;
      
      if (user) {
        // Get or create user cart
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (!cart) {
          // Create new cart for user
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
      } else {
        navigate("/login");
        return;
      }
      
      // Check if product already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();
      
      if (existingItem) {
        // Update quantity if item exists
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        // Insert new cart item
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
      // Get user information
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to add items to your wishlist",
          variant: "default",
        });
        return;
      }
      
      // Get or create user wishlist
      let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
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
        .single();
      
      if (existingItem) {
        // Item already in wishlist
        toast({
          title: "Already in wishlist",
          description: "This product is already in your wishlist",
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

  const handleViewAr = (productId: string) => {
    window.location.href = `/ar-room?productId=${productId}`;
  };

  // Initialize filters from URL params on first load
  useEffect(() => {
    if (categorySlug && categories) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setFilters(prev => ({
          ...prev,
          categories: [category.id]
        }));
      }
    }

    if (brandParam && brands) {
      if (brands.includes(brandParam)) {
        setFilters(prev => ({
          ...prev,
          brands: [brandParam]
        }));
      }
    }
  }, [categorySlug, brandParam, categories, brands]);

  // Get current category name if filtering by category
  const currentCategory = categorySlug && categories 
    ? categories.find(cat => cat.slug === categorySlug)?.name 
    : null;

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
            {currentCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>{currentCategory}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {brandParam && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>{brandParam}</BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </Breadcrumb>
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              {currentCategory || brandParam || searchQuery 
                ? `${currentCategory || brandParam || 'Search results for "' + searchQuery + '"'}`
                : 'All Products'}
            </h1>
            {searchQuery && (
              <p className="text-gray-600 mt-1">
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="md:col-span-1">
              <ProductFilters 
                onFilterChange={handleFilterChange}
                categories={categories || []}
                brands={brands || []}
                maxPrice={100000}
              />
            </div>
            
            {/* Products Grid */}
            <div className="md:col-span-3">
              {/* View Toggle and Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  {isLoading 
                    ? 'Loading products...' 
                    : `${products?.length || 0} products found`}
                </p>
                <div className="flex items-center gap-2">
                  <Toggle 
                    pressed={gridView} 
                    onPressedChange={setGridView}
                    variant="outline"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Toggle>
                  <Toggle 
                    pressed={!gridView} 
                    onPressedChange={(pressed) => setGridView(!pressed)}
                    variant="outline"
                    aria-label="List view"
                  >
                    <Layout className="h-4 w-4" />
                  </Toggle>
                </div>
              </div>
              
              {isLoading ? (
                // Loading skeleton
                <div className={`grid ${gridView 
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-1'} gap-4 md:gap-6`}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                // Products grid/list
                <div className={`${gridView 
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
                  : 'space-y-4'}`}>
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
                      stockQuantity={product.stockQuantity}
                      onAddToCart={() => handleAddToCart(product.id)}
                      onAddToWishlist={() => handleAddToWishlist(product.id)}
                      onViewAr={() => handleViewAr(product.id)}
                    />
                  ))}
                </div>
              ) : (
                // No products found
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No products found</h3>
                  <p className="text-gray-600 mt-2">Try adjusting your filters or search criteria.</p>
                  <Button 
                    onClick={() => setFilters({
                      priceRange: [0, 100000],
                      categories: [],
                      brands: [],
                      rating: null,
                      sortBy: "featured",
                      inStock: false
                    })}
                    className="mt-4"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;
