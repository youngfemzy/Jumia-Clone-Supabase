import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { CATEGORIES } from './types';

const PROMOTIONS = [
  {
    id: 'p1',
    tag: 'OFFICIAL STORE',
    title: 'Top Brand Selection',
    subtitle: 'Shop the most trusted local distributors',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    bgGradient: 'from-orange-600 to-orange-700'
  },
  {
    id: 'p2',
    tag: 'ELECTRONICS',
    title: 'Certified Computing',
    subtitle: 'Verified laptops with local warranty',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    bgGradient: 'from-indigo-600 to-indigo-700'
  },
  {
    id: 'p3',
    tag: 'FLASH OFFER',
    title: 'Health & Beauty',
    subtitle: 'Up to 50% discount on cosmetics',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    bgGradient: 'from-pink-600 to-purple-700'
  }
];
import { 
  Zap, 
  ArrowRight, 
  Percent, 
  Flame, 
  Award, 
  ChevronRight, 
  Compass, 
  Grid
} from 'lucide-react';

const HomePage = () => {
  const { products, vendors } = useShop();
  const navigate = useNavigate();
  
  // Active Flash Sales Countdowns Effects
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 47, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = products.slice(0, 4);
  const bestSellers = products.slice(3, 7);

  return (
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
                onClick={() => navigate(`/category/${cat}`)}
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
                onClick={() => navigate('/category/Electronics')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase px-6 py-3 rounded transition duration-200 active:scale-95 shadow-md flex items-center space-x-1 cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

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
                onClick={() => navigate('/category/Groceries')}
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
                onClick={() => navigate('/category/Beauty Products')}
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

      {/* FLASH SALES */}
      <div className="bg-white rounded-lg overflow-hidden shadow-xs border border-gray-200">
        <div className="bg-[#e61601] px-5 py-3.5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-bounce" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              FLASH SALES
            </h3>
            <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
            <span className="text-xs text-red-100 font-semibold hidden sm:inline">Time Left:</span>
          </div>
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
        <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white">
          {flashSaleProducts.map((p, index) => (
            <div key={p.id} className="relative group">
              <ProductCard product={p} />
              <div className="px-3.5 pb-3 bg-white border-x border-b border-gray-100 rounded-b-lg -mt-4 text-[10px] space-y-1 text-gray-400 font-semibold select-none">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(8 + index) * 5}%` }}></div>
                </div>
                <div className="flex justify-between font-mono">
                  <span>{4 + index * 3} sold</span>
                  <span>{12 - index} left</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADVERTISING BANNER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROMOTIONS.map((promo) => (
          <div 
            key={promo.id}
            onClick={() => navigate('/category')}
            className={`rounded-xl p-6 bg-gradient-to-r ${promo.bgGradient} text-white flex justify-between items-center relative overflow-hidden shadow-2xs group h-36 cursor-pointer`}
          >
            <div className="space-y-2 max-w-[180px] z-10 leading-snug">
              <span className="bg-white/10 text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">{promo.tag}</span>
              <h4 className="font-extrabold text-sm sm:text-base">{promo.title}</h4>
              <p className="text-[10px] text-orange-50/85 font-medium line-clamp-2">{promo.subtitle}</p>
            </div>
            <div className="p-1 bg-white hover:bg-orange-50 text-gray-800 rounded-full z-10 hover:scale-110 active:scale-95 transition">
              <ChevronRight className="w-5 h-5 text-orange-500" />
            </div>
            <img src={promo.image} alt={promo.title} referrerPolicy="no-referrer" className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-20 -rotate-12 group-hover:-rotate-6 transition duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* BEST SELLERS */}
      <div className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-100 pb-3">
          <h2 className="text-md sm:text-lg font-extrabold text-gray-900 uppercase tracking-widest flex items-center">
            <Flame className="w-5 h-5 text-orange-500 mr-2" /> Best Sellers Today
          </h2>
          <button onClick={() => navigate('/category')} className="text-orange-500 hover:text-orange-600 text-xs font-bold uppercase tracking-wider hover:underline transition">
            See All Items
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* VENDORS */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-sm mx-auto space-y-1.5">
          <h3 className="font-extrabold text-gray-900 text-md sm:text-lg uppercase tracking-wider">Top Brand Stores Spotlight</h3>
          <p className="text-xs text-gray-400 font-semibold leading-normal">Verified distributor outlets managing local warehouses for fast dispatch.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vendors.slice(0, 4).map((v) => (
            <div 
              key={v.id}
              onClick={() => navigate(`/store/${v.id}`)}
              className="bg-white rounded-xl border border-gray-150 p-5 text-center space-y-3 cursor-pointer hover:shadow-md transition group h-full flex flex-col justify-between"
            >
              {v.logo_url && <img src={v.logo_url} alt={v.store_name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full mx-auto object-cover border border-gray-150 p-0.5 bg-gray-50 group-hover:scale-105 transition" />}
              <div>
                <p className="font-bold text-gray-800 text-sm">{v.store_name}</p>
                <p className="text-[10px] text-gray-400 font-semibold italic line-clamp-2 mt-1 px-1">{v.description || 'Verified seller outlet.'}</p>
              </div>
              <span className="text-orange-600 group-hover:text-orange-700 text-[10px] font-extrabold uppercase transition hover:underline">View Catalog</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'buyer' | 'vendor' | 'admin' }) => {
  const { currentUser, loadingAuth } = useShop();
  
  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono text-[10px] text-gray-400 uppercase tracking-widest">Verifying Authorization...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  if (role && currentUser.role !== role && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { currentUser, loadingAuth } = useShop();
  
  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono text-[10px] text-gray-400 uppercase tracking-widest">Verifying Authorization...</div>;
  }
  
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'vendor') return <Navigate to="/vendor-dashboard" replace />;
  return <Navigate to="/dashboard-buyer" replace />;
};

const AppContent: React.FC = () => {
  const { currentUser } = useShop();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-55 pb-16 md:pb-0 font-sans selection:bg-orange-100">
      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category" element={<ViewCategory />} />
              <Route path="/category/:category" element={<ViewCategory />} />
              <Route path="/product/:productId" element={<ViewProductDetail />} />
              <Route path="/cart" element={<ViewCart />} />
              <Route path="/checkout" element={<ProtectedRoute><ViewCheckout /></ProtectedRoute>} />
              <Route path="/auth" element={<ViewAuth />} />
              <Route path="/store/:vendorId" element={<ViewStorefront />} />
              
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/dashboard-buyer" element={<ProtectedRoute role="buyer"><DashboardBuyer /></ProtectedRoute>} />
              
              <Route path="/vendor-dashboard" element={
                <ProtectedRoute role="vendor"><DashboardVendor /></ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>
              } />
              
              <Route path="/order-confirmation/:orderId" element={<ViewOrderConfirmation />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNavigation />
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

