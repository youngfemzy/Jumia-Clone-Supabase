import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, MapPin, Truck, CheckCircle2, ArrowLeft, Database, Phone, User as UserIcon, RefreshCw } from 'lucide-react';

interface PaystackConfig {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
}

function usePaystackPayment(config: PaystackConfig) {
  return ({ onSuccess, onClose }: { onSuccess: (ref: any) => void; onClose: () => void }) => {
    const handler = (window as any).PaystackPop.setup({
      key: config.publicKey,
      email: config.email,
      amount: config.amount,
      ref: config.reference,
      callback: onSuccess,
      onClose,
    });
    handler.openIframe();
  };
}

interface ViewCheckoutProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ViewCheckout: React.FC<ViewCheckoutProps> = ({ onNavigate }) => {
  const { cartItems, cartTotal, placeOrder, updateOrderPayment, clearCart, currentUser } = useShop();
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useToast();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [regionCode, setRegionCode] = useState('Lagos');
  const [paymentOption, setPaymentOption] = useState<'cod' | 'card'>('card');
  
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const pendingOrderIdRef = React.useRef<string | null>(null);

  // Sync ref with state just in case, though we primarily set the ref directly for immediate callback access
  useEffect(() => {
    pendingOrderIdRef.current = pendingOrderId;
  }, [pendingOrderId]);

