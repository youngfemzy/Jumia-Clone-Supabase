import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, MapPin, ChevronRight } from 'lucide-react';
import { Order } from '../types';

export const DashboardBuyer: React.FC = () => {
  const navigate = useNavigate();
  const { orders, currentUser } = useShop();

  const userOrders = orders.filter(o => o.buyer_id === currentUser?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'shipped': return <Truck className="w-3.5 h-3.5" />;
      case 'processing': return <Clock className="w-3.5 h-3.5 text-indigo-500" />;
      case 'paid': return <CheckCircle className="w-3.5 h-3.5 opacity-50" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">My Orders</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Customer Purchase History and Tracking</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {currentUser?.full_name[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{currentUser?.full_name}</p>
            <p className="text-[10px] text-orange-600 font-mono font-bold uppercase tracking-wider">{currentUser?.role} Account</p>
          </div>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-white rounded-2xl border border-gray-150 shadow-sm max-w-2xl mx-auto">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">No orders yet</h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto">
              Your purchase history is currently empty. Start shopping the latest deals now!
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-lg transition shadow-md shadow-orange-500/10 cursor-pointer active:scale-95"
          >
            BROWSE MARKETPLACE
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {userOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition group"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-400 group-hover:text-orange-500 transition-colors">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-black text-gray-800 uppercase tracking-wider">Order #{order.id.slice(0, 8)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="flex items-center space-x-1 mt-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <p className="text-[10px] font-semibold truncate max-w-[200px]">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2">
                    <p className="text-lg font-black text-gray-900 font-mono tracking-tight">${order.total_price.toLocaleString()}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${order.payment_reference ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500 italic'}`}>
                      {order.payment_reference ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                    </span>
                  </div>

                  <div className="md:border-l border-gray-100 md:pl-6 flex items-center">
                    <button 
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      className="w-full md:w-auto px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Visual Order Progress Bar */}
                <div className="px-5 pb-5 mt-2 hidden sm:block">
                  <div className="flex justify-between items-center relative mb-2">
                    <div className="absolute left-0 top-1.5 h-0.5 w-full bg-gray-100 -z-0"></div>
                    <div 
                      className="absolute left-0 top-1.5 h-0.5 bg-orange-500 transition-all duration-1000 -z-0" 
                      style={{ 
                        width: order.status === 'pending' ? '12%' : 
                               order.status === 'paid' ? '25%' :
                               order.status === 'shipped' ? '60%' : 
                               order.status === 'delivered' ? '100%' : '0%' 
                      }}
                    ></div>
                    
                    <div className="z-10 flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${order.status !== 'pending' ? 'bg-orange-500 border-orange-500' : 'bg-white border-orange-500 animate-pulse'}`}></div>
                      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Placed</span>
                    </div>
                    <div className="z-10 flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}></div>
                      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Shipped</span>
                    </div>
                    <div className="z-10 flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${order.status === 'delivered' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-200'}`}></div>
                      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Items at bottom */}
      <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl p-6 border border-orange-100 items-center justify-between flex flex-col sm:flex-row gap-4">
        <div className="space-y-1">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest italic">Personalized Service</p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md">Need assistance with your coordinates or active shipments? Our unified customer support is online to assist you with direct fulfillment queries.</p>
        </div>
        <button className="shrink-0 bg-white hover:bg-gray-50 text-orange-600 font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl border border-orange-200 transition shadow-sm cursor-pointer">
          Connect to Support
        </button>
      </div>
    </div>
  );
};
