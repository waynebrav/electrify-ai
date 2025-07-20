
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CategoryCard from "./CategoryCard";

const CategoriesSection: React.FC = () => {
  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          image_url,
          products (id)
        `)
        .limit(6);
      
      if (error) throw error;
      
      return data.map(category => ({
        id: category.slug,
        name: category.name,
        image: category.image_url || `https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=500&auto=format&fit=crop&q=60`,
        productCount: category.products?.length || 0
      }));
    }
  });

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <Link to="/products" className="text-primary hover:text-primary/80 flex items-center text-sm font-medium">
            All Products
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              image={category.image}
              productCount={category.productCount}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
