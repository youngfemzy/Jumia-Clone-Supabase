import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from './ProductCard';
import { 
  Star, 
  ShoppingCart, 
  Store, 
  Truck, 
  ShieldCheck, 
  CornerDownLeft, 
  Tag, 
  Minus, 
  Plus, 
  Heart,
  Share2
} from 'lucide-react';

export const ViewProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, addToCart, vendors } = useShop();
  const { success: toastSuccess } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  const product = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [products, productId]);

  const [activeImage, setActiveImage] = useState<string>('');

  // Auto set active image on product change
  React.useEffect(() => {
    if (product?.image_urls?.[0]) {
      setActiveImage(product.image_urls[0]);
    }
  }, [product]);

  const vendor = useMemo(() => {
    if (!product) return null;
    return vendors.find(v => v.id === product.vendor_id);
  }, [vendors, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 text-sm">Product details unavailable or item deleted.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded mt-4 cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const discountRate = product.price > 500 ? 15 : product.price < 50 ? 10 : 25;
  const originalPrice = Math.round(product.price / (1 - discountRate / 100));

  // Rating metrics linked deterministically
  const cleanIdSum = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratingValue = 4 + (cleanIdSum % 10) / 10;
  const reviewsCount = 15 + (cleanIdSum % 85);

  const handleDecrease = () => setQuantity(q => q > 1 ? q - 1 : 1);
  const handleIncrease = () => setQuantity(q => q < product.stock ? q + 1 : q);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toastSuccess(`Successfully added ${quantity}x of "${product.title}" to your cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Category Navigation Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold mb-6">
        <span className="hover:text-gray-600 transition cursor-pointer" onClick={() => navigate('/')}>Marketplace</span>
        <span>/</span>
        <span className="hover:text-gray-600 transition cursor-pointer" onClick={() => navigate(`/category/${product.category}`)}>{product.category}</span>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLL: IMAGE GALLERY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square w-full bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden p-4 shadow-2xs">
            <img
              src={activeImage || product.image_urls[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Miniature List */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.image_urls.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded border bg-white flex items-center justify-center p-1 shrink-0 ${
                    activeImage === img ? 'border-orange-500 border-2' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="Miniature" className="max-h-full max-w-full object-contain rounded" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MIDDLE COLL: CORE INFO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <span className="bg-orange-500/10 text-orange-700 font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded inline-block">
              {product.category}
            </span>
            <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-snug">
              {product.title}
            </h1>

            {/* Vendor Redirect Label */}
            {vendor && (
              <div 
                onClick={() => navigate(`/store/${vendor.id}`)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer py-1 block"
              >
                <Store className="w-4 h-4 shrink-0" />
                <span>Shop storefront: {vendor.store_name}</span>
              </div>
            )}

            {/* Ratings Summary */}
            <div className="flex items-center space-x-2 pt-1 border-b border-gray-50 pb-4">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className={`w-4 h-4 ${idx < Math.floor(ratingValue) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500 font-mono">{ratingValue} / 5</span>
              <span className="text-xs text-gray-400">({reviewsCount} customers verified reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="space-y-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100/30">
            <span className="text-[10px] text-orange-600 uppercase tracking-widest font-extrabold block">PROMOTIONAL FLASH PRICE</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-600">
                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ${originalPrice.toLocaleString()}
              </span>
              <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                -{discountRate}%
              </span>
            </div>
            
            <p className="text-[10px] text-gray-400 font-semibold">
              Tax included. Free return labels included.
            </p>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Purchase Quantity</span>
              <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                <button 
                  onClick={handleDecrease}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                  title="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold font-mono text-gray-800">{quantity}</span>
                <button 
                  onClick={handleIncrease}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                  title="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dynamic Stock Warn */}
            <p className="text-xs font-semibold">
              Availability: {product.stock > 0 ? (
                <span className="text-emerald-600 font-bold">In Stock ({product.stock} items remaining)</span>
              ) : (
                <span className="text-red-500 font-bold">Temporarily Sold Out</span>
              )}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-6 rounded-lg font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                  product.stock <= 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10'
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span>Add to Cart</span>
              </button>

              <button 
                onClick={() => setFavorite(!favorite)}
                className={`p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer ${
                  favorite ? 'text-red-500 border-red-200 bg-red-50/20' : 'text-gray-400 border-gray-200'
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-t border-gray-100 pt-5 space-y-2">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Product Specifications</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

        </div>

        {/* RIGHT COLL: DELIVERY & POLICIES (Jumia Style Sidebar) */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white rounded-xl border border-gray-150 p-5 space-y-5 shadow-2xs">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b border-gray-50">
              Delivery Logistics
            </h3>

            {/* Policy item 1 */}
            <div className="flex items-start space-x-3 text-xs leading-normal">
              <Truck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800">Standard Shipping Doorstep</p>
                <p className="text-gray-500 text-[11px] mt-0.5">Delivered in 2-4 business days. Insured package tracking provided.</p>
              </div>
            </div>

            {/* Policy item 2 */}
            <div className="flex items-start space-x-3 text-xs leading-normal">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800">Authorized Merchant Pledge</p>
                <p className="text-gray-500 text-[11px] mt-0.5">Real products directly verified from authorized providers, no duplicates.</p>
              </div>
            </div>

            {/* Policy item 3 */}
            <div className="flex items-start space-x-3 text-xs leading-normal">
              <CornerDownLeft className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800">14-Days Ease Returns</p>
                <p className="text-gray-500 text-[11px] mt-0.5">Easy mail-in or hub return box dropoffs if package does not match descriptors.</p>
              </div>
            </div>
          </div>

          {/* Selling Store Summary Panel */}
          {vendor && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 text-center space-y-3">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Storefront Partner</p>
              
              {vendor.logo_url && (
                <img 
                  src={vendor.logo_url} 
                  alt={vendor.store_name} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full mx-auto object-cover border border-gray-200" 
                />
              )}
              
              <div>
                <p className="font-bold text-gray-800 text-sm">{vendor.store_name}</p>
                <p className="text-[11px] text-gray-400 italic line-clamp-2 mt-1 px-2">{vendor.description}</p>
              </div>

              <button
                onClick={() => navigate(`/store/${vendor.id}`)}
                className="w-full py-2 border border-orange-500 hover:bg-orange-500 hover:text-white text-orange-600 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer"
              >
                Explore Partner Store
              </button>
            </div>
          )}

        </div>

      </div>

      {/* RECOMMENDED PRODUCTS SECTION (CAROUSEL) */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 pt-12 mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-md sm:text-lg font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
              <Tag className="w-4 h-4 text-orange-500 mr-2" /> You may also like (Similar items)
            </h2>
            <button 
              onClick={() => navigate(`/category/${product.category}`)}
              className="text-orange-500 hover:text-orange-600 font-bold text-xs uppercase transition hover:underline"
            >
              See All Items
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
