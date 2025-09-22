import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, ShoppingCart, Trash2, Share2, ArrowRight } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    currency: string;
    image_url: string;
    ar_enabled: boolean;
    is_featured: boolean;
    stock_quantity: number;
  };
}

interface ARWishlistIntegrationProps {
  onViewInAR: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  className?: string;
}

const ARWishlistIntegration: React.FC<ARWishlistIntegrationProps> = ({
  onViewInAR,
  onAddToCart,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch wishlist items
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get or create wishlist
      let { data: wishlist } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!wishlist) {
        const { data: newWishlist, error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (error) throw error;
        wishlist = newWishlist;
      }

      // Get wishlist items with product details
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            currency,
            image_url,
            ar_enabled,
            is_featured,
            stock_quantity
          )
        `)
        .eq('wishlist_id', wishlist.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .in('id', itemIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setSelectedItems([]);
      toast({
        title: "Removed from wishlist",
        description: "Items have been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not remove items from wishlist",
        variant: "destructive",
      });
    },
  });

  // Move to cart mutation
  const moveToCartMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      if (!user) throw new Error('User not authenticated');

      // Get or create cart
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

      // Add products to cart
      for (const productId of productIds) {
        // Check if already in cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', productId)
          .single();
        
        if (existingItem) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + 1 })
            .eq('id', existingItem.id);
        } else {
          // Insert new item
          await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: productId,
              quantity: 1
            });
        }
      }

      // Remove from wishlist
      const itemsToRemove = wishlistItems?.filter(item => 
        productIds.includes(item.product_id)
      ).map(item => item.id) || [];
      
      if (itemsToRemove.length > 0) {
        await supabase
          .from('wishlist_items')
          .delete()
          .in('id', itemsToRemove);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setSelectedItems([]);
      toast({
        title: "Moved to cart",
        description: "Items have been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not move items to cart",
        variant: "destructive",
      });
    },
  });

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems?.map(item => item.id) || []);
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length > 0) {
      removeFromWishlistMutation.mutate(selectedItems);
    }
  };

  const handleMoveToCart = () => {
    const selectedProductIds = wishlistItems
      ?.filter(item => selectedItems.includes(item.id))
      .map(item => item.product_id) || [];
    
    if (selectedProductIds.length > 0) {
      moveToCartMutation.mutate(selectedProductIds);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Wishlist link copied to clipboard",
      });
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign in to view your wishlist</h3>
          <p className="text-muted-foreground">
            Save your favorite products and view them in AR
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            My Wishlist ({wishlistItems?.length || 0})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {wishlistItems && wishlistItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedItems.length === wishlistItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            {selectedItems.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMoveToCart}
                  disabled={moveToCartMutation.isPending}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move to Cart ({selectedItems.length})
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveSelected}
                  disabled={removeFromWishlistMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove ({selectedItems.length})
                </Button>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-32 rounded-lg mb-2" />
                <div className="bg-muted h-4 rounded mb-1" />
                <div className="bg-muted h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !wishlistItems || wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start adding products you love to your wishlist
            </p>
            <Button>
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 relative">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="absolute top-2 left-2 z-10"
                />
                
                <img
                  src={item.products.image_url || '/placeholder.svg'}
                  alt={item.products.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1">
                      {item.products.name}
                    </h4>
                    {item.products.is_featured && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <CurrencyDisplay 
                      amount={item.products.price} 
                      fromCurrency={item.products.currency}
                      className="font-bold"
                    />
                    
                    {item.products.stock_quantity > 0 ? (
                      <Badge variant="outline" className="text-xs text-green-600">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onAddToCart(item.product_id)}
                      disabled={item.products.stock_quantity === 0}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Cart
                    </Button>
                    
                    {item.products.ar_enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onViewInAR(item.product_id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        AR
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ARWishlistIntegration;