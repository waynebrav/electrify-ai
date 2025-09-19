
import React, { useState, useEffect } from "react";
import { Box, PanelRightClose, PanelLeftOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ARViewer from "@/components/ar/ARViewer";
import ARProductList from "@/components/ar/ARProductList";
import ARInfoSection from "@/components/ar/ARInfoSection";
import ARSupermarket from "@/components/ar/ARSupermarket";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AugmentedViewingRoom = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'products' | 'supermarket'>('supermarket');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: arProducts, isLoading: isLoadingProducts, error } = useQuery({
    queryKey: ['ar-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          currency,
          model_3d_url,
          categories (id, name),
          product_images (url, is_primary)
        `)
        .eq('ar_enabled', true);
      
      if (error) {
        console.error("Error fetching AR products:", error);
        throw new Error(error.message);
      }

      if (!data) {
        return [];
      }
      
      const productsWithPrimaryImage = data
        .map(product => {
          const primaryImage = Array.isArray(product.product_images) 
            ? product.product_images.find(img => img.is_primary)
            : null;
            
          return {
            ...product,
            product_images: primaryImage ? [{ url: primaryImage.url }] : [],
          };
        })
        .filter(product => product.product_images.length > 0);

      return productsWithPrimaryImage;
    }
  });

  useEffect(() => {
    if (!selectedProduct && arProducts && arProducts.length > 0) {
      setSelectedProduct(arProducts[0]);
    }
  }, [arProducts, selectedProduct]);

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    if (!isARActive) {
      setIsARActive(true);
    }
  };

  const handleLaunchAR = () => {
    setIsARActive(true);
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get or create user cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!cart) {
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (error) throw error;
        cart = newCart;
      }
      
      // Check if product already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
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
            cart_id: cart.id,
            product_id: productId,
            quantity: 1
          });
      }
      
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart`,
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gradient-to-b from-background to-background/80 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center gap-4">
            <div className="flex-grow">
              <h1 className="text-4xl font-bold mb-4 flex items-center">
                <Box className="mr-3 h-8 w-8" />
                Augmented Viewing Room
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Experience products in your space using augmented reality technology
              </p>
              
              {/* View Mode Toggle */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={viewMode === 'supermarket' ? 'default' : 'outline'}
                  onClick={() => setViewMode('supermarket')}
                >
                  AR Supermarket
                </Button>
                <Button
                  variant={viewMode === 'products' ? 'default' : 'outline'}
                  onClick={() => setViewMode('products')}
                >
                  Product Gallery
                </Button>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)} className="flex-shrink-0">
              {isPanelCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
              <span className="sr-only">{isPanelCollapsed ? 'Show panel' : 'Hide panel'}</span>
            </Button>
          </div>
          
          {viewMode === 'supermarket' ? (
            <div className="mb-8">
              <ARSupermarket onAddToCart={handleAddToCart} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className={`transition-all duration-300 ${isPanelCollapsed ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                <ARViewer 
                  isARActive={isARActive}
                  selectedProduct={selectedProduct}
                  onLaunchAR={handleLaunchAR}
                />
              </div>
              
              <div className={`lg:col-span-1 ${isPanelCollapsed ? 'hidden' : 'block'}`}>
                <ARProductList
                  arProducts={arProducts}
                  isLoading={isLoadingProducts}
                  error={error as Error | null}
                  onSelectProduct={handleSelectProduct}
                />
              </div>
            </div>
          )}

          <ARInfoSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AugmentedViewingRoom;
