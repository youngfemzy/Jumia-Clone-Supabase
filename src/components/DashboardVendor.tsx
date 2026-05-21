import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, Product, CategoryType } from '../types';
import { 
  Store, 
  CircleDollarSign, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const DashboardVendor: React.FC = () => {
  const { 
    products, 
    orders, 
    currentVendor, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus 
  } = useShop();

  const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast();

  const activeVendorId = currentVendor?.id || 'v-1';

  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  
  // Product creation states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form parameters
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Electronics');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError("Please upload an image file (PNG, JPG, GIF etc.).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Calculations for current vendor
  const vendorProducts = useMemo(() => {
    return products.filter(p => p.vendor_id === activeVendorId);
  }, [products, activeVendorId]);

  const vendorOrders = useMemo(() => {
    return orders.filter(o => o.order_items?.some(oi => oi.vendor_id === activeVendorId));
  }, [orders, activeVendorId]);

  const vendorRevenue = useMemo(() => {
    return vendorOrders.reduce((total, ord) => {
      const vendorItems = ord.order_items?.filter(oi => oi.vendor_id === activeVendorId) || [];
      const orderEarnings = vendorItems.reduce((acc, item) => acc + (item.price_at_purchase * item.quantity), 0);
      return total + orderEarnings;
    }, 0);
  }, [vendorOrders, activeVendorId]);

  // Form controls
  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Electronics');
    setPrice(99);
    setStock(10);
    setDescription('Fully authorized premium edition packed with manufacturer waranty.');
    setImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80');
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category as CategoryType);
    setPrice(p.price);
    setStock(p.stock);
    setDescription(p.description);
    setImageUrl(p.image_urls[0] || '');
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) {
      toastWarning("Invalid title or pricing coefficients.");
      return;
    }

    setFormLoading(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productData = {
      vendor_id: activeVendorId,
      title,
      slug,
      description,
      category,
      price,
      stock,
      image_urls: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80']
    };

    try {
      if (editingId) {
        const res = await updateProduct(editingId, productData);
        if (res.success) {
          toastSuccess("Product revised successfully.");
          setShowAddForm(false);
          setEditingId(null);
        } else {
          toastError(res.error || "Update rejected.");
        }
      } else {
        const res = await addProduct(productData);
        if (res.success) {
          toastSuccess("New product launched directly into market!");
          setShowAddForm(false);
        } else {
          toastError(res.error || "Insertion rejected.");
        }
      }
    } catch (err: any) {
      toastError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log(`[DashboardVendor] handleDelete called for: ${id}. Current confirmDeleteId: ${confirmDeleteId}`);
    
    // Replace window.confirm with two-step state check because of sandbox restrictions
    if (confirmDeleteId !== id) {
      console.log(`[DashboardVendor] First click detected. Prompting for confirmation.`);
      setConfirmDeleteId(id);
      // Auto-reset after 4 seconds if not confirmed
      setTimeout(() => {
        setConfirmDeleteId(prev => {
          if (prev === id) {
            console.log(`[DashboardVendor] Confirmation timed out for: ${id}`);
            return null;
          }
          return prev;
        });
      }, 4000);
      return;
    }

    console.log(`[DashboardVendor] Second click confirmed. Executing delete.`);
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await deleteProduct(id);
      console.log(`[DashboardVendor] Delete result:`, res);
      if (res.success) {
        toastSuccess("Item deleted successfully.");
      } else {
        toastError(res.error || "Deletion failed.");
      }
    } catch (err: any) {
      console.error(`[DashboardVendor] Unexpected delete error:`, err);
      toastError(err.message || "An unexpected error occurred during deletion.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 text-white rounded-xl p-6 mb-8 border border-gray-850 shadow-sm">
        <div className="space-y-1.5">
          <div className="bg-orange-500 font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-sm inline-block tracking-wider">
            Verified Merchant Account
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {currentVendor?.store_name || "Merchant Dashboard Console"}
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Manage your store storefront, inventories, product images, and active client coordinates.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition tracking-wide active:scale-95 flex items-center space-x-1.5 shadow-md shadow-orange-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Product</span>
        </button>
      </div>

      {/* Statistics counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Revenue (Gross)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-800 font-mono">
              ${vendorRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Catalog Inventory Size</span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-800 font-mono">
              {vendorProducts.length} items
            </span>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-orange-500">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Customer Orders</span>
            <span className="text-xl sm:text-2xl font-extrabold text-gray-800 font-mono">
              {vendorOrders.length} transactions
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs list bar */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6 text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('overview'); setShowAddForm(false); }}
          className={`pb-3 transition ${
            activeTab === 'overview' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Sales Overview
        </button>
        <button
          onClick={() => { setActiveTab('products'); }}
          className={`pb-3 transition ${
            activeTab === 'products' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          My Inventory ({vendorProducts.length})
        </button>
        <button
          onClick={() => { setActiveTab('orders'); setShowAddForm(false); }}
          className={`pb-3 transition ${
            activeTab === 'orders' ? 'border-b-2 border-orange-500 text-orange-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Customer Orders Fulfillment
        </button>
      </div>

      {/* CORE DISPLAY BOARD CONTROLLERS */}

      {/* TAB OVERVIEW */}
      {activeTab === 'overview' && !showAddForm && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Merchant Performance Matrix</h3>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-150 py-10 text-center text-xs space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="font-bold text-gray-800 uppercase tracking-widest">Fulfillment SLA metrics healthy</p>
              <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">Your store maintains an active 99.4% standard response score. Perfect rating shields you from escrow transaction clearance delays.</p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-xl p-6 space-y-4 shadow-2xs text-xs">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Quick Advice</h3>
            <p className="text-gray-500 leading-relaxed">Maintain accurate stock figures! Running out of stock with open orders causes system flags and role review parameters.</p>
          </div>

        </div>
      )}

      {/* LIST INVENTORIES TAB CONTAINER */}
      {activeTab === 'products' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs animate-in fade-in duration-250">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Visual asset</th>
                  <th className="p-4">Product Identifier</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Available units</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {vendorProducts.length > 0 ? (
                  vendorProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <img 
                          src={p.image_urls[0]} 
                          alt={p.title} 
                          className="w-10 h-10 object-contain border border-gray-150 rounded bg-white p-0.5" 
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 line-clamp-1 max-w-xs">{p.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium font-mono uppercase mt-0.5">SLUG: {p.slug}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-orange-600 text-sm">
                        ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono">
                        {p.stock > 0 ? (
                          <span className="text-emerald-700">{p.stock} units</span>
                        ) : (
                          <span className="text-red-500 font-bold uppercase text-[10px]">SOLD OUT</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 border border-gray-250 text-gray-500 hover:text-orange-500 hover:border-orange-500 rounded bg-white transition cursor-pointer"
                            title="Edit properties"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className={`p-1.5 border rounded bg-white transition cursor-pointer flex items-center justify-center ${
                              confirmDeleteId === p.id 
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : deletingId === p.id 
                                  ? 'text-gray-300 border-gray-100 cursor-not-allowed' 
                                  : 'border-gray-250 text-gray-500 hover:text-red-500 hover:border-red-500'
                            }`}
                            title={confirmDeleteId === p.id ? "Click again to confirm" : "Permanent removal"}
                          >
                            {deletingId === p.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : confirmDeleteId === p.id ? (
                              <span className="text-[10px] font-bold px-1">CONFIRM?</span>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-semibold text-xs leading-relaxed">
                      <div className="flex flex-col items-center justify-center space-y-2 py-6">
                        <span>No inventory items loaded yet.</span>
                        <button
                          onClick={handleOpenAdd}
                          className="text-orange-500 hover:text-orange-600 font-extrabold hover:underline inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Launch New Product</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Order token</th>
                  <th className="p-4">Delivery Coordinates</th>
                  <th className="p-4">Total Amount Paid</th>
                  <th className="p-4">Payment status</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right font-semibold">Dispatch modification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {vendorOrders.length > 0 ? (
                  vendorOrders.map((o) => {
                    const vendorItems = o.order_items?.filter(oi => oi.vendor_id === activeVendorId) || [];
                    const vendorSubtotal = vendorItems.reduce((acc, item) => acc + (item.price_at_purchase * item.quantity), 0);
                    
                    return (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <p className="font-mono font-bold text-gray-900 uppercase text-[10px]">{o.id.slice(0, 8)}...</p>
                          <div className="mt-2 space-y-1">
                            {vendorItems.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-[9px] text-gray-500">
                                <span className="bg-gray-100 px-1 rounded font-bold text-gray-600">{item.quantity}x</span>
                                <span className="truncate max-w-[100px]">{item.product?.title || 'Unknown Product'}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="line-clamp-2 max-w-xs">{o.shipping_address}</p>
                          <p className="text-[10px] text-gray-400 font-medium font-mono mt-1">DATE: {new Date(o.created_at).toLocaleString()}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-600 text-sm">
                          ${vendorSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 uppercase text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            o.status === 'paid' || o.status === 'delivered' || o.status === 'shipped' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            {o.payment_reference ? 'CARD PAID' : 'PENDING COD'}
                          </span>
                        </td>
                        <td className="p-4 uppercase text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            o.status === 'delivered' ? 'bg-emerald-50 text-emerald-800' :
                            o.status === 'shipped' ? 'bg-blue-50 text-blue-800' :
                            o.status === 'processing' ? 'bg-indigo-50 text-indigo-800' : 
                            o.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {o.status === 'paid' ? 'NEW (PAID)' : o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={o.status || 'pending'}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className="bg-gray-50 border border-gray-200 py-1 px-2.5 text-[11px] font-bold rounded cursor-pointer text-gray-700 focus:outline-none focus:border-orange-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Initialize / Paid</option>
                            <option value="processing">In Progress / Packing</option>
                            <option value="shipped">Dispatch / Shipped</option>
                            <option value="delivered">Completed / Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-semibold text-xs">
                      No active client orders received on this terminal currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FIXED PRODUCT FORM MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3">
              <h3 className="font-extrabold text-gray-800 text-sm sm:text-base uppercase tracking-wider">
                {editingId ? 'Edit Product Parameters' : 'Launch New Product'}
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Market Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 149.99"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Units in Stock *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 25"
                    value={stock || ''}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Drag-and-drop Image Uploader with Fallback Text Input */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Image Asset</label>
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging 
                      ? 'border-orange-500 bg-orange-50/50 scale-[0.99]' 
                      : imageUrl 
                        ? 'border-emerald-300 bg-emerald-50/10' 
                        : 'border-gray-200 hover:border-orange-400 hover:bg-gray-50/30'
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="product-image-upload" 
                    onChange={handleFileChange} 
                  />

                  {imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="max-h-32 mx-auto rounded-lg shadow-sm border border-gray-100 object-contain p-1 bg-white" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition shadow-md cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono break-all line-clamp-1 max-w-sm mx-auto">
                        {imageUrl.startsWith('data:') ? 'Local preview loaded' : imageUrl}
                      </p>
                    </div>
                  ) : (
                    <label 
                      htmlFor="product-image-upload"
                      className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                    >
                      <div className="p-3 bg-gray-50 rounded-full text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-xs">
                        <span className="text-orange-500 font-bold hover:underline">Click to upload</span>
                        <span className="text-gray-400"> or drag and drop image here</span>
                      </div>
                      <p className="text-[10px] text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Or enter image web URL</span>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500 font-mono pl-10"
                    />
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Comprehensive Description Specifications</label>
                <textarea
                  rows={4}
                  placeholder="Provide full technical parameters, shipping warranty, dimensions, adapters included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-xs font-semibold focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase rounded transition cursor-pointer"
                >
                  Cancel Action
                </button>
                 <button
                  type="submit"
                  disabled={formLoading}
                  className={`w-full py-2 font-bold text-xs uppercase rounded transition shadow-sm flex items-center justify-center space-x-2 ${
                    formLoading 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
                  }`}
                >
                  {formLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Modify Inventory details' : 'Deploy Product Online'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
