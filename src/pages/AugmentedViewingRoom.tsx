
import React, { useState, useEffect } from "react";
import { Box, PanelRightClose, PanelLeftOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ARViewer from "@/components/ar/ARViewer";
import ARProductList from "@/components/ar/ARProductList";
import ARInfoSection from "@/components/ar/ARInfoSection";
import { Button } from "@/components/ui/button";

const AugmentedViewingRoom = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

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
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)} className="flex-shrink-0">
              {isPanelCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
              <span className="sr-only">{isPanelCollapsed ? 'Show panel' : 'Hide panel'}</span>
            </Button>
          </div>
          
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

          <ARInfoSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AugmentedViewingRoom;
