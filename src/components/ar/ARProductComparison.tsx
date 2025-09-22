import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Star, ArrowLeftRight, ShoppingCart, Heart, Eye } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  rating: number;
  reviewCount: number;
  specifications: { [key: string]: string };
  features: string[];
  category: string;
}

interface ARProductComparisonProps {
  products: Product[];
  maxCompareItems?: number;
  onAddToCart: (productId: string) => void;
  onAddToWishlist: (productId: string) => void;
  onViewAR: (productId: string) => void;
}

const ARProductComparison: React.FC<ARProductComparisonProps> = ({
  products,
  maxCompareItems = 3,
  onAddToCart,
  onAddToWishlist,
  onViewAR
}) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addToCompare = (product: Product) => {
    if (compareList.length >= maxCompareItems) {
      return; // Could show a toast here
    }
    
    if (!compareList.find(p => p.id === product.id)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Get all unique specification keys
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap(product => Object.keys(product.specifications || {})))
  );

  // Get all unique features
  const allFeatures = Array.from(
    new Set(compareList.flatMap(product => product.features || []))
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowLeftRight className="h-5 w-5 mr-2" />
            Product Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <CurrencyDisplay amount={product.price} className="font-bold text-sm" />
                  <Button
                    size="sm"
                    variant={compareList.find(p => p.id === product.id) ? "default" : "outline"}
                    onClick={() => {
                      const isInCompare = compareList.find(p => p.id === product.id);
                      if (isInCompare) {
                        removeFromCompare(product.id);
                      } else {
                        addToCompare(product);
                      }
                    }}
                    disabled={!compareList.find(p => p.id === product.id) && compareList.length >= maxCompareItems}
                  >
                    {compareList.find(p => p.id === product.id) ? 'Remove' : 'Compare'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {compareList.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {compareList.length} item(s) selected for comparison
                </span>
                <Button variant="outline" size="sm" onClick={clearCompare}>
                  Clear All
                </Button>
              </div>
              <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                <DialogTrigger asChild>
                  <Button disabled={compareList.length < 2}>
                    Compare Products ({compareList.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Product Comparison</DialogTitle>
                  </DialogHeader>
                  
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-3 border-b font-medium min-w-[150px]">Product</th>
                          {compareList.map((product) => (
                            <th key={product.id} className="p-3 border-b border-l min-w-[200px]">
                              <div className="space-y-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1"
                                  onClick={() => removeFromCompare(product.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-32 object-cover rounded"
                                />
                                <h4 className="font-medium text-sm">{product.name}</h4>
                                <Badge variant="outline">{product.category}</Badge>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Price Row */}
                        <tr className="hover:bg-muted/50">
                          <td className="p-3 border-b font-medium">Price</td>
                          {compareList.map((product) => (
                            <td key={product.id} className="p-3 border-b border-l">
                              <div className="font-bold text-lg">
                                <CurrencyDisplay amount={product.price} />
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Rating Row */}
                        <tr className="hover:bg-muted/50">
                          <td className="p-3 border-b font-medium">Rating</td>
                          {compareList.map((product) => (
                            <td key={product.id} className="p-3 border-b border-l">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {renderStars(product.rating)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  ({product.reviewCount})
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Specifications */}
                        {allSpecKeys.map((specKey) => (
                          <tr key={specKey} className="hover:bg-muted/50">
                            <td className="p-3 border-b font-medium capitalize">
                              {specKey.replace(/_/g, ' ')}
                            </td>
                            {compareList.map((product) => (
                              <td key={product.id} className="p-3 border-b border-l">
                                {product.specifications?.[specKey] || 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}

                        {/* Features */}
                        <tr className="hover:bg-muted/50">
                          <td className="p-3 border-b font-medium">Features</td>
                          {compareList.map((product) => (
                            <td key={product.id} className="p-3 border-b border-l">
                              <div className="space-y-1">
                                {allFeatures.map((feature) => (
                                  <div key={feature} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      product.features?.includes(feature) 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-300'
                                    }`} />
                                    <span className={`text-sm ${
                                      product.features?.includes(feature) 
                                        ? 'text-foreground' 
                                        : 'text-muted-foreground'
                                    }`}>
                                      {feature}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Actions Row */}
                        <tr>
                          <td className="p-3 font-medium">Actions</td>
                          {compareList.map((product) => (
                            <td key={product.id} className="p-3 border-l">
                              <div className="space-y-2">
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => onAddToCart(product.id)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => onAddToWishlist(product.id)}
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => onViewAR(product.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ARProductComparison;