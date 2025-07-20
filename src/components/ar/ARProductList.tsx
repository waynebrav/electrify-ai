
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ServerCrash, Tag } from 'lucide-react';

interface ARProductListProps {
  arProducts: any[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onSelectProduct: (product: any) => void;
}

const ARProductList = ({ arProducts, isLoading, error, onSelectProduct }: ARProductListProps) => {
  const productsByCategory = useMemo(() => {
    if (!arProducts) return {};
    return arProducts.reduce((acc, product) => {
      const categoryName = product.categories?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, any[]>);
  }, [arProducts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Try Products in AR</CardTitle>
        <CardDescription>Select a product to view in 3D</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center p-8 text-destructive">
             <ServerCrash className="h-8 w-8 mb-2" />
             <p>Failed to load products.</p>
           </div>
        ) : Object.keys(productsByCategory).length === 0 ? (
          <p className="text-center text-muted-foreground p-8">No AR-enabled products found.</p>
        ) : (
          <Accordion type="single" collapsible defaultValue={Object.keys(productsByCategory)[0]}>
            {Object.entries(productsByCategory).map(([category, products]) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="text-base font-semibold">{category}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {Array.isArray(products) && products.map(product => (
                      <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer" onClick={() => onSelectProduct(product)}>
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                          <img src={product.product_images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'KES' }).format(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default ARProductList;
