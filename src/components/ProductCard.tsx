import React from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Star, ShoppingCart, Tag, Store } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, params?: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, vendors } = useShop();

  const storeName = vendors.find(v => v.id === product.vendor_id)?.store_name || 'Official Reseller';
  
  // Create a realistic visual Jumia mock discount (e.g., 20% off original calculated value or simple set parameters)
  const discountRate = product.price > 500 ? 15 : product.price < 50 ? 10 : 25;
  const originalPrice = Math.round(product.price / (1 - discountRate / 100));

  // High quality random visual rating associated to ID to keep deterministic
  const cleanIdSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratingValue = 4 + (cleanIdSum % 10) / 10;
  const reviewsCount = 15 + (cleanIdSum % 85);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div 
      onClick={() => onNavigate('product-detail', { productId: product.id })}
      className="bg-white rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden group hover:-translate-y-1"
      id={`product-card-${product.id}`}
    >
      {/* Discount Tag */}
      <span className="absolute top-2.5 left-2.5 bg-red-500 text-white font-mono font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs z-10 flex items-center">
        <Tag className="w-2.5 h-2.5 mr-0.5" />
        -{discountRate}%
      </span>

      {/* Image Block */}
      <div className="aspect-square w-full bg-gray-50 flex items-center justify-center relative overflow-hidden shrink-0">
        <img
          src={product.image_urls[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80'}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Out of stock cover overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-gray-800 text-white font-extrabold text-[10px] uppercase py-1 px-2.5 rounded">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category & Shop Name */}
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 gap-2">
          <span className="truncate">{product.category}</span>
          <span 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('storefront', { vendorId: product.vendor_id });
            }}
            className="text-orange-600 hover:text-orange-700 hover:underline flex items-center transition truncate"
            title={`View storefront ${storeName}`}
          >
            <Store className="w-2.5 h-2.5 mr-0.5 shrink-0" />
            {storeName}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors h-9">
          {product.title}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center space-x-1 border-t border-gray-50 pt-2 mt-2">
          <div className="flex text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(ratingValue) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400">({reviewsCount})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline space-x-2 mt-2.5">
          <span className="font-extrabold text-orange-600 text-sm sm:text-base">
            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-gray-400 line-through">
            ${originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Add To Cart Segment */}
        <div className="mt-4 pt-1">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2 px-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
