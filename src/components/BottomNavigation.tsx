import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { 
  Home, 
  Grid, 
  ShoppingCart, 
  Store, 
  ShieldCheck,
  Package
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, currentUser } = useShop();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const activeView = location.pathname;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-6 py-2 flex items-center justify-between z-40">
      
      {/* Home Button */}
      <button 
        onClick={() => navigate('/')}
        className={`flex flex-col items-center select-none active:scale-90 transition ${
          activeView === '/' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-bold mt-0.5">Home</span>
      </button>

      {/* Shop Categories */}
      <button 
        onClick={() => navigate('/category')}
        className={`flex flex-col items-center select-none active:scale-90 transition ${
          activeView.startsWith('/category') ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[9px] font-bold mt-0.5">Categories</span>
      </button>

      {/* Cart Button */}
      <button 
        onClick={() => navigate('/cart')}
        className={`flex flex-col items-center select-none active:scale-90 transition relative ${
          activeView === '/cart' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white font-mono font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold mt-0.5">Cart</span>
      </button>

      {/* Vendor portal / Dashboard portal depending on privilege status */}
      {currentUser?.role === 'vendor' ? (
        <button 
          onClick={() => navigate('/vendor-dashboard')}
          className={`flex flex-col items-center select-none active:scale-90 transition ${
            activeView === '/vendor-dashboard' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">My Store</span>
        </button>
      ) : currentUser?.role === 'admin' ? (
        <button 
          onClick={() => navigate('/admin')}
          className={`flex flex-col items-center select-none active:scale-90 transition ${
            activeView === '/admin' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Admin</span>
        </button>
      ) : (
        <button 
          onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
          className={`flex flex-col items-center select-none active:scale-90 transition ${
            activeView === '/auth' || activeView === '/dashboard' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {currentUser ? <Package className="w-5 h-5" /> : <Store className="w-5 h-5" />}
          <span className="text-[9px] font-bold mt-0.5">{currentUser ? 'My Orders' : 'Sell Products'}</span>
        </button>
      )}

    </div>
  );
};
