import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ShoppingCart, Heart, ArrowLeft, Star, Package, Clock, Shield, Truck, Eye } from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
}

interface ProductSpecification {
  id: string;
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string;
  short_description: string;
  stock_quantity: number;
  brand: string;
  model: string;
  sku: string;
  category_id: string;
  warranty_info: string;
  return_policy: string;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  currency: string;
  product_images: ProductImage[];
  product_specifications: ProductSpecification[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

const ProductDetail = () => {
  const { id, slug } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMoreDescription, setShowMoreDescription] = useState(false);

  // Fetch product data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id || slug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          product_specifications (*),
          category:category_id (id, name, slug)
        `);

      if (id) {
        query = query.eq('id', id);
      } else if (slug) {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();
      
      if (error) throw error;
      return data as Product;
    },
  });

  useEffect(() => {
    if (product?.product_images?.length > 0) {
      // Set primary image as selected, or first image if no primary exists
      const primaryImage = product.product_images.find(img => img.is_primary);
      setSelectedImage(primaryImage?.url || product.product_images[0]?.url);
    }
  }, [product]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && (!product || newQuantity <= product.stock_quantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      console.log("Adding product to cart...");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      
      let cartId;
      
      if (user) {
        // Get or create user cart
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!cart) {
          console.log("Creating new cart for user");
          const { data: newCart, error } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select('id')
            .single();
          
          if (error) {
            console.error("Error creating cart:", error);
            throw error;
          }
          cartId = newCart.id;
        } else {
          cartId = cart.id;
        }
      } else {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to cart",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Using cart ID:", cartId);
      
      // Check if product already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product.id)
        .maybeSingle();
      
      if (existingItem) {
        // Update quantity if item exists
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
          
        if (error) throw error;
      } else {
        // Insert new cart item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: product.id,
            quantity: quantity
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
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

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to add items to your wishlist",
          variant: "default",
        });
        return;
      }
      
      let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
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
        .eq('product_id', product.id)
        .maybeSingle();
      
      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: `${product.name} is already in your wishlist`,
        });
      } else {
        await supabase
          .from('wishlist_items')
          .insert({
            wishlist_id: wishlist.id,
            product_id: product.id
          });
        
        toast({
          title: "Added to wishlist",
          description: `${product.name} added to your wishlist`,
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

  const formatPrice = (price: number) => {
    return `${CURRENCY.symbol} ${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container flex-grow flex items-center justify-center py-12">
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container flex-grow flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container py-6 md:py-10">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/categories/${product.category.slug}`}>
                    {product.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {/* Thumbnails */}
              {product.product_images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.product_images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.url)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === image.url ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-2">
                {product.is_new && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    New
                  </Badge>
                )}
                {product.is_bestseller && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    Bestseller
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge variant="destructive">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              
              {/* Brand & SKU */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                {product.brand && (
                  <span>
                    Brand: <span className="font-medium">{product.brand}</span>
                  </span>
                )}
                {product.sku && (
                  <span>
                    SKU: <span className="font-medium">{product.sku}</span>
                  </span>
                )}
              </div>
              
              {/* Price */}
              <div className="flex items-end gap-2 mt-4">
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <span className="text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                )}
              </div>
              
              {/* Short Description */}
              {product.short_description && (
                <p className="mt-4 text-gray-700">{product.short_description}</p>
              )}
              
              {/* Stock Status */}
              <div className="mt-6">
                {product.stock_quantity > 0 ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    In Stock ({product.stock_quantity} available)
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    Out of Stock
                  </div>
                )}
              </div>
              
              {/* Quantity Selector */}
              <div className="mt-6">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center mt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3"
                  >
                    -
                  </Button>
                  <span className="w-16 text-center">{quantity}</span>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.stock_quantity <= quantity}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  className="flex-1"
                  size="lg"
                  disabled={product.stock_quantity <= 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>
              
              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium">Free Shipping</h4>
                    <p className="text-xs text-gray-600">For orders over KSh 5,000</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium">Fast Delivery</h4>
                    <p className="text-xs text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <h4 className="text-sm font-medium">Warranty</h4>
                    <p className="text-xs text-gray-600">
                      {product.warranty_info || "Standard manufacturer warranty"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none dark:prose-invert">
                {product.description && (
                  <div>
                    <div 
                      className={`${!showMoreDescription && 'max-h-60 overflow-hidden relative'}`}
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    >
                    </div>
                    {product.description.length > 300 && (
                      <Button
                        variant="ghost" 
                        onClick={() => setShowMoreDescription(!showMoreDescription)}
                        className="mt-2"
                      >
                        {showMoreDescription ? "Show Less" : "Read More"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="border rounded-lg divide-y">
                {product.product_specifications.length > 0 ? (
                  product.product_specifications.map((spec) => (
                    <div key={spec.id} className="grid grid-cols-3 py-3 px-4">
                      <dt className="font-medium text-sm">{spec.name}</dt>
                      <dd className="col-span-2 text-sm">{spec.value}</dd>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No specifications available
                  </div>
                )}
                
                {/* Additional common specs */}
                {product.brand && (
                  <div className="grid grid-cols-3 py-3 px-4">
                    <dt className="font-medium text-sm">Brand</dt>
                    <dd className="col-span-2 text-sm">{product.brand}</dd>
                  </div>
                )}
                {product.model && (
                  <div className="grid grid-cols-3 py-3 px-4">
                    <dt className="font-medium text-sm">Model</dt>
                    <dd className="col-span-2 text-sm">{product.model}</dd>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Shipping</h3>
                  <p className="text-gray-700">
                    We offer free shipping on orders above KSh 5,000. Orders are typically processed within 24 hours and delivered within 2-3 business days in Nairobi and 3-5 business days in other parts of Kenya.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Returns & Warranty</h3>
                  <p className="text-gray-700">
                    {product.return_policy || "We offer a 7-day return policy for unused items in original packaging. Please contact our customer support to initiate a return."}
                  </p>
                  <p className="text-gray-700 mt-2">
                    Warranty: {product.warranty_info || "Standard manufacturer warranty applies to this product."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
