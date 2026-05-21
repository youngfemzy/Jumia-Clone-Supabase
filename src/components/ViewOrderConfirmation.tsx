import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';

export const ViewOrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, currentUser } = useShop();
  const [order, setOrder] = useState(orders.find(o => o.id === orderId));

  useEffect(() => {
    // If order not in list yet (e.g., refresh), it might still be loading or missed
    const found = orders.find(o => o.id === orderId);
    if (found) {
      setOrder(found);
    }
  }, [orderId, orders]);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 text-sm font-medium">Locating your order certificate...</p>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered': 
        return { label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      case 'shipped': 
        return { label: 'Shipped', icon: <Truck className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'paid': 
        return { label: 'Ready for Dispatch', icon: <Package className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 'processing': 
        return { label: 'Processing', icon: <Clock className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      default: 
        return { label: status.toUpperCase(), icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-100' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SUCCESS HEADER */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight italic">Order Confirmed!</h1>
          <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">
            Your premium purchase has been authenticated and locked for fulfillment.
            A confirmation has been sent to <span className="text-gray-900 font-bold">{order.customer_email || currentUser?.email}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
           <div className="px-4 py-1.5 bg-gray-50 border border-gray-150 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
             ID: {order.id.slice(0, 13).toUpperCase()}
           </div>
           <div className={`px-4 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1.5 ${statusInfo.color}`}>
             {statusInfo.icon}
             <span>{statusInfo.label}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLL: ORDER ITEMS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2 text-orange-500" /> Package Contents
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{order.order_items?.length || 0} ITEMS</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {order.order_items?.map((item, idx) => (
                <div key={item.id || idx} className="p-5 flex items-center space-x-4 group hover:bg-gray-50 transition">
                  <div className="relative flex-shrink-0">
                     <img 
                      src={item.product?.image_urls[0] || 'https://via.placeholder.com/150'} 
                      alt={item.product?.title} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain border border-gray-200 rounded-xl bg-white p-1" 
                    />
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-extrabold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors uppercase leading-tight">
                      {item.product?.title || 'Unknown Product'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium italic">Sold & Fulfilled by Jumia Logistics</p>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-xs font-black text-gray-900 font-mono">${item.price_at_purchase.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 font-bold">/ unit</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 font-mono">${(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 flex flex-col space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span>Total Amount Paid</span>
                <span className="text-lg font-black text-orange-600 font-mono">${order.total_price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 p-4 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to Shop</span>
            </button>
            <button 
               onClick={() => navigate('/dashboard')}
               className="flex items-center justify-center space-x-2 p-4 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition active:scale-95 cursor-pointer shadow-md shadow-orange-500/20"
            >
              <span>Track Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLL: SUMMARY & INFO */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Shippment Terminal
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[11px] font-extrabold text-gray-800 leading-relaxed italic">
                    {order.shipping_address}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-50 pt-5">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Secure Payment
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-900 group">{order.payment_reference ? 'Paystack Gateway' : 'COD Agent'}</span>
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded uppercase border border-emerald-100">Verified</span>
                </div>
                {order.payment_reference && (
                  <p className="text-[9px] font-mono font-medium text-gray-400 mt-1 break-all bg-gray-50 p-2 rounded">REF: {order.payment_reference}</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex flex-col space-y-4">
               <button className="flex items-center justify-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-500 transition">
                 <Printer className="w-3.5 h-3.5" />
                 <span>Print e-Invoice</span>
               </button>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 space-y-3">
             <div className="flex items-center space-x-2 text-orange-600 animate-pulse">
               <Truck className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Courier Dispatching</span>
             </div>
             <p className="text-[10px] text-orange-800/70 font-medium leading-relaxed">
               Our regional hub in <span className="font-black">Safe-Lock Depot</span> has received your order and is currently assigning a dispatch rider for the first leg of delivery.
             </p>
          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER NAVIGATION */}
      <div className="pt-8 border-t border-gray-150 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Continue Browsing
        </button>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">© Jumia Clone Professional Edition</p>
      </div>

    </div>
  );
};
