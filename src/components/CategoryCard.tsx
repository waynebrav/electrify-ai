
import React from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  image,
  productCount
}) => {
  return (
    <Link to={`/category/${id}`} className="category-card block">
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-300">{productCount} products</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
