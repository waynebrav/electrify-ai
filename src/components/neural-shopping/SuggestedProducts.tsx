
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SuggestedProductsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestedProducts = ({ onSuggestionClick }: SuggestedProductsProps) => {
  const { data: recentProducts } = useQuery({
    queryKey: ['recent-products-neural'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, 
            product_images (url, is_primary)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const productsWithPrimaryImage = (data || []).map((product: any) => {
            const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url;
            const fallbackImage = product.product_images && product.product_images[0] ? product.product_images[0].url : '/placeholder.svg';
            return {
                ...product,
                imageUrl: primaryImage || fallbackImage
            };
        });
        return productsWithPrimaryImage;
      } catch (error) {
        console.error("Error fetching recent products:", error);
        return [];
      }
    },
  });

  const categories = ["Electronics", "Fashion", "Home", "Beauty"];

  return (
    <div className="hidden md:block">
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <ShoppingBag className="h-4 w-4 mr-1" /> 
        Suggested Products
      </h3>
      
      <div className="space-y-2">
        {recentProducts ? (
          recentProducts.slice(0, 5).map((product: any) => (
            <div 
              key={product.id} 
              className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => onSuggestionClick(`Tell me more about ${product.name}`)}
            >
              <div className="w-10 h-10 rounded bg-muted mr-2 overflow-hidden flex-shrink-0">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-sm overflow-hidden">
                <p className="truncate font-medium">{product.name}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Suggested Categories</h3>
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <Badge 
              key={category}
              className="cursor-pointer"
              variant="outline"
              onClick={() => onSuggestionClick(`Show me popular products in ${category}`)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestedProducts;
