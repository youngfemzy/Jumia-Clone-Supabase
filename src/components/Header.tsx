import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../types';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Store, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Database,
  Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    currentVendor, 
    signOut, 
    updateRole, 
    cartItems, 
    isConnected,
    supabaseConfigured,
    searchQuery,
    setSearchQuery
  } = useShop();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    navigate(`/category?search=${encodeURIComponent(localSearch)}`);
  };

  const handleCategoryClick = (cat: string) => {
    setSearchQuery('');
    setLocalSearch('');
    navigate(`/category/${cat}`);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const activeView = location.pathname;

  return (
    <header className="w-full bg-white shadow-xs sticky top-0 z-50">
      {/* Jumia Promotional Top Banner */}
      <div className="bg-amber-500 text-white text-xs font-medium py-1.5 px-4 flex justify-between items-center text-center">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <span className="bg-white/20 text-[10px] py-0.5 px-1.5 rounded-full font-bold uppercase tracking-wide">Promo</span>
          <span>🚚 Free Delivery in Lagos & Abuja on orders above $50</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-white/90 text-[11px]">
            <Database className={`w-3.5 h-3.5 ${isConnected ? 'text-green-300' : supabaseConfigured ? 'text-amber-300 animate-pulse' : 'text-red-300'}`} />
            <span>
              Database Connection:{' '}
              {isConnected ? (
                <span className="text-green-300 font-bold">Connected (Supabase Live)</span>
              ) : supabaseConfigured ? (
                <span className="text-amber-300 font-semibold italic">Connecting...</span>
              ) : (
                <span className="text-red-300 font-extrabold underline decoration-wavy">Keys Not Configured in .env</span>
              )}
            </span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-[11px] font-mono">UTC: 2026-05-20</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LOGO */}
        <div 
          onClick={() => {
            setSearchQuery('');
            setLocalSearch('');
            navigate('/');
          }}
          className="flex items-center space-x-2 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center font-bold text-white text-lg">J</div>
          <span className="text-xl sm:text-2xl font-black text-orange-500 tracking-tight italic">MARKET</span>
          <span className="hidden lg:inline font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 font-semibold uppercase tracking-wider">MultiVendor</span>
        </div>

        {/* SEARCH BAR (Geometric Balance Sharp Box style) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
          <div className="flex w-full border-2 border-gray-200 focus-within:border-orange-500 rounded-md overflow-hidden bg-white transition">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full px-4 py-2 outline-none text-sm placeholder-gray-400 pl-10 bg-transparent border-0 ring-0 focus:ring-0"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            </div>
            <button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 font-bold text-sm uppercase tracking-wide transition shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* ACTIONS */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Supabase status on mobile */}
          <div 
            className="sm:hidden p-1.5 relative flex items-center"
            title={isConnected ? 'Database Connected' : supabaseConfigured ? 'Database Connecting' : 'Database Disconnected'}
          >
            <Database className={`w-5 h-5 ${isConnected ? 'text-green-500' : supabaseConfigured ? 'text-amber-500 animate-pulse' : 'text-red-500'}`} />
          </div>

          {/* User Auth Info / Role Switcher */}
          {currentUser ? (
            <div className="relative">
              <div 
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center space-x-1 cursor-pointer hover:text-orange-500 transition group py-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border-2 border-orange-200">
                  {currentUser.full_name[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left pl-1">
                  <p className="text-xs text-gray-400 font-medium">Hello, {currentUser.full_name.split(' ')[0]}</p>
                  <p className="text-xs font-bold text-gray-800 capitalize flex items-center">
                    {currentUser.role}
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1.5 inline-block"></span>
                  </p>
                </div>
              </div>

              {showRoleSelector && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="font-semibold text-gray-700 text-sm truncate">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</p>
                  </div>

                  {/* Removed Switch Role Perspective for normal users per request */}
                  {currentUser.role === 'admin' && (
                    <div className="px-3 py-1 bg-orange-50 mx-2 rounded-md mb-2">
                      <p className="text-[10px] text-orange-950 font-bold uppercase tracking-wider flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-orange-500" /> Administrative view
                      </p>
                      <p className="text-[9px] text-orange-700 leading-snug font-medium mt-0.5">Switch view perspective for debugging</p>
                    </div>
                  )}

                  <button 
                    onClick={() => { setShowRoleSelector(false); navigate('/dashboard'); }}
                    className="w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center"><User className="w-3.5 h-3.5 mr-2" /> My Orders</span>
                    {activeView === '/dashboard' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                  </button>

                  {(currentUser.role === 'vendor' || currentUser.role === 'admin') && (
                    <button 
                      onClick={() => { setShowRoleSelector(false); navigate('/vendor-dashboard'); }}
                      className="w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="flex items-center"><Store className="w-3.5 h-3.5 mr-2" /> Vendor Dashboard</span>
                      {activeView === '/vendor-dashboard' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  )}

                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={() => { setShowRoleSelector(false); navigate('/admin'); }}
                      className="w-full text-left px-4 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Admin Panel</span>
                      {activeView === '/admin' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  )}

                  {/* Restricted Area - Only for testing or elevated accounts */}
                  {currentUser.role === 'admin' && (
                    <div className="px-3 py-2 border-t border-gray-100 mt-1 pb-3">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Admin Tools</p>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => { updateRole('buyer'); setShowRoleSelector(false); navigate('/'); }}
                          className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase transition border ${currentUser.role === 'buyer' ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                         >
                           to Buyer
                         </button>
                         <button 
                          onClick={() => { updateRole('vendor'); setShowRoleSelector(false); navigate('/vendor-dashboard'); }}
                          className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase transition border ${currentUser.role === 'vendor' ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                         >
                           to Vendor
                         </button>
                      </div>
                    </div>
                  )}

                  {/* Dashboard routing buttons */}
                  {currentUser.role === 'vendor' && (
                    <button 
                      onClick={() => { setShowRoleSelector(false); navigate('/vendor-dashboard'); }}
                      className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium border-t border-gray-100"
                    >
                      Go to Store Dashboard
                    </button>
                  )}
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={() => { setShowRoleSelector(false); navigate('/admin'); }}
                      className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 font-medium border-t border-gray-100"
                    >
                      Go to Admin Panel
                    </button>
                  )}

          <button 
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 flex items-center mt-1"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
          </button>
        </div>
      )}
    </div>
  ) : (
    <button 
      onClick={() => navigate('/auth')}
      className="flex items-center space-x-1.5 hover:text-orange-500 hover:bg-orange-50 border border-gray-200 px-3.5 py-1.5 rounded-md text-sm font-semibold transition"
    >
      <User className="w-4.5 h-4.5 text-orange-500" />
      <span className="hidden sm:inline">Sign In</span>
    </button>
  )}

  {/* Cart Icon */}
  <div 
    onClick={() => navigate('/cart')}
    className="flex items-center space-x-2 cursor-pointer group hover:text-orange-500 transition py-1 relative"
  >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-500 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-sm font-bold text-gray-700 group-hover:text-orange-500">
              Cart
            </span>
          </div>
        </div>
      </div>

      {/* Category Horizontal Quickbar */}
      <div className="border-t border-gray-100 bg-gray-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-6 overflow-x-auto text-xs py-2.5 scrollbar-none font-medium text-gray-600">
          <span className="text-gray-400 font-bold uppercase tracking-wider shrink-0 mr-2">Top Categories:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="hover:text-orange-500 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