  // Redirect on success
  useEffect(() => {
    if (placedOrderId) {
      window.scrollTo(0, 0);
      onNavigate('order-confirmation', { orderId: placedOrderId });
    }
  }, [placedOrderId, onNavigate]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Paystack Config
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: currentUser?.email || "customer@example.com",
    amount: Math.round(cartTotal * 100), // Amount in kobo
    publicKey: (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || 'pk_test_your_fallback_key_here',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleSuccess = async (reference: any) => {
    console.log("[Paystack EVENT] handleSuccess reached:", reference);
    const orderId = pendingOrderIdRef.current;
    
    if (orderId) {
      console.log("[Paystack EVENT] Processing update for pending order:", orderId);
      setSubmitting(true);
      try {
        const ok = await updateOrderPayment(orderId, reference.reference, 'paid');
        if (ok) {
          console.log("[Paystack EVENT] Order updated to paid successfully in DB.");
          await clearCart();
          setPlacedOrderId(orderId);
          toastSuccess("Payment successful and order updated!");
        } else {
          console.error("[Paystack EVENT] updateOrderPayment returned false.");
          toastError("Order update failed in DB. Please contact support with ref: " + reference.reference);
        }
      } catch (err: any) {
        console.error("[Paystack EVENT] Error in handleSuccess try-block:", err);
        toastError("Finalization error: " + err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      console.warn("[Paystack EVENT] Success reached but pendingOrderIdRef was null!");
      toastWarning("Payment received but order tracking lost. Please check your history.");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log("[Paystack EVENT] handleClose reached - Popup dismissed.");
    setSubmitting(false);
    toastInfo("Payment window closed. Your order is safely saved as 'pending' in your account.");
  };

  const finalizeOrder = async (ref?: string, status: string = 'pending') => {
    setSubmitting(true);
    const completeAddressInfo = `${fullName} | Tel: ${phoneNumber} | Addr: ${addressLine}, ${regionCode}`;
    
    try {
      const res = await placeOrder(completeAddressInfo, ref, status);
      if (res.success && res.orderId) {
        setPlacedOrderId(res.orderId);
        toastSuccess(status === 'paid' ? "Payment successful and order placed!" : "Order placed successfully!");
      } else {
        toastError(res.error || "Failed to submit transaction.");
      }
    } catch (err: any) {
      toastError("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !fullName.trim() || !phoneNumber.trim()) {
      toastWarning("Please populate all required fields.");
      return;
    }

    if (paymentOption === 'card') {
      setSubmitting(true);
      const completeAddressInfo = `${fullName} | Tel: ${phoneNumber} | Addr: ${addressLine}, ${regionCode}`;
      
      try {
        toastInfo("Initializing secure connection...");
        // 1. Save Pending Order FIRST (Skip clear cart to keep Paystack amount valid)
        const res = await placeOrder(completeAddressInfo, undefined, 'pending', true);
        
        if (res.success && res.orderId) {
          pendingOrderIdRef.current = res.orderId;
          setPendingOrderId(res.orderId);
          console.log("[Checkout] Initiating Paystack Popup for order:", res.orderId);
          
          // In react-paystack v6.0.0, initializePayment takes an object
          initializePayment({
            onSuccess: handleSuccess,
            onClose: handleClose
          });
        } else {
          toastError(res.error || "Could not initialize order. Please try again.");
          setSubmitting(false);
        }
      } catch (err: any) {
        console.error("[Checkout] Pre-payment save error:", err);
        toastError("Failed to initialize order: " + err.message);
        setSubmitting(false);
      }
    } else {
      finalizeOrder();
    }
  };

  // SUCCESS OUTLET CARD
  if (placedOrderId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Order Received Successfully!</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Thank you for shopping with us! Your invoice is generated. Our merchants have been alerted for fulfillment processing.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 text-left text-xs space-y-3 font-medium">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Order Token ID</span>
            <span className="font-mono font-bold text-gray-800 uppercase">{placedOrderId}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Delivery Address</span>
            <span className="text-gray-800 text-right truncate max-w-[200px]">{addressLine}, {regionCode}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Total Charged</span>
            <span className="text-orange-600 font-extrabold font-mono">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment status</span>
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              {paymentOption === 'cod' ? 'Cash on Delivery (Pending)' : 'Card payment Authorized'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            onClick={() => {
              if (currentUser?.role === 'vendor') {
                onNavigate('vendor-dashboard', { tab: 'orders' });
              } else {
                onNavigate('dashboard', { tab: 'orders' });
              }
            }}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center justify-center"
          >
            Track My Order Status
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Guard empty checkout
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-sm">Please put something in your cart before checkout.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded mt-4"
        >
          Browse listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-350">
      
      {/* Back to Cart info */}
      <button 
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 uppercase transition mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLL: DELIVERY FORM */}
        <form onSubmit={handlePlaceOrderSubmit} className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 shadow-xs">
            <h2 className="text-md sm:text-lg font-extrabold text-gray-800 uppercase tracking-wider flex items-center border-b border-gray-50 pb-4">
              <MapPin className="w-5 h-5 text-orange-500 mr-2" /> Delivery Coordinates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Recipient Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Recipient's name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 pl-10"
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Active Telephone *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 pl-10"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Street Address *</label>
              <textarea
                required
                rows={2}
                placeholder="House Number, Street Name, Closest Landmark..."
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Region County *</label>
                <select
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Lagos">Lagos State (HQ Hub)</option>
                  <option value="Abuja">Abuja (Federal Capital Territory)</option>
                  <option value="Kano">Kano Precinct</option>
                  <option value="Port Harcourt">Port Harcourt (Rivers)</option>
                  <option value="Enugu">Enugu Area</option>
                  <option value="Ibadan">Ibadan (Oyo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fulfillment Agent</label>
                <div className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-orange-400" /> J-Express Standard
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT BOXES */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <h2 className="text-md sm:text-lg font-extrabold text-gray-800 uppercase tracking-wider flex items-center border-b border-gray-50 pb-4">
              <CreditCard className="w-5 h-5 text-orange-500 mr-2" /> Payment Framework
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div 
                onClick={() => setPaymentOption('cod')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition relative flex flex-col justify-between h-24 select-none ${
                  paymentOption === 'cod' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-150 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-extrabold text-xs text-gray-800 uppercase tracking-wide">Cash on Delivery (COD)</p>
                  <input type="radio" checked={paymentOption === 'cod'} readOnly className="accent-orange-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium select-none">Pay safely at your absolute doorstep via cash or POS swipe upon arrival.</p>
              </div>

              <div 
                onClick={() => setPaymentOption('card')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition relative flex flex-col justify-between h-24 select-none ${
                  paymentOption === 'card' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-150 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-extrabold text-xs text-gray-800 uppercase tracking-wide">Secure Debit Card / Visa</p>
                  <input type="radio" checked={paymentOption === 'card'} readOnly className="accent-orange-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium select-none">Securely pay now to fast-track shipping priority instantly.</p>
              </div>

            </div>

            {paymentOption === 'card' && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <p className="font-bold text-emerald-800 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Paystack Secured
                </p>
                <p className="text-emerald-600 font-medium">You will be redirected to Paystack's secure checkout page upon clicking the confirm button below.</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {submitting ? 'PROCESSING YOUR ORDER...' : `CONFIRM AND PAY ($${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})`}
          </button>
        </form>

        {/* RIGHT COLL: SUMMARY PREVIEW CARDS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-xs">
            <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wider pb-3 border-b border-gray-50">
              Your Order Bundle
            </h2>

            <div className="space-y-3 max-h-[25vh] overflow-y-auto divide-y divide-gray-50 pr-1">
              {cartItems.map(item => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div key={item.id} className="flex items-center space-x-3 pt-3 first:pt-0 gap-1 text-xs">
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.title} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 border border-gray-150 rounded object-contain shrink-0 p-0.5 bg-gray-50" 
                    />
                    <div className="flex-1 truncate">
                      <p className="font-bold text-gray-800 truncate">{product.title}</p>
                      <p className="text-gray-400 font-semibold font-mono text-[10px] mt-0.5">Qty: {item.quantity} x ${product.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total blocks */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 leading-snug text-xs font-semibold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} units)</span>
                <span className="text-gray-800 font-mono">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-gray-50 pt-3 text-sm font-extrabold text-gray-800 uppercase">
                <span>Order Total</span>
                <span className="text-orange-600 font-mono text-base">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
