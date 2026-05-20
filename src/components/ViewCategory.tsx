import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES, CategoryType } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star } from 'lucide-react';

interface ViewCategoryProps {
  initialCategory?: CategoryType;
  initialSearch?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ViewCategory: React.FC<ViewCategoryProps> = ({ initialCategory, initialSearch, onNavigate }) => {
  const { products, searchQuery, setSearchQuery } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>(initialCategory || 'All');
  const [priceRange, setPriceRange] = useState<number>(3500);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [minRating, setMinRating] = useState<number>(0);

  // Filters calculation
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category Filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      // Price Filter
      if (product.price > priceRange) {
        return false;
      }
      // Text Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      // Rating Filter (approximated logically from string index)
      const cleanIdSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const rating = 4 + (cleanIdSum % 10) / 10;
      if (minRating > 0 && rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort Logic
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0; // default featured
    });
  }, [products, selectedCategory, priceRange, searchQuery, sortOption, minRating]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setPriceRange(3500);
    setSortOption('featured');
    setSearchQuery('');
    setMinRating(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 mb-8 text-white shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory === 'All' ? 'Marketplace Catalogue' : selectedCategory}
        </h1>
        <p className="text-xs text-orange-50 opacity-90 mt-1 font-medium">
          Found {filteredProducts.length} premium products matching your specifications.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFTSIDE FILTERS COLUMN */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-5 shadow-xs sticky top-32">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Filters
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-orange-500 hover:text-orange-600 text-[10px] font-bold uppercase transition hover:underline flex items-center"
              >
                <RefreshCw className="w-2.5 h-2.5 mr-1" /> Reset All
              </button>
            </div>

            {/* Category Groups */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition duration-200 font-medium ${
                    selectedCategory === 'All' 
                      ? 'bg-orange-50 text-orange-600 font-semibold' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition duration-200 font-medium ${
                      selectedCategory === cat 
                        ? 'bg-orange-50 text-orange-600 font-bold' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slide Filter */}
            <div className="border-t border-gray-50 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Max Price</h4>
                <span className="font-mono text-xs font-bold text-orange-600">${priceRange}</span>
              </div>
              <input
                type="range"
                min="5"
                max="3500"
                step="25"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                <span>$5</span>
                <span>$3500</span>
              </div>
            </div>

            {/* Rating Filter Group */}
            <div className="border-t border-gray-50 pt-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Rating</h4>
              <div className="space-y-1.5">
                {[4, 3, 2, 0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`w-full text-left px-2 py-1 rounded text-xs flex items-center space-x-1.5 transition ${
                      minRating === rate ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {rate === 0 ? (
                      <span>Any Rating</span>
                    ) : (
                      <>
                        <div className="flex text-amber-500">
                          {Array.from({ length: rate }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                          {Array.from({ length: 5 - rate }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 text-gray-200" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold">& up</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHTSIDE CAT LIST GRID */}
        <div className="flex-1 space-y-6">
          
          {/* Top Sort Controls */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <span className="text-xs text-gray-500">
              Showing <strong className="text-gray-800">{filteredProducts.length}</strong> of <strong className="text-gray-800">{products.length}</strong> products
            </span>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-gray-400 font-semibold shrink-0 flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort By:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-xs rounded font-semibold text-gray-700 outline-none focus:border-orange-500 cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="featured">Featured / Best matches</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid Container */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-100 py-24 text-center px-4">
              <div className="p-3 bg-orange-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-orange-500">
                <SlidersHorizontal className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">No matching products</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
                We couldn't locate any products matching your specific pricing structures or search attributes. Try reducing your filter strictness.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm cursor-pointer"
              >
                Reset Catalogue Benches
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
