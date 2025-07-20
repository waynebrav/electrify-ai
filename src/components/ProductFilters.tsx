
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  SlidersHorizontal,
  Filter,
  CheckSquare,
  Star,
  Tags,
  ChevronDown
} from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: { id: string; name: string }[];
  brands: string[];
  maxPrice: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  rating: number | null;
  sortBy: string;
  inStock: boolean;
}

const ProductFilters: React.FC<FilterProps> = ({
  onFilterChange,
  categories = [],
  brands = [],
  maxPrice = 100000
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, maxPrice],
    categories: [],
    brands: [],
    rating: null,
    sortBy: "featured",
    inStock: false
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRangeDisplay, setPriceRangeDisplay] = useState<[number, number]>([0, maxPrice]);

  const handlePriceChange = (value: number[]) => {
    const priceRange: [number, number] = [value[0], value[1]];
    setPriceRangeDisplay(priceRange);
  };

  const handlePriceCommit = (value: number[]) => {
    const priceRange: [number, number] = [value[0], value[1]];
    setFilters(prev => ({ ...prev, priceRange }));
    onFilterChange({ ...filters, priceRange });
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      const newFilters = { ...prev, categories };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => {
      const brands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];
      
      const newFilters = { ...prev, brands };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const setRating = (rating: number | null) => {
    setFilters(prev => {
      const newRating = prev.rating === rating ? null : rating;
      const newFilters = { ...prev, rating: newRating };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const toggleInStock = () => {
    setFilters(prev => {
      const newFilters = { ...prev, inStock: !prev.inStock };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, sortBy: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, maxPrice],
      categories: [],
      brands: [],
      rating: null,
      sortBy: "featured",
      inStock: false
    };
    setFilters(resetFilters);
    setPriceRangeDisplay([0, maxPrice]);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Mobile filters toggle */}
      <div className="flex md:hidden justify-between items-center">
        <Button 
          variant="outline" 
          className="w-full flex justify-between items-center"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <span className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {/* Sort by - always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Sort by:</span>
        </div>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile filters */}
      <div className={`md:hidden ${isMobileFiltersOpen ? 'block' : 'hidden'} border rounded-lg p-4`}>
        <div className="flex flex-col space-y-4">
          {/* Price Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Price Range</h3>
            <div className="pt-2 px-1">
              <Slider
                defaultValue={[0, maxPrice]}
                min={0}
                max={maxPrice}
                step={100}
                value={[priceRangeDisplay[0], priceRangeDisplay[1]]}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                className="my-6"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">
                {CURRENCY.symbol} {priceRangeDisplay[0].toLocaleString()}
              </span>
              <span className="text-xs">
                {CURRENCY.symbol} {priceRangeDisplay[1].toLocaleString()}
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Tags className="h-4 w-4 mr-1" /> Categories
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label htmlFor={`mobile-category-${category.id}`} className="text-sm">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <CheckSquare className="h-4 w-4 mr-1" /> Brands
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label htmlFor={`mobile-brand-${brand}`} className="text-sm">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-1" /> Rating
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mobile-rating-${rating}`}
                    checked={filters.rating === rating}
                    onCheckedChange={() => setRating(rating)}
                  />
                  <label htmlFor={`mobile-rating-${rating}`} className="text-sm flex items-center">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
                    ))}
                    <span className="ml-1">& Up</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mobile-in-stock"
              checked={filters.inStock}
              onCheckedChange={toggleInStock}
            />
            <label htmlFor="mobile-in-stock" className="text-sm font-medium">
              In Stock Only
            </label>
          </div>

          {/* Clear filters */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Desktop filters - always visible */}
      <div className="hidden md:block border rounded-lg p-4">
        <Accordion type="multiple" defaultValue={["price", "categories", "brands", "rating"]}>
          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm">Price Range</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 px-1">
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={[priceRangeDisplay[0], priceRangeDisplay[1]]}
                  onValueChange={handlePriceChange}
                  onValueCommit={handlePriceCommit}
                  className="my-6"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">
                  {CURRENCY.symbol} {priceRangeDisplay[0].toLocaleString()}
                </span>
                <span className="text-xs">
                  {CURRENCY.symbol} {priceRangeDisplay[1].toLocaleString()}
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categories */}
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm">Categories</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`} className="text-sm">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brands */}
          <AccordionItem value="brands">
            <AccordionTrigger className="text-sm">Brands</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                {brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={() => toggleBrand(brand)}
                    />
                    <label htmlFor={`brand-${brand}`} className="text-sm">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating */}
          <AccordionItem value="rating">
            <AccordionTrigger className="text-sm">Rating</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={() => setRating(rating)}
                    />
                    <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
                      ))}
                      <span className="ml-1">& Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* In Stock */}
        <div className="mt-4 flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={toggleInStock}
          />
          <label htmlFor="in-stock" className="text-sm font-medium">
            In Stock Only
          </label>
        </div>

        {/* Clear filters */}
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
