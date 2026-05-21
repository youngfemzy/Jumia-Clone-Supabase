import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  ShieldCheck, 
  Store, 
  Package, 
  User as UserIcon, 
  ShoppingBag, 
  Edit, 
  BadgeCheck, 
  Trash2, 
  Database,
  Search,
  Check
} from 'lucide-react';

export const DashboardAdmin: React.FC = () => {
  const { 
    products, 
    vendors, 
    orders, 
    updateOrderStatus, 
    updatePaymentStatus,
    profiles
  } = useShop();

  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'users' | 'orders'>('vendors');
  const [filterStr, setFilterStr] = useState('');

  // Dummy profile fallbacks inside lists in case Supabase accounts lists are blank
  const displaysProfiles = profiles.length > 0 ? profiles : [
    { id: 'u-1', full_name: 'Coordinator Admin', email: 'admin@market.com', role: 'admin', created_at: new Date().toISOString() },
    { id: 'u-vendor-1', full_name: 'ElectroMax Direct Manager', email: 'electromax@market.com', role: 'vendor', created_at: new Date().toISOString() },
    { id: 'u-vendor-2', full_name: 'Fashion Hub Manager', email: 'fashion@market.com', role: 'vendor', created_at: new Date().toISOString() },
    { id: 'u-guest-1', full_name: 'Jane Doe Nigeria', email: 'jane.doe@gmail.com', role: 'buyer', created_at: new Date().toISOString() }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Coordinator Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white mb-8 border border-orange-500/20 shadow-md">
        <div className="space-y-1">
          <span className="bg-white/20 text-white font-mono text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block tracking-wider">
            Market Coordinator Terminal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-amber-200" /> Administrative Administration Panel
          </h1>
          <p className="text-xs text-orange-50 opacity-90 mt-1 font-medium">
            Supervise registered vendor storefronts, verify listing assets, review buyer transaction registries, and adjust access permissions.
          </p>
        </div>
      </div>

      {/* Grid Quick Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Registered Vendors</span>
          <span className="font-mono font-extrabold text-lg text-gray-800 tracking-tight mt-1 inline-block">{vendors.length} hubs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Global Inventory Catalog</span>
          <span className="font-mono font-extrabold text-lg text-gray-800 tracking-tight mt-1 inline-block">{products.length} items</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Client Accounts profiles</span>
          <span className="font-mono font-extrabold text-lg text-gray-800 tracking-tight mt-1 inline-block">{displaysProfiles.length} users</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Total Sales (Turnover)</span>
          <span className="font-mono font-extrabold text-lg text-orange-600 tracking-tight mt-1 inline-block">
            ${orders.reduce((acc, o) => acc + o.total_price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

      </div>

      {/* Admin Tab Controls */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 transition shrink-0 ${
            activeTab === 'vendors' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Marketplace Vendors ({vendors.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition shrink-0 ${
            activeTab === 'products' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          All Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition shrink-0 ${
            activeTab === 'users' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          User Accounts Profiles ({displaysProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition shrink-0 ${
            activeTab === 'orders' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Client Orders Ledger ({orders.length})
        </button>
      </div>

      {/* CONTROLLERS TABLES */}

      {/* TAB VENDORS */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Store Identity</th>
                  <th className="p-4">Owner Profile Identifier</th>
                  <th className="p-4">Store Slug</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={v.logo_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80'} 
                          alt={v.store_name} 
                          className="w-8 h-8 rounded-full border border-gray-150 object-cover p-0.5 bg-gray-50" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{v.store_name}</p>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1 max-w-[200px]">{v.description || 'Verified seller outlet.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono select-all">
                      {v.user_id}
                    </td>
                    <td className="p-4 font-mono text-gray-500">
                      /{v.store_slug}
                    </td>
                    <td className="p-4 font-mono text-gray-400">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-emerald-50 text-emerald-800 border-emerald-100 border text-[10px] font-bold py-0.5 px-2 rounded uppercase inline-flex items-center">
                        <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Active Store
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Visual</th>
                  <th className="p-4">Product details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Vendor ID Link</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <img 
                        src={p.image_urls[0]} 
                        alt={p.title} 
                        className="w-8 h-8 object-contain border border-gray-150 rounded bg-white p-0.5" 
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 line-clamp-1 max-w-sm">{p.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5 font-mono">ID: {p.id}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-500 font-extrabold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono select-all">
                      {p.vendor_id}
                    </td>
                    <td className="p-4 font-mono font-bold text-orange-600 text-sm">
                      ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-mono">
                      {p.stock > 0 ? (
                        <span className="text-emerald-700">{p.stock} units</span>
                      ) : (
                        <span className="text-red-500 font-bold uppercase text-[9px]">SOLD OUT</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB USERS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Account Holder Details</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">Account ID</th>
                  <th className="p-4 text-right">Dynamic Privileges Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {displaysProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold font-mono">
                          {p.full_name[0].toUpperCase()}
                        </div>
                        <p className="font-bold text-gray-950">{p.full_name}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-500">
                      {p.email}
                    </td>
                    <td className="p-4 font-mono select-all">
                      {p.id}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] tracking-wide inline-block ${
                        p.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-250 border' :
                        p.role === 'vendor' ? 'bg-orange-50 text-orange-850' : 'bg-gray-150 text-gray-550'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Order Token ID</th>
                  <th className="p-4">Buyer ID Link</th>
                  <th className="p-4">Delivery Coordinates</th>
                  <th className="p-4">Grand Total Sum</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Payment Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-mono font-bold text-gray-950 uppercase selection:bg-orange-150">
                        {o.id}
                      </td>
                      <td className="p-4 font-mono select-all">
                        {o.buyer_id}
                      </td>
                      <td className="p-4">
                        <p className="line-clamp-2 max-w-xs">{o.shipping_address}</p>
                        <p className="text-[10px] text-gray-400 font-medium font-mono mt-1">LOGGED DATE: {new Date(o.created_at).toLocaleString()}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-orange-600 text-sm">
                        ${o.total_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 uppercase text-[10px]">
                        <select
                          value={o.status || 'pending'}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          className="bg-gray-50 border border-gray-200 py-1 px-2 text-[10px] font-bold rounded cursor-pointer text-gray-700 outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {o.payment_reference ? 'CARD (ONLINE)' : 'COD (OFFLINE)'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-semibold text-xs animate-pulse">
                      No active customer orders placed globally currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
