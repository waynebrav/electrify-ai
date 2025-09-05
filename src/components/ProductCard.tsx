
import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Sparkles, ScanFace, BrainCircuit, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { HolographicContainer } from "@/components/ui/holographic-container";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  compatibilityScore?: number;
  hasAr?: boolean;
  has3D?: boolean;
  energyEfficiency?: string;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onViewAr?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  isNew,
  isFeatured,
  stockQuantity,
  compatibilityScore,
  hasAr = false,
  has3D = false,
  energyEfficiency = ["A+++", "A++", "A+", "A", "B", "C"][Math.floor(Math.random() * 6)],
  onAddToCart,
  onAddToWishlist,
  onViewAr
}) => {
  const discount = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;
  
  const { themeMode } = useTheme();
  const { formatPrice } = useCurrency();
  const isFuturistic = themeMode === "future" || themeMode === "cyberpunk";
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ProductCard handleAddToCart called for:", name);
    if (onAddToCart) onAddToCart();
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) onAddToWishlist();
  };
  
  const handleViewAr = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewAr) onViewAr();
    else {
      // Navigate to AR room with the product
      const url = new URL(window.location.origin + '/ar-room');
      window.location.href = url.toString();
    }
  };

  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };
  
  // Fix: Use div instead of Fragment to avoid props issues
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isFuturistic) {
      return (
        <HolographicContainer className="product-card group">
          {children}
        </HolographicContainer>
      );
    }
    return <div className="product-card group">{children}</div>;
  };
  
  return (
    <CardWrapper>
      <div className={cn(
        !isFuturistic && "rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md dark:border-gray-800 transition-all duration-300 bg-white dark:bg-gray-900 md:p-0 p-2 sm:p-3 shadow-glow-blue md:shadow-sm", // Add padding and shadow for mobile
        isFuturistic && "p-0.5"
      )}>
        <Link to={`/product/${id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary">
          <div className={cn(
            "relative",
            isFuturistic ? "rounded-xl overflow-hidden bg-gradient-to-br from-black to-gray-900" : ""
          )}>
            {/* Badges */}
            {(isNew || isFeatured || discount > 0 || has3D || hasAr) && (
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                {isNew && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    isFuturistic ? "bg-emerald-900/80 text-emerald-100" : "bg-green-100 text-green-800"
                  )}>
                    New
                  </span>
                )}
                {isFeatured && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    isFuturistic ? "bg-purple-900/80 text-purple-100" : "bg-purple-100 text-purple-800"
                  )}>
                    Featured
                  </span>
                )}
                {discount > 0 && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    isFuturistic ? "bg-red-900/80 text-red-100" : "bg-red-100 text-red-800"
                  )}>
                    {discount}% OFF
                  </span>
                )}
              </div>
            )}
            
            {/* Tech features badges */}
            {(has3D || hasAr) && (
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                {has3D && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    isFuturistic ? "bg-blue-900/80 text-blue-100" : "bg-blue-100 text-blue-800"
                  )}>
                    <Orbit className="w-3 h-3 mr-1" />
                    3D
                  </span>
                )}
                {hasAr && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    isFuturistic ? "bg-amber-900/80 text-amber-100" : "bg-amber-100 text-amber-800"
                  )}>
                    <ScanFace className="w-3 h-3 mr-1" />
                    AR
                  </span>
                )}
              </div>
            )}

            {/* Product image */}
            <div className={cn(
              "aspect-square w-full overflow-hidden mb-4 relative",
              isFuturistic ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gray-100 rounded-md"
            )}>
              <img
                src={image}
                alt={name}
                className={cn(
                  "h-full w-full object-cover object-center transition-all duration-500",
                  "group-hover:scale-105",
                  isFuturistic && "filter brightness-110 contrast-125",
                  "md:rounded-md rounded-lg"
                )}
                style={{ minHeight: '120px', maxHeight: '220px' }}
              />
              
              {isFuturistic && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </div>
            
            {/* Product information */}
            <div className="p-2 md:p-3 space-y-1 md:space-y-2">
              {/* Stock indicator */}
              {stockQuantity !== undefined && (
                <div className="mb-1 md:mb-2">
                  {stockQuantity > 10 ? (
                    <span className={cn(
                      "text-xs font-medium",
                      isFuturistic ? "text-green-400" : "text-green-600"
                    )}>
                      In Stock
                    </span>
                  ) : stockQuantity > 0 ? (
                    <span className={cn(
                      "text-xs font-medium",
                      isFuturistic ? "text-amber-400" : "text-amber-600"
                    )}>
                      Low Stock: {stockQuantity} left
                    </span>
                  ) : (
                    <span className={cn(
                      "text-xs font-medium",
                      isFuturistic ? "text-red-400" : "text-red-600"
                    )}>
                      Out of Stock
                    </span>
                  )}
                </div>
              )}

              <h3 className={cn(
                "text-sm font-medium line-clamp-2 h-10 md:h-12 text-left md:text-base",
                isFuturistic && "text-gray-100"
              )}>
                {name}
              </h3>
              
              {/* Ratings display */}
              <div className="mt-1 md:mt-2 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.floor(rating) 
                          ? isFuturistic 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span className={cn(
                  "ml-1 text-xs",
                  isFuturistic ? "text-gray-400" : "text-gray-500"
                )}>
                  ({reviewCount})
                </span>
              </div>
              
              {/* Price display */}
              <div className="mt-1 md:mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "font-medium",
                    isFuturistic && "text-white"
                  )}>
                    {formatCurrency(price)}
                  </span>
                  {originalPrice && (
                    <span className={cn(
                      "text-xs line-through",
                      isFuturistic ? "text-gray-500" : "text-gray-500"
                    )}>
                      {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>
                
                {/* Efficiency rating */}
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  energyEfficiency === "A+++" || energyEfficiency === "A++" 
                    ? isFuturistic 
                      ? "bg-green-900/80 text-green-100" 
                      : "bg-green-100 text-green-800"
                    : energyEfficiency === "A+" || energyEfficiency === "A"
                    ? isFuturistic
                      ? "bg-blue-900/80 text-blue-100"
                      : "bg-blue-100 text-blue-800"
                    : isFuturistic
                      ? "bg-amber-900/80 text-amber-100"
                      : "bg-amber-100 text-amber-800"
                )}>
                  {energyEfficiency}
                </span>
              </div>
              
              {/* Compatibility score for futuristic theme only */}
              {isFuturistic && compatibilityScore !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <BrainCircuit className="h-3 w-3 text-blue-400 mr-1" />
                      <span className="text-xs text-gray-400">Compatibility</span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      compatibilityScore > 85 ? "text-green-400" :
                      compatibilityScore > 70 ? "text-blue-400" : "text-amber-400"
                    )}>
                      {compatibilityScore || Math.round(70 + Math.random() * 25)}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full",
                        compatibilityScore > 85 ? "bg-green-400" : 
                        compatibilityScore > 70 ? "bg-blue-400" : "bg-amber-400"
                      )}
                      style={{ width: `${compatibilityScore || Math.round(70 + Math.random() * 25)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className={cn(
              "p-2 md:p-3 pt-0 flex flex-col gap-2 md:gap-1",
              isFuturistic ? "product-actions-future" : "product-actions"
            )}>
              <div className="flex gap-2 md:grid md:grid-cols-3 md:gap-1">
                <Button 
                  size="sm" 
                  variant={isFuturistic ? "default" : (themeMode === 'dark' ? 'default' : 'secondary')} 
                  className={cn(
                    "flex-1 text-xs md:col-span-2 py-2 md:py-1",
                    isFuturistic && "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-1 h-4 w-4 md:h-3 md:w-3" />
                  <span className="hidden xs:inline">Add to Cart</span>
                  <span className="inline xs:hidden">Cart</span>
                </Button>
                <Button 
                  size="sm" 
                  variant={isFuturistic ? "outline" : (themeMode === 'dark' ? 'outline' : 'secondary')} 
                  className={cn(
                    "flex-shrink-0 p-2 md:p-0",
                    isFuturistic && "border-gray-700 hover:bg-gray-800"
                  )}
                  onClick={handleAddToWishlist}
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-4 w-4 md:h-3 md:w-3" />
                </Button>
              </div>
              
              {hasAr && (
                <Button
                  size="sm"
                  variant={isFuturistic ? "default" : "outline"}
                  className={cn(
                    "w-full mt-1 text-xs py-2 md:py-1",
                    isFuturistic && "bg-purple-600 hover:bg-purple-700"
                  )}
                  onClick={handleViewAr}
                >
                  <ScanFace className="mr-1 h-4 w-4 md:h-3 md:w-3" />
                  <span className="hidden xs:inline">View in Your Space</span>
                  <span className="inline xs:hidden">AR</span>
                </Button>
              )}
            </div>
            
            {/* Special effect for featured products */}
            {isFeatured && isFuturistic && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
            )}
          </div>
        </Link>
      </div>
    </CardWrapper>
  );
};

export default ProductCard;
