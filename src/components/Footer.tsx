import React from 'react';
import { Mail, HelpCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 text-sm mt-auto">
      {/* Jumia Style Trust Factors Banner */}
      <div className="bg-orange-500 py-6 text-white text-xs border-b border-orange-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-white">24/7 HELPDESK</p>
              <p className="opacity-90 mt-0.5">Reach out anytime at support@jmarket.com</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-white">100% REGULATED</p>
              <p className="opacity-90 mt-0.5">Original vendor verified products only</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-white">FAST DESPATCH</p>
              <p className="opacity-90 mt-0.5">Express shipping available across regions</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-white">EASY REFUNDS</p>
              <p className="opacity-90 mt-0.5">Hassle-free return policy within 14 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="bg-orange-500 text-white px-2.5 py-1.5 rounded-md font-extrabold text-lg mr-2">J</div>
            <span className="font-extrabold text-white text-xl uppercase tracking-wider">JMARKET</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            The leading multivendor e-commerce platform curated around supreme customer convenience. Bringing authorized international brands and local vendors directly to your screen.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Shop Categories</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#" className="hover:text-white transition">Phones & Tablets</a></li>
            <li><a href="#" className="hover:text-white transition">Laptops & PCs</a></li>
            <li><a href="#" className="hover:text-white transition">Fashion Apparel</a></li>
            <li><a href="#" className="hover:text-white transition">Home Appliances</a></li>
            <li><a href="#" className="hover:text-white transition">Groceries & Pantry</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Partner Programs</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#" className="hover:text-white transition">Sell on J-Market</a></li>
            <li><a href="#" className="hover:text-white transition">Merchant Terms</a></li>
            <li><a href="#" className="hover:text-white transition">Logistic Hub Partners</a></li>
            <li><a href="#" className="hover:text-white transition">Affiliate Program</a></li>
            <li><a href="#" className="hover:text-white transition">API Portal access</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-mono">Subscribe Newsletter</h4>
          <p className="text-xs text-gray-400 mb-3">Stay informed on markdown prices, discount vouchers, and new store arrivals!</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email address..."
              className="px-3 py-2 bg-gray-900 border border-gray-800 text-xs text-white rounded-l focus:outline-none flex-1"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-r text-xs font-semibold transition">
              SUB
            </button>
          </div>
        </div>
      </div>

      {/* Underbar */}
      <div className="border-t border-gray-900 bg-gray-950/80 py-4 text-center text-xs text-gray-500">
        <p>© 2026 J-Market Marketplace Ltd. Standard MultiVendor layout. Preserving local storage fallback persistence.</p>
      </div>
    </footer>
  );
};
