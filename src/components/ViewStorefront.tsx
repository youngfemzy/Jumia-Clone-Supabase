import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Store, MapPin, Calendar, Info, ShieldAlert, BadgeCheck } from 'lucide-react';

interface ViewStorefrontProps {
  vendorId: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ViewStorefront: React.FC<ViewStorefrontProps> = ({ vendorId, onNavigate }) => {
  const { vendors, products } = useShop();

  const vendor = useMemo(() => {
    return vendors.find(v => v.id === vendorId);
  }, [vendors, vendorId]);

  const vendorProducts = useMemo(() => {
    return products.filter(p => p.vendor_id === vendorId);
  }, [products, vendorId]);

  if (!vendor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 text-sm">Requested storefront does not exist or has been removed.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded mt-4"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Realistic membership dates
  const joinedDate = new Date(vendor.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300 space-y-8">
      
      {/* Visual Banner Block */}
      <div className="relative rounded-2xl h-48 sm:h-64 overflow-hidden border border-gray-100 shadow-sm bg-gray-100">
        <img 
          src={vendor.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=85'} 
          alt={`${vendor.store_name} Banner`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 select-none">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Store Logo */}
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center p-0.5">
              <img 
                src={vendor.logo_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80'} 
                alt={`${vendor.store_name} Logo`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Meta */}
            <div className="space-y-1.5 text-white">
              <h1 className="text-xl sm:text-3xl font-extrabold flex items-center justify-center sm:justify-start">
                {vendor.store_name}
                <span className="ml-2 bg-orange-500 p-0.5 rounded-full inline-block" title="Verified Merchant">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </span>
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-gray-200">
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-orange-400" /> Authorized Hub</span>
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-orange-400" /> Member since {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SHOP DESCRIPTION */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b border-gray-50 flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-orange-500" /> Business Profile
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              {vendor.description || 'Welcome to our verified merchant outlet. We provide original items directly procured from global suppliers.'}
            </p>

            <div className="border-t border-gray-50 pt-4 space-y-3 font-medium text-xs text-gray-400 leading-snug">
              <p className="flex justify-between">
                <span>Total Catalog Items</span>
                <strong className="text-gray-700">{vendorProducts.length}</strong>
              </p>
              <p className="flex justify-between">
                <span>Dispatch rating</span>
                <strong className="text-emerald-600 font-bold">98% Excellent</strong>
              </p>
              <p className="flex justify-between">
                <span>Standard SLA deliver</span>
                <strong className="text-gray-700">72 Hours Max</strong>
              </p>
            </div>
          </div>

          <div className="bg-orange-50/50 rounded-xl border border-orange-100/30 p-5 space-y-3 text-xs text-orange-900 leading-relaxed">
            <p className="font-extrabold uppercase tracking-wider flex items-center text-orange-700">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-orange-500" /> Escrow Secure shopping
            </p>
            <p className="font-medium">
              We hold transactions in temporary secure custody. The payout occurs only when you confirm successful parcel arrival.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: RELEVANT INDEPENDENT PRODUCT LIST */}
        <div className="lg:col-span-9 space-y-6">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
            <Store className="w-4.5 h-4.5 mr-2 text-orange-500" /> Vendor Inventory Catalogue
          </h2>

          {vendorProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 py-20 text-center px-4">
              <p className="text-gray-400 text-xs font-semibold mb-2">No active products inside this seller hub currently.</p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Sellers can upload, update, and manage inventory elements instantly from the internal Vendor Dashboard.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
