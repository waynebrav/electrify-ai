
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface FlashSaleProductProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  endDate: string;
  percentageSold: number;
  discountPercentage?: number;
  onAddToCart?: () => void;
}

const FlashSaleCard: React.FC<FlashSaleProductProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  endDate,
  percentageSold,
  discountPercentage = 0,
  onAddToCart
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  // Safely get currency formatting with fallback
  let formatPrice: (price: number, fromCurrency?: string) => string;
  try {
    const currencyContext = useCurrency();
    formatPrice = currencyContext.formatPrice;
  } catch (error) {
    console.error('FlashSalesCard: Error accessing currency context:', error);
    formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(endDate);
      const difference = endTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      return { hours, minutes, seconds };
    };

    // Set initial times
    setTimeLeft(calculateTimeLeft());

    // Update countdown every second
    const timer = setInterval(() => {
      const timeLeftValues = calculateTimeLeft();
      setTimeLeft(timeLeftValues);
      
      if (timeLeftValues.hours === 0 && timeLeftValues.minutes === 0 && timeLeftValues.seconds === 0) {
        clearInterval(timer);
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const stockQuantity = 100 - percentageSold; // Calculate remaining stock
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isExpired || stockQuantity <= 0) return;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      // Get or create cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (cartError) throw cartError;
        cart = newCart;
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', id)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: id,
            quantity: 1
          });
        
        if (error) throw error;
      }

      // Show success toast or notification
      console.log('Item added to cart successfully');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
    
    if (onAddToCart) onAddToCart();
  };

  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };
  
  return (
    <Link to={`/product/${id}`} className="block">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all hover:shadow-lg">
        {/* Discount badge */}
        {(originalPrice || discountPercentage > 0) && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="destructive" className="text-xs font-bold">
              {discountPercentage > 0 ? discountPercentage : discount}% OFF
            </Badge>
          </div>
        )}
        
        {/* Product image */}
        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-4">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center transition-all duration-300 hover:scale-105"
          />
          
          {/* Countdown overlay */}
          {!isExpired ? (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-2 py-1">
              <div className="flex items-center justify-center text-xs gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 bg-red-900/70 text-white px-2 py-1">
              <div className="flex items-center justify-center text-xs">
                <span>Sale Ended</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Product title */}
        <h3 className="text-sm font-medium line-clamp-2 h-10">{name}</h3>
        
        {/* Price section */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-medium">{formatCurrency(price)}</span>
            {originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
        </div>
        
        {/* Stock status */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Sold: {percentageSold}%</span>
            <span>Available: {stockQuantity}%</span>
          </div>
          <Progress value={percentageSold} className="h-1" />
        </div>
        
        {/* Add to cart button */}
        <Button 
          size="sm" 
          variant="default" 
          className="mt-3 w-full"
          disabled={isExpired || stockQuantity <= 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-1 h-3 w-3" />
          {stockQuantity > 0 ? "Add to Cart" : "Sold Out"}
        </Button>
      </div>
    </Link>
  );
};

export default FlashSaleCard;
