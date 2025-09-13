import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FlashSalesCard from "@/components/FlashSalesCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, TrendingUp } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  endDate: string;
  percentageSold: number;
}

const FlashSales = () => {
  const [sortBy, setSortBy] = useState("ending-soon");

  const { data: flashSaleProducts, isLoading } = useQuery({
    queryKey: ["flash-sale-products", sortBy],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, 
            name, 
            price, 
            original_price,
            image_url,
            image_url_1,
            image_url_2,
            image_url_3,
            flash_sale_end,
            stock_quantity,
            is_flash_sale
          `)
          .eq("is_flash_sale", true)
          .eq("status", "Active")
          .not("flash_sale_end", "is", null);

        if (error) {
          console.error("Error fetching flash sale products:", error);
          return [];
        }

        if (!data) return [];

        // Filter out expired flash sales and format data
        const validProducts = data
          .filter(product => product.flash_sale_end && new Date(product.flash_sale_end) > new Date())
          .map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.original_price,
            image: product.image_url || product.image_url_1 || product.image_url_2 || product.image_url_3 || '/placeholder.svg',
            endDate: product.flash_sale_end,
            percentageSold: Math.floor(Math.random() * 80) + 10, // Mock data for percentage sold
          }));

        // Sort products based on selected option
        switch (sortBy) {
          case "ending-soon":
            return validProducts.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
          case "most-popular":
            return validProducts.sort((a, b) => b.percentageSold - a.percentageSold);
          case "price-low":
            return validProducts.sort((a, b) => a.price - b.price);
          case "price-high":
            return validProducts.sort((a, b) => b.price - a.price);
          default:
            return validProducts;
        }
      } catch (error) {
        console.error("Error processing flash sale products:", error);
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute to update timers
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Flash Sales
            </h1>
            <Zap className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Limited-time offers on your favorite products. Don't miss out on these incredible deals!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 text-center border">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{flashSaleProducts?.length || 0}</h3>
            <p className="text-muted-foreground">Active Flash Sales</p>
          </div>
          <div className="bg-card rounded-lg p-6 text-center border">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">Up to 70%</h3>
            <p className="text-muted-foreground">Maximum Discount</p>
          </div>
          <div className="bg-card rounded-lg p-6 text-center border">
            <Zap className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">Limited Time</h3>
            <p className="text-muted-foreground">Hurry While Stocks Last</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="most-popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : flashSaleProducts && flashSaleProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flashSaleProducts.map((product) => (
              <FlashSalesCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Flash Sales Available</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for amazing flash sale deals!
            </p>
            <Button onClick={() => window.location.href = "/products"}>
              Browse All Products
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FlashSales;