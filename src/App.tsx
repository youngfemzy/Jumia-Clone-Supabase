import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShopProvider, useShop } from './context/ShopContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { ProductCard } from './components/ProductCard';
import { ViewCategory } from './components/ViewCategory';
import { ViewProductDetail } from './components/ViewProductDetail';
import { ViewCart } from './components/ViewCart';
import { ViewCheckout } from './components/ViewCheckout';
import { ViewAuth } from './components/ViewAuth';
import { ViewStorefront } from './components/ViewStorefront';
import { DashboardVendor } from './components/DashboardVendor';
import { DashboardAdmin } from './components/DashboardAdmin';
import { DashboardBuyer } from './components/DashboardBuyer';
import { ViewOrderConfirmation } from './components/ViewOrderConfirmation';
import { PROMOTIONS } from './data/dummyData';
import { CATEGORIES, CategoryType } from './types';
import { 
  Zap, 
  Clock, 
  ArrowRight, 
  Percent, 
  Flame, 
  Award, 
  ChevronRight, 
  Compass, 
  Database,
  Grid
} from 'lucide-react';

interface ViewState {
  view: string;
  params?: any;
}

const AppContent: React.FC = () => {
  const { products, vendors, isConnected, supabaseConfigured, currentUser } = useShop();

  const [navigation, setNavigation] = useState<ViewState>({ view: 'home' });

  // Active Flash Sales Countdowns Effects
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 47, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }; // Loop back
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    setNavigation({ view, params });
    // Scroll window smoothly to Top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Curate home assets selectors
  const flashSaleProducts = products.slice(0, 4);
  const bestSellers = products.slice(3, 7);

  return (
    <div className="min-h-screen flex flex-col bg-gray-55 pb-16 md:pb-0 font-sans selection:bg-orange-100">
      
      {/* Dynamic Header */}
      <Header 
        activeView={navigation.view} 
        onNavigate={handleNavigate} 
      />

      {/* CORE PAGES ROUTER WITH ANIMATIONS */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={navigation.view + (navigation.params ? JSON.stringify(navigation.params) : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            
            {/* 1. HOMEPAGE */}
            {navigation.view === 'home' && (
              <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-12">
                
                {/* HERO BLOCK + SIDEBAR CATEGORIES */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  
                  {/* Left Sidebar Category menu panel */}
                  <div className="hidden lg:block bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
                    <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b border-gray-50 flex items-center">
                      <Grid className="w-4 h-4 mr-2 text-orange-500" /> Browse Categories
                    </h3>
                    <div className="space-y-1 mt-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleNavigate('category', { category: cat })}
                          className="w-full text-left px-2.5 py-2 text-xs font-semibold text-gray-500 hover:text-orange-600 hover:bg-orange-50/50 rounded flex items-center justify-between transition cursor-pointer"
                        >
                          <span>{cat}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Slider Canvas (Middle/Right) */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Primary Hero Card */}
                    <div className="md:col-span-2 relative h-64 sm:h-85 bg-[#1a1a1a] rounded-xl overflow-hidden shadow-xs flex items-center p-6 sm:p-10 select-none">
                      <div className="space-y-4 max-w-sm text-white z-10 text-left">
                        <span className="text-orange-500 font-extrabold text-xs tracking-widest uppercase block">
                          LIMITED TIME COMBINED OFFER
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black leading-tight text-white uppercase">
                          UP TO 60% OFF <br />
                          SMART DEVICES
                        </h2>
                        <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                          Shop the latest flagship smartphones and premium accessories with exclusive verified vendor warranties.
                        </p>
                        <button 
                          onClick={() => handleNavigate('category')}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase px-6 py-3 rounded transition duration-200 active:scale-95 shadow-md flex items-center space-x-1 cursor-pointer"
                          id="hero-shop-now-btn"
                        >
                          <span>Shop Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Geometric overlay graphic elements from Design HTML */}
                      <div className="absolute right-0 top-0 w-1/3 h-full bg-[#2a2a2a] hidden sm:flex items-center justify-center pointer-events-none select-none">
                        <div className="w-36 h-[270px] bg-gradient-to-tr from-[#f68b1e] to-orange-400 rounded-2xl shadow-2xl rotate-12 opacity-80"></div>
                        <div className="absolute w-[120px] h-60 border-2 border-white/20 rounded-2xl -rotate-6"></div>
                      </div>
                    </div>

                    {/* Small Promos panel right of slider */}
                    <div className="hidden md:flex flex-col gap-4">
                      
                      <div className="flex-1 bg-amber-50 rounded-xl border border-amber-100/30 p-4 flex flex-col justify-between relative overflow-hidden h-40">
                        <div className="space-y-1 z-10">
                          <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest block">FRESH LOGISTICS</span>
                          <p className="font-extrabold text-gray-800 text-xs sm:text-sm">Groceries Direct</p>
                          <p className="text-[10px] text-gray-400">Pristine packaging, fast dispatch.</p>
                        </div>
                        <button 
                          onClick={() => handleNavigate('category', { category: 'Groceries' })}
                          className="text-orange-650 hover:text-orange-700 text-[10px] font-extrabold uppercase flex items-center z-10 transition hover:underline"
                        >
                          Shop Now <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80" alt="Groceries banner" referrerPolicy="no-referrer" className="absolute -right-4 -bottom-4 w-24 h-24 object-cover rotate-12 opacity-30 select-none pointer-events-none" />
                      </div>

                      <div className="flex-1 bg-teal-50 rounded-xl border border-teal-100/30 p-4 flex flex-col justify-between relative overflow-hidden h-40">
                        <div className="space-y-1 z-10">
                          <span className="text-[9px] font-extrabold text-teal-700 uppercase tracking-widest block">LUXURY BEAUTY</span>
                          <p className="font-extrabold text-gray-800 text-xs sm:text-sm">Glance Radiance</p>
                          <p className="text-[10px] text-gray-400">Verified skincare cosmetics.</p>
                        </div>
                        <button 
                          onClick={() => handleNavigate('category', { category: 'Beauty Products' })}
                          className="text-teal-700 hover:text-teal-800 text-[10px] font-extrabold uppercase flex items-center z-10 transition hover:underline"
                        >
                          Explore Aura <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=80" alt="Skincare Cosmetics" referrerPolicy="no-referrer" className="absolute -right-4 -bottom-4 w-24 h-24 object-cover -rotate-12 opacity-25 select-none pointer-events-none" />
                      </div>

                    </div>

                  </div>

                </div>

                {/* TRUST BADGERS */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 items-center justify-between grid grid-cols-2 md:grid-cols-4 gap-4 shadow-2xs font-bold text-gray-700 text-[11px] sm:text-xs">
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Real Brand Warranties</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 border-l border-gray-100 pl-2">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Instant Escrow Returns</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 border-l border-gray-100 pl-2">
                    <Percent className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Competitive Low Commissions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 border-l border-gray-100 pl-2">
                    <Compass className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Regionwide Fast Delivery</span>
                  </div>
                </div>

                {/* FLASH SALES (Geometric Balance Red & White Theme) */}
                <div className="bg-white rounded-lg overflow-hidden shadow-xs border border-gray-200">
                  
                  {/* Banner header with Countdown */}
                  <div className="bg-[#e61601] px-5 py-3.5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-bounce" />
                      <h3 className="font-extrabold text-sm uppercase tracking-wider">
                        FLASH SALES
                      </h3>
                      <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
                      <span className="text-xs text-red-100 font-semibold hidden sm:inline">Time Left:</span>
                    </div>

                    {/* Clock countdown */}
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="bg-black/25 font-mono px-2 py-1 rounded font-bold text-amber-300 tracking-wider">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <span className="font-bold text-white">:</span>
                      <div className="bg-black/25 font-mono px-2 py-1 rounded font-bold text-amber-300 tracking-wider">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <span className="font-bold text-white">:</span>
                      <div className="bg-black/25 font-mono px-2 py-1 rounded font-bold text-amber-300 tracking-wider">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>

                  {/* Flash Items Container Grid */}
                  <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white">
                    {flashSaleProducts.map((p, index) => {
                      // Custom flash sale stock percentages
                      const unitsSold = 5 + (index * 2);
                      const totalLimit = 15 + index;

                      return (
                        <div key={p.id} className="relative group">
                          <ProductCard product={p} onNavigate={handleNavigate} />
                          
                          {/* Jumia Progressive Sold Progress Slider */}
                          <div className="px-3.5 pb-3 bg-white border-x border-b border-gray-100 rounded-b-lg -mt-4 text-[10px] space-y-1 text-gray-400 font-semibold select-none">
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(unitsSold / totalLimit) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span>{unitsSold} sold</span>
                              <span>{totalLimit - unitsSold} items left</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADVERTISING BANNER ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PROMOTIONS.map((promo) => (
                    <div 
                      key={promo.id}
                      className={`rounded-xl p-6 bg-gradient-to-r ${promo.bgGradient} text-white flex justify-between items-center relative overflow-hidden shadow-2xs group h-36`}
                    >
                      <div className="space-y-2 max-w-[180px] z-10 leading-snug">
                        <span className="bg-white/10 text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">{promo.tag}</span>
                        <h4 className="font-extrabold text-sm sm:text-base">{promo.title}</h4>
                        <p className="text-[10px] text-orange-50/85 font-medium line-clamp-2">{promo.subtitle}</p>
                      </div>
                      <button 
                        onClick={() => handleNavigate('category')}
                        className="p-1 bg-white hover:bg-orange-50 text-gray-800 rounded-full z-10 hover:scale-110 active:scale-95 transition"
                        title="View Category"
                      >
                        <ChevronRight className="w-5 h-5 text-orange-500" />
                      </button>
                      <img src={promo.image} alt={promo.title} referrerPolicy="no-referrer" className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-20 -rotate-12 group-hover:-rotate-6 transition duration-300 pointer-events-none" />
                    </div>
                  ))}
                </div>

                {/* BEST SELLING PRODUCTS (BENTO STYLE) */}
                <div className="space-y-6">
                  <div className="flex items-end justify-between border-b border-gray-100 pb-3">
                    <h2 className="text-md sm:text-lg font-extrabold text-gray-900 uppercase tracking-widest flex items-center">
                      <Flame className="w-5 h-5 text-orange-500 mr-2" /> Best Sellers Today
                    </h2>
                    <button 
                      onClick={() => handleNavigate('category')}
                      className="text-orange-500 hover:text-orange-600 text-xs font-bold uppercase tracking-wider hover:underline transition"
                    >
                      See All Items
                    </button>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {bestSellers.map((p) => (
                      <ProductCard key={p.id} product={p} onNavigate={handleNavigate} />
                    ))}
                  </div>
                </div>

                {/* VENDORS MERCHANTS SPOTLIGHT */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 sm:p-8 space-y-6">
                  <div className="text-center max-w-sm mx-auto space-y-1.5">
                    <h3 className="font-extrabold text-gray-900 text-md sm:text-lg uppercase tracking-wider">Top Brand Stores Spotlight</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-normal">
                      Verified distributor outlets directly managing local warehouses for fast dispatch.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendors.slice(0, 4).map((v) => (
                      <div 
                        key={v.id}
                        onClick={() => handleNavigate('storefront', { vendorId: v.id })}
                        className="bg-white rounded-xl border border-gray-150 p-5 text-center space-y-3 cursor-pointer hover:shadow-md transition group h-full flex flex-col justify-between"
                      >
                        {v.logo_url && (
                          <img 
                            src={v.logo_url} 
                            alt={v.store_name} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full mx-auto object-cover border border-gray-150 p-0.5 bg-gray-50 group-hover:scale-105 transition" 
                          />
                        )}
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{v.store_name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold italic line-clamp-2 mt-1 px-1">{v.description || 'Verified seller outlet.'}</p>
                        </div>
                        <span className="text-orange-600 group-hover:text-orange-700 text-[10px] font-extrabold uppercase transition hover:underline">
                          View Store Catalog
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 2. CATEGORY CATALOGUE */}
            {navigation.view === 'category' && (
              <ViewCategory 
                initialCategory={navigation.params?.category} 
                initialSearch={navigation.params?.search} 
                onNavigate={handleNavigate} 
              />
            )}

            {/* 3. PRODUCT DETAIL PAGE */}
            {navigation.view === 'product-detail' && (
              <ViewProductDetail 
                productId={navigation.params?.productId} 
                onNavigate={handleNavigate} 
              />
            )}

            {/* 4. SHOPPING CART */}
            {navigation.view === 'cart' && (
              <ViewCart onNavigate={handleNavigate} />
            )}

            {/* 5. CHECKOUT */}
            {navigation.view === 'checkout' && (
              <ViewCheckout onNavigate={handleNavigate} />
            )}

            {/* 6. AUTH */}
            {navigation.view === 'auth' && (
              <ViewAuth onNavigate={handleNavigate} />
            )}

            {/* 7. STOREFRONT PROFILE VIEW */}
            {navigation.view === 'storefront' && (
              <ViewStorefront 
                vendorId={navigation.params?.vendorId} 
                onNavigate={handleNavigate} 
              />
            )}

            {/* 8. BUYER DASHBOARD */}
            {navigation.view === 'buyer-dashboard' && (
              currentUser ? (
                <DashboardBuyer onNavigate={handleNavigate} />
              ) : (
                <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <p className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">Authentication Required</p>
                    <p className="text-xs text-amber-700 mt-2 font-medium leading-relaxed">Please sign in to access your personal dashboard and order history.</p>
                  </div>
                  <button onClick={() => handleNavigate('auth')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm cursor-pointer">
                    Go to Login / Register
                  </button>
                </div>
              )
            )}

            {/* 9. VENDOR HOUSING DASHBOARD */}
            {navigation.view === 'vendor-dashboard' && (
              currentUser?.role === 'vendor' || currentUser?.role === 'admin' ? (
                <DashboardVendor />
              ) : (
                <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <p className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">Access Denied</p>
                    <p className="text-xs text-amber-700 mt-2 font-medium leading-relaxed">This dashboard is reserved for verified Jumia Premium Vendor Stores. Please log in with a vendor account or register as one.</p>
                  </div>
                  <button onClick={() => handleNavigate('auth')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm cursor-pointer">
                    Go to Login / Register
                  </button>
                </div>
              )
            )}

            {/* 10. COORDINATOR ADMIN DASHBOARD */}
            {navigation.view === 'admin-dashboard' && (
              currentUser?.role === 'admin' ? (
                <DashboardAdmin />
              ) : (
                <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <p className="text-sm font-extrabold text-red-900 uppercase tracking-wider">Restricted Area</p>
                    <p className="text-xs text-red-700 mt-2 font-medium leading-relaxed">Only authorized Platform Administrators have clearance to access this panel.</p>
                  </div>
                  <button onClick={() => handleNavigate('home')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition shadow-sm cursor-pointer">
                    Return to Homepage
                  </button>
                </div>
              )
            )}

            {/* 11. ORDER CONFIRMATION / DETAIL VIEW */}
            {navigation.view === 'order-confirmation' && (
              <ViewOrderConfirmation 
                orderId={navigation.params?.orderId} 
                onNavigate={handleNavigate} 
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Content */}
      <Footer />

      {/* Mobile Sticky Underbar navigation */}
      <BottomNavigation activeView={navigation.view} onNavigate={handleNavigate} />

    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </ToastProvider>
  );
}
