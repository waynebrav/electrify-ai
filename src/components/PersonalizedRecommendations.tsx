import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  Eye,
  ArrowRight,
  Star,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string;
  rating?: number;
  category?: string;
  is_featured: boolean;
  ar_enabled: boolean;
}

interface PersonalizedRecommendationsProps {
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
  className?: string;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  onAddToCart,
  onAddToWishlist,
  onViewProduct,
  className = ''
}) => {
  const { user } = useAuth();

  // Fetch user's purchase history and preferences
  const { data: userAnalytics } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('favorite_category_id, total_spent, last_purchase_date')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch recently viewed products (from localStorage for demo)
  const getRecentlyViewed = (): string[] => {
    try {
      const recent = localStorage.getItem('recentlyViewed');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  };

  // Fetch personalized recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalized-recommendations', user?.id, userAnalytics],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          currency,
          image_url,
          category_id,
          is_featured,
          ar_enabled,
          categories (name)
        `)
        .eq('status', 'Active')
        .limit(8);

      // If user has favorite category, prioritize those products
      if (userAnalytics?.favorite_category_id) {
        query = query.eq('category_id', userAnalytics.favorite_category_id);
      } else {
        // For new users, show featured products
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Add mock ratings and format data
      return data?.map(product => ({
        ...product,
        rating: 4 + Math.random(),
        category: (product as any).categories?.name
      })) || [];
    },
  });

  // Fetch trending products
  const { data: trending } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          currency,
          image_url,
          is_featured,
          ar_enabled,
          categories (name)
        `)
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data?.map(product => ({
        ...product,
        rating: 4 + Math.random(),
        category: (product as any).categories?.name
      })) || [];
    },
  });

  // Fetch recently viewed products details
  const { data: recentlyViewed } = useQuery({
    queryKey: ['recently-viewed'],
    queryFn: async () => {
      const recentIds = getRecentlyViewed().slice(0, 4);
      if (recentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          currency,
          image_url,
          is_featured,
          ar_enabled,
          categories (name)
        `)
        .in('id', recentIds)
        .eq('status', 'Active');

      if (error) throw error;
      return data?.map(product => ({
        ...product,
        rating: 4 + Math.random(),
        category: (product as any).categories?.name
      })) || [];
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ product, showBadge = false }: { product: Product; showBadge?: boolean }) => (
    <div className="group cursor-pointer" onClick={() => onViewProduct?.(product.id)}>
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {showBadge && product.ar_enabled && (
          <Badge className="absolute top-2 left-2 bg-purple-500">AR</Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>
        )}
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist?.(product.id);
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product.id);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          {product.ar_enabled && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to AR view
                window.location.href = `/ar-room?productId=${product.id}`;
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
        <div className="flex items-center gap-1">
          <div className="flex">
            {renderStars(product.rating || 4.5)}
          </div>
          <span className="text-xs text-muted-foreground">(4.5)</span>
        </div>
        <div className="flex items-center justify-between">
          <CurrencyDisplay
            amount={product.price}
            fromCurrency={product.currency}
            className="font-semibold"
          />
          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const LoadingCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            {user ? (
              userAnalytics?.favorite_category_id 
                ? 'Recommended for You'
                : 'Popular Picks for New Shoppers'
            ) : 'Featured Products'}
          </CardTitle>
          {user && userAnalytics && (
            <p className="text-sm text-muted-foreground">
              Based on your shopping preferences and purchase history
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingCards />
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} showBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No recommendations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to get personalized recommendations!
              </p>
              <Button>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Now */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Trending Now
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What other customers are loving right now
          </p>
        </CardHeader>
        <CardContent>
          {trending && trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <LoadingCards />
          )}
        </CardContent>
      </Card>

      {/* Recently Viewed */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recently Viewed
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Continue where you left off
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Insights */}
      {user && userAnalytics && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Your Shopping Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Total spent: <CurrencyDisplay amount={userAnalytics.total_spent} className="font-medium" />
                  {userAnalytics.last_purchase_date && (
                    <span className="ml-2">
                      • Last purchase: {new Date(userAnalytics.last_purchase_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                View All Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;