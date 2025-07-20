
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import FlashSalesCard from "./FlashSalesCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  endDate: string;
  percentageSold: number;
}

const FlashSalesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: flashSaleProducts, isLoading } = useQuery({
    queryKey: ["flash-sale-products"],
    queryFn: async () => {
      try {
        // Query products marked as flash sales
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            price,
            original_price,
            flash_sale_end,
            stock_quantity,
            product_images (url, is_primary)
          `)
          .eq("is_flash_sale", true)
          .limit(10);

        if (error) {
          console.error("Error fetching flash sale products:", error);
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Format data for the component
        return data
          .filter(product => product.flash_sale_end && new Date(product.flash_sale_end) > new Date())
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.original_price,
            image: product.product_images?.find((img: any) => img.is_primary)?.url || 
                  (product.product_images && product.product_images[0] ? product.product_images[0].url : '/placeholder.svg'),
            endDate: product.flash_sale_end,
            percentageSold: Math.min(
              Math.floor(Math.random() * (100 - 30) + 30), // Generate a random percentage between 30-99%
              99 // Cap at 99% to create urgency
            )
          }));
      } catch (error) {
        console.error("Error processing flash sale products:", error);
        return [];
      }
    },
    staleTime: 60 * 1000, // Refresh data every minute
  });

  const navigateFlash = (direction: "prev" | "next") => {
    if (!flashSaleProducts || flashSaleProducts.length === 0) return;
  
    if (direction === "prev") {
      setCurrentIndex(prev => 
        prev === 0 ? flashSaleProducts.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex(prev => 
        prev === flashSaleProducts.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Auto rotate every 5 seconds
  useEffect(() => {
    if (!flashSaleProducts || flashSaleProducts.length <= 1) return;

    const interval = setInterval(() => {
      navigateFlash("next");
    }, 5000);

    return () => clearInterval(interval);
  }, [flashSaleProducts, currentIndex]);

  // Handle case where no flash sales are available
  if (!isLoading && (!flashSaleProducts || flashSaleProducts.length === 0)) {
    return null; // Don't render the section at all
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 future:bg-future-gradient cyberpunk:bg-cyber-gradient">
      <div className="container px-4">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
            Flash Sales <span className="text-red-500">⚡</span>
          </h2>
          
          <div className="relative w-full max-w-md">
            {isLoading ? (
              <div className="aspect-[3/4] w-full">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : flashSaleProducts && flashSaleProducts.length > 0 ? (
              <>
                <div className="relative overflow-hidden rounded-lg">
                  {flashSaleProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className={`transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0 absolute top-0 left-0"
                      }`}
                      style={{ zIndex: index === currentIndex ? 1 : 0 }}
                    >
                      <FlashSalesCard 
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice || undefined}
                        image={product.image}
                        endDate={product.endDate}
                        percentageSold={product.percentageSold}
                      />
                    </div>
                  ))}
                </div>
                
                {flashSaleProducts.length > 1 && (
                  <div className="flex justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 px-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateFlash("prev")}
                      className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Previous sale</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateFlash("next")}
                      className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40"
                    >
                      <ChevronRight className="h-5 w-5" />
                      <span className="sr-only">Next sale</span>
                    </Button>
                  </div>
                )}
                
                {/* Pagination indicators */}
                {flashSaleProducts.length > 1 && (
                  <div className="flex justify-center mt-4 gap-1.5">
                    {flashSaleProducts.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex 
                            ? "bg-primary w-4" 
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to sale ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSalesSection;
