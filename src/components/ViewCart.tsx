import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Trash2, ArrowLeft, ShieldAlert, Plus, Minus, Tag } from 'lucide-react';

interface ViewCartProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ViewCart: React.FC<ViewCartProps> = ({ onNavigate }) => {
  const { cartItems, updateCartQuantity, removeFromCart, cartTotal, clearCart } = useShop();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 mb-8 flex items-center">
        <ShoppingBag className="w-6 h-6 mr-2 text-orange-500" /> Shopping Cart
        <span className="text-xs bg-gray-100 text-gray-500 font-normal px-2.5 py-1 rounded-full ml-3 font-mono">
          {cartCount} items
        </span>
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLL: LIST OF ITEMS */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-xs">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const itemSubtotal = product.price * item.quantity;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Visual details */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.title} 
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain rounded" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] bg-orange-50 text-orange-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                        <h3 
                          onClick={() => onNavigate('product-detail', { productId: product.id })}
                          className="font-bold text-gray-800 text-xs sm:text-sm hover:underline hover:text-orange-500 cursor-pointer line-clamp-2 max-w-md leading-snug"
                        >
                          {product.title}
                        </h3>
                        <p className="text-xs font-semibold text-orange-500">
                          ${product.price} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifiers & Pricing */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                        <button 
                          onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                          title="Reduce"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-gray-800">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <p className="font-extrabold text-orange-600 text-xs sm:text-sm font-mono">
                          ${itemSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs">
              <button 
                onClick={() => onNavigate('home')}
                className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold uppercase transition"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Continue Shopping
              </button>

              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 font-bold uppercase hover:underline transition cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* RIGHT COLL: SUMMARY PAYMENT & CHECKOUT ACTIONS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 shadow-xs">
              <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b border-gray-50">
                Order Summary
              </h2>

              <div className="space-y-3 leading-loose text-xs font-semibold text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal sum</span>
                  <span className="text-gray-800 font-mono">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping insurance</span>
                  <span className="text-emerald-600 font-bold font-mono">FREE DEL</span>
                </div>
                <div className="flex justify-between">
                  <span>Vouchers markdown</span>
                  <span className="text-gray-300 font-bold">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-50 pt-4 text-sm font-extrabold text-gray-800 uppercase tracking-wide">
                  <span>Grand Total</span>
                  <span className="text-orange-600 font-mono">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Promo Coupon Inputs */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Apply Coupon</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. EXTRA10"
                    disabled
                    className="px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded outline-none flex-1 font-mono uppercase"
                  />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-3 py-2 rounded shrink-0 transition opacity-50 cursor-not-allowed">
                    Apply
                  </button>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-orange-500/10 flex items-center justify-center space-x-1.5"
              >
                <span>Proceed to Checkout</span>
              </button>
            </div>

            {/* Guarantees Badge */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-start space-x-2.5 text-xs text-gray-500">
              <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-700">Buyer Safety Protection</p>
                <p className="mt-0.5 leading-relaxed text-[11px]">Your payment methods are fully encrypted. Funds are held in escrow and disbursed to vendors only after successful delivery confirmation.</p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 py-24 text-center px-4">
          <div className="p-3 bg-orange-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-orange-500">
            <ShoppingBag className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-1">Your cart is empty</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
            Ready to shop? Explore our top electronic appliances, fashion wears, groceries, and gaming catalogs.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm cursor-pointer"
          >
            Start Shopping Now
          </button>
        </div>
      )}

    </div>
  );
};
