import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Vendor, Profile, Order, OrderItem, CartItem, UserRole, CategoryType } from '../types';
import { getSupabase, isConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { SAMPLE_PRODUCTS, SAMPLE_VENDORS } from '../data/dummyData';
import { useToast } from './ToastContext';

// Dynamic Database Schema Metadata
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

let detectedProfileColumns: string[] = ['id', 'email', 'role', 'name', 'full_name', 'avatar_url', 'created_at'];
let detectedVendorColumns: string[] = ['id', 'user_id', 'store_name', 'store_slug', 'logo_url', 'logo', 'description', 'email', 'role', 'created_at'];
let detectedProductColumns: string[] = ['id', 'vendor_id', 'title', 'description', 'price', 'stock', 'image_url', 'category', 'slug', 'created_at'];
let detectedOrderColumns: string[] = ['id', 'buyer_id', 'total_price', 'status', 'payment_reference', 'shipping_address', 'customer_email', 'items', 'created_at'];
let detectedCartColumns: string[] = ['id', 'user_id', 'product_id', 'quantity', 'created_at'];

const filterPayloadForTable = (rawPayload: any, allowedColumns: string[]): any => {
  const filtered: any = {};
  for (const key of Object.keys(rawPayload)) {
    if (allowedColumns.includes(key)) {
      filtered[key] = rawPayload[key];
    }
  }
  return filtered;
};

const mapDbToProfile = (dbObj: any): Profile => {
  if (!dbObj) return null as any;
  const fullName = dbObj.name || dbObj.full_name || dbObj.fullname || dbObj.username || dbObj.display_name || dbObj.email?.split('@')[0] || 'Authenticated User';
  return {
    id: dbObj.id,
    full_name: fullName,
    email: dbObj.email || '',
    role: dbObj.role || 'buyer',
    avatar_url: dbObj.avatar_url || undefined,
    created_at: dbObj.created_at || new Date().toISOString()
  };
};

const buildProfileDbPayload = (profile: Profile, columns: string[]): any => {
  const hasColumn = (name: string) => columns.includes(name);

  const payload: any = {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    created_at: profile.created_at
  };

  if (profile.avatar_url && hasColumn('avatar_url')) {
    payload.avatar_url = profile.avatar_url;
  }

  if (hasColumn('name')) {
    payload.name = profile.full_name;
  } else if (hasColumn('full_name')) {
    payload.full_name = profile.full_name;
  } else if (hasColumn('fullname')) {
    payload.fullname = profile.full_name;
  } else if (hasColumn('username')) {
    payload.username = profile.full_name;
  } else if (hasColumn('display_name')) {
    payload.display_name = profile.full_name;
  }

  return filterPayloadForTable(payload, columns);
};

const buildVendorDbPayload = (vendor: any, columns: string[], email?: string, role?: string): any => {
  const payload: any = { 
    ...vendor
  };
  if (columns.includes('email') && email) {
    payload.email = email;
  }
  if (columns.includes('role') && role) {
    payload.role = role;
  }
  return filterPayloadForTable(payload, columns);
};

const mapDbToProduct = (dbObj: any): Product => {
  let image_urls = [];
  if (dbObj.image_urls) {
    image_urls = Array.isArray(dbObj.image_urls) ? dbObj.image_urls : [dbObj.image_urls];
  } else if (dbObj.image_url) {
    image_urls = [dbObj.image_url];
  } else {
    image_urls = ['/placeholder.jpg'];
  }

  return {
    id: dbObj.id,
    vendor_id: dbObj.vendor_id || '',
    title: dbObj.title || '',
    slug: dbObj.slug || dbObj.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${dbObj.id}`,
    description: dbObj.description || '',
    category: dbObj.category || 'Electronics',
    price: Number(dbObj.price) || 0,
    stock: Number(dbObj.stock) || 0,
    image_urls,
    created_at: dbObj.created_at || new Date().toISOString()
  };
};

const buildProductDbPayload = (product: any, columns: string[]): any => {
  const hasColumn = (name: string) => columns.length === 0 || columns.includes(name);
  
  const payload: any = {
    vendor_id: product.vendor_id,
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,
  };

  if (product.id) payload.id = product.id;
  if (product.created_at) payload.created_at = product.created_at;

  if (hasColumn('image_url')) {
    payload.image_url = product.image_url || (product.image_urls && product.image_urls[0]) || '';
  }
  
  // Strongly check for image_urls to avoid common Supabase schema cache errors
  if (hasColumn('image_urls')) {
    payload.image_urls = product.image_urls || [product.image_url || ''];
  }
  
  if (hasColumn('slug')) {
    payload.slug = product.slug;
  }
  if (hasColumn('category')) {
    payload.category = product.category;
  }

  return filterPayloadForTable(payload, columns);
};

const mapDbToOrder = (dbObj: any): Order => {
  return {
    id: dbObj.id,
    buyer_id: dbObj.buyer_id || '',
    total_price: Number(dbObj.total_price) || 0,
    status: dbObj.status || 'paid',
    payment_reference: dbObj.payment_reference,
    shipping_address: dbObj.shipping_address || 'Default Address',
    customer_email: dbObj.customer_email,
    created_at: dbObj.created_at || new Date().toISOString(),
    // The items are now stored as a JSON array directly in the order record
    order_items: Array.isArray(dbObj.items) ? dbObj.items.map((it: any) => ({
      id: it.id || generateUUID(),
      order_id: dbObj.id,
      product_id: it.product_id,
      vendor_id: it.vendor_id,
      quantity: it.quantity,
      price_at_purchase: it.price_at_purchase,
      created_at: it.created_at || dbObj.created_at,
      product: it.product
    })) : []
  };
};

const buildOrderDbPayload = (order: any, columns: string[]): any => {
  const payload: any = {
    id: order.id,
    buyer_id: order.buyer_id,
    total_price: order.total_price,
    status: order.status || 'paid',
    shipping_address: order.shipping_address,
    customer_email: order.customer_email,
    payment_reference: order.payment_reference,
    items: order.items, // JSON array
    created_at: order.created_at
  };

  return filterPayloadForTable(payload, columns);
};

interface ShopContextType {
  // Connection state
  isConnected: boolean;
  supabaseConfigured: boolean;

  // Global Lists
  products: Product[];
  vendors: Vendor[];
  profiles: Profile[];
  orders: Order[];

  // Current session auth
  currentUser: Profile | null;
  currentVendor: Vendor | null;
  loadingAuth: boolean;

  // Actions
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; emailVerificationRequired?: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;

  // Products CRUD
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;

  // Cart operations
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;

  // Order Operations
  placeOrder: (shippingAddress: string, paymentReference?: string, paymentStatus?: string, skipClearCart?: boolean) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: string) => Promise<boolean>;
  updateOrderPayment: (orderId: string, reference: string, status?: string) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, status: string) => Promise<boolean>;

  // Filter/UI helpers
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const activeSyncPromises = new Map<string, Promise<{ profile: Profile; vendor: Vendor | null }>>();

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = getSupabase();
  const supabaseConfigured = isConfigured;
  const { error: toastError, success: toastSuccess } = useToast();

  // Connected state (whether we are using direct Supabase queries)
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Cart (Local State persistent fallback)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Helper to synchronize authenticated users with the 'profiles' and 'vendors' tables securely
  const syncUserProfileAndVendor = async (authUser: any): Promise<{ profile: Profile; vendor: Vendor | null }> => {
    if (!supabase) throw new Error('Supabase not initialized');

    const userId = authUser.id;
    if (activeSyncPromises.has(userId)) {
      return activeSyncPromises.get(userId)!;
    }

    const runSync = async (): Promise<{ profile: Profile; vendor: Vendor | null }> => {
      // Fetch existing profile with maybeSingle to handle no-row states elegantly
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from('profile')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileFetchError) {
        throw new Error(`Profile table fetch failed: ${profileFetchError.message}. Make sure the 'profile' table exists in your Supabase database schema.`);
      }

      let activeProfile: Profile;

      if (!existingProfile) {
        // Auto-grant admin role if the register email domain matches verified admin targets
        const isDomainAdmin = authUser.email?.endsWith('@admin.com') || authUser.email?.endsWith('@jumia.com');
        const resolvedRole: UserRole = isDomainAdmin ? 'admin' : ((authUser.user_metadata?.role as UserRole) || 'buyer');

        // Create and write default profile record
        const newProfile: Profile = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Authenticated User',
          email: authUser.email || '',
          role: resolvedRole,
          created_at: new Date().toISOString()
        };

        const dbPayload = buildProfileDbPayload(newProfile, detectedProfileColumns);

        const { error: insertErr } = await supabase
          .from('profile')
          .upsert(dbPayload);

        if (insertErr) {
          throw new Error(`Failed to save user profile object: ${insertErr.message}. Ensure the 'profile' table exists in your database and that Row-Level-Security (RLS) policies allow client inserts.`);
        }
        activeProfile = newProfile;
      } else {
        activeProfile = mapDbToProfile(existingProfile);
      }

      // Now verify vendor storefront if we have vendor role clearance
      let activeVendor: Vendor | null = null;
      if (activeProfile.role === 'vendor') {
        const { data: vendorRows, error: vendorFetchError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', activeProfile.id);

        if (vendorFetchError) {
          throw new Error(`Vendor storefront fetch failed: ${vendorFetchError.message}. Make sure the 'vendors' table exists in your database schema.`);
        }

        const existingVendor = vendorRows && vendorRows.length > 0 ? vendorRows[0] : null;

        if (!existingVendor) {
          const tempStoreSlug = activeProfile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-store-' + Math.floor(Math.random() * 1000);
          const newVendor: Vendor = {
            id: generateUUID(),
            user_id: activeProfile.id,
            store_name: `${activeProfile.full_name}'s Corner`,
            store_slug: tempStoreSlug,
            description: 'Welcome to my premier vendor store!',
            created_at: new Date().toISOString()
          };

          const dbVendorPayload = buildVendorDbPayload(newVendor, detectedVendorColumns, activeProfile.email, activeProfile.role);

          const { error: insertVndErr } = await supabase
            .from('vendors')
            .upsert(dbVendorPayload);

          if (insertVndErr) {
            throw new Error(`Failed to save vendor storefront record: ${insertVndErr.message}. Ensure the 'vendors' table exists in your database and allows client writes under Row-Level-Security (RLS).`);
          }
          activeVendor = newVendor;
        } else {
          activeVendor = existingVendor as Vendor;
        }
      }

      return { profile: activeProfile, vendor: activeVendor };
    };

    const promise = runSync();
    activeSyncPromises.set(userId, promise);

    try {
      const res = await promise;
      return res;
    } finally {
      activeSyncPromises.delete(userId);
    }
  };

  // Check Supabase actual connection health & load initial metadata
  useEffect(() => {
    const initializeApp = async () => {
      setLoadingAuth(true);

      const detectDbSchema = async () => {
        if (!supabaseConfigured || !supabaseUrl || !supabaseAnonKey) return;
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: { apikey: supabaseAnonKey }
          });
          if (res.ok) {
            const spec = await res.json();
            if (spec && spec.definitions) {
              if (spec.definitions.profile) {
                const profileCols = Object.keys(spec.definitions.profile.properties || {});
                if (profileCols.length > 0) {
                  detectedProfileColumns = profileCols;
                  console.log('[Supabase Schema Detection] Detected profile columns:', detectedProfileColumns);
                }
              }
              if (spec.definitions.vendors) {
                const vendorCols = Object.keys(spec.definitions.vendors.properties || {});
                if (vendorCols.length > 0) {
                  detectedVendorColumns = vendorCols;
                  console.log('[Supabase Schema Detection] Detected vendor columns:', detectedVendorColumns);
                }
              }
              if (spec.definitions.products) {
                const productCols = Object.keys(spec.definitions.products.properties || {});
                if (productCols.length > 0) {
                  detectedProductColumns = productCols;
                  console.log('[Supabase Schema Detection] Detected product columns:', detectedProductColumns);
                }
              }
              if (spec.definitions.orders) {
                const orderCols = Object.keys(spec.definitions.orders.properties || {});
                if (orderCols.length > 0) {
                  detectedOrderColumns = orderCols;
                  console.log('[Supabase Schema Detection] Detected order columns:', detectedOrderColumns);
                }
              }
              if (spec.definitions.cart) {
                const cartCols = Object.keys(spec.definitions.cart.properties || {});
                if (cartCols.length > 0) {
                  detectedCartColumns = cartCols;
                  console.log('[Supabase Schema Detection] Detected cart columns:', detectedCartColumns);
                }
              }
            }
          }
        } catch (err) {
          console.warn('[Supabase Schema Detection] Failed to retrieve OpenAPI schema:', err);
        }
      };
      
      // Load cart from localStorage initially
      const cachedCart = localStorage.getItem('jumia_cart_items');
      if (cachedCart) {
        try {
          setCartItems(JSON.parse(cachedCart));
        } catch (_) {}
      }

      const fetchCartFromSupabase = async (userId: string) => {
        if (!supabase) return;
        try {
          const { data, error } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId);
          
          if (error) {
            console.error("[ShopContext] Failed to fetch cart from Supabase:", error);
            return;
          }

          if (data && data.length > 0) {
            console.log("[ShopContext] Loaded cart from Supabase:", data);
            // We need to associate product details because the cart table usually only has product_id
            const cartWithProducts: CartItem[] = data.map(dbItem => {
              const product = products.find(p => p.id === dbItem.product_id);
              return {
                id: dbItem.id || `cart-${Math.random().toString(36).substring(2, 9)}`,
                user_id: dbItem.user_id,
                product_id: dbItem.product_id,
                quantity: dbItem.quantity,
                product
              };
            });
            setCartItems(cartWithProducts);
          }
        } catch (err) {
          console.error("[ShopContext] Error fetching cart:", err);
        }
      };

      if (supabase && supabaseConfigured) {
        try {
          await detectDbSchema();
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;

          if (session?.user) {
            try {
              const { profile, vendor } = await syncUserProfileAndVendor(session.user);
              setCurrentUser(profile);
              setCurrentVendor(vendor);
              // Fetch cart after profile is synced
              await fetchCartFromSupabase(session.user.id);
            } catch (syncErr) {
              console.error("Initialize profile sync failed, falling back to basic setup", syncErr);
            }
          }

          setIsConnected(true);

          // Build listener for live Auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (currentSession?.user) {
              try {
                const { profile, vendor } = await syncUserProfileAndVendor(currentSession.user);
                setCurrentUser(profile);
                setCurrentVendor(vendor);
              } catch (syncErr) {
                console.error("Live auth state change profile sync failed", syncErr);
              }
            } else {
              setCurrentUser(null);
              setCurrentVendor(null);
            }
          });

          // Fetch products, vendors, profiles, orders
          await fetchMarketplaceData();

          return () => {
            subscription.unsubscribe();
          };

        } catch (err) {
          console.error("Supabase auth check failed. Sticking with safe empty state:", err);
          setIsConnected(false);
          setProducts([]);
          setVendors([]);
          setOrders([]);
        }
      } else {
        setIsConnected(false);
        setProducts([]);
        setVendors([]);
        setOrders([]);
      }
      setLoadingAuth(false);
    };

    initializeApp();
  }, [supabaseConfigured]);

  const fetchMarketplaceData = async () => {
    if (!supabase) return;
    try {
      // Products
      const { data: realProducts } = await supabase
        .from('products')
        .select('*');
      
      // Vendors
      const { data: realVendors } = await supabase
        .from('vendors')
        .select('*');

      // Unified orders fetch
      const { data: realOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Sync local collections
      if (realProducts) {
        setProducts((realProducts as any[]).map(mapDbToProduct));
      } else {
        setProducts([]);
      }

      setVendors((realVendors as any[]) || []);
      
      if (realOrders) {
        setOrders(realOrders.map(mapDbToOrder));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Database loading failed.", e);
      setProducts([]);
      setVendors([]);
      setOrders([]);
    }
  };

  // Sync Cart to local storage when changed
  useEffect(() => {
    localStorage.setItem('jumia_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ACTIONS ---

  // Auth: signup
  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    setLoadingAuth(true);
    if (isConnected && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role
            }
          }
        });

        if (error) throw error;

        // Attempt immediate database creation (may succeed depending on client credentials or trigger delays)
        let insertedProfile: Profile | null = null;
        let insertedVendor: Vendor | null = null;
        if (data.user) {
          try {
            // Unify insertion and validation of profile and vendor records under the deduplicated sync method
            const { profile, vendor } = await syncUserProfileAndVendor(data.user);
            insertedProfile = profile;
            insertedVendor = vendor;
          } catch (dbErr: any) {
            console.error("Database initialization failed during signup:", dbErr);
            throw new Error(`Account created in Supabase Auth, but application profile insertion failed! Detail: ${dbErr.message || dbErr}. Typically, this means you need to create 'profile' and 'vendors' tables in your Supabase project or adjust your database security policies.`);
          }
        }

        // If data.session is present, they are auto-logged in (email verification is off)
        if (data.user && data.session) {
          if (insertedProfile) {
            setCurrentUser(insertedProfile);
          }
          if (role === 'vendor' && insertedVendor) {
            setCurrentVendor(insertedVendor);
          }
          await fetchMarketplaceData();
          setLoadingAuth(false);
          return { success: true, emailVerificationRequired: false };
        }

        // If they succeeded but have no session, email verification is required
        setLoadingAuth(false);
        return { success: true, emailVerificationRequired: true };
      } catch (err: any) {
        setLoadingAuth(false);
        return { success: false, error: err.message || 'Operation failed' };
      }
    } else {
      setLoadingAuth(false);
      return { 
        success: false, 
        error: 'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your .env file.' 
      };
    }
  };

  // Auth: Login
  const signIn = async (email: string, password: string) => {
    setLoadingAuth(true);
    if (isConnected && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          try {
            const { profile, vendor } = await syncUserProfileAndVendor(data.user);
            setCurrentUser(profile);
            setCurrentVendor(vendor);
          } catch (syncErr: any) {
            console.error("Profile sync inside signIn failed", syncErr);
            throw new Error(`Successfully verified credentials, but failed to load application user profile! Detail: ${syncErr.message || syncErr}. Ensure that your Supabase databases tables 'profiles' and 'vendors' exist and are publicly accessible.`);
          }

          await fetchMarketplaceData();
          setLoadingAuth(false);
          return { success: true };
        }
        setLoadingAuth(false);
        return { success: false, error: 'Check credentials and try again.' };
      } catch (err: any) {
        setLoadingAuth(false);
        return { success: false, error: err.message || 'Log in attempt failed.' };
      }
    } else {
      setLoadingAuth(false);
      return { 
        success: false, 
        error: 'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your .env file.' 
      };
    }
  };

  // auth logout
  const signOut = async () => {
    if (isConnected && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentVendor(null);
    setCartItems([]);
  };

  // Helper: toggle user Roles dynamically (strictly regulated)
  const updateRole = async (role: UserRole) => {
    if (!currentUser || !isConnected || !supabase) return;
    
    // Safety: Buyers cannot promote themselves to Vendors via UI
    if (currentUser.role === 'buyer' && role === 'vendor') {
      console.error("Unauthorized role upgrade attempt blocked.");
      return;
    }

    try {
      // Only allow DB update if user is Admin OR if it's a valid downgrade/perspective switch
      // Actually, per user request, DB roles should be stable. 
      // We will only update the UI state unless it's a legitimate need.
      // But since currentUser is derived from DB, we HAVE to update DB to persist it correctly if that's the intent.
      // However, if the user says "this is wrong", I should avoid updating the DB for buyers.
      
      if (currentUser.role === 'admin' || currentUser.role === 'vendor') {
        await supabase
          .from('profile')
          .update({ role })
          .eq('id', currentUser.id);
        
        const updatedProfile = { ...currentUser, role };
        setCurrentUser(updatedProfile);
      } else {
        // For normal buyers, they stay buyers.
        console.warn("Role update ignored for base buyer account.");
        return;
      }
      
      // Ensure Vendor storefront exists for legitimate vendors/admins
      if (role === 'vendor') {
        const { data: vendorRows } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', currentUser.id);

        const existingVendor = vendorRows && vendorRows.length > 0 ? vendorRows[0] : null;
        let vendorData = existingVendor;

        if (!existingVendor) {
          const userSlug = currentUser.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-outlet';
          const vendorDataObj = {
            id: generateUUID(),
            user_id: currentUser.id,
            store_name: `${currentUser.full_name} Outlet`,
            store_slug: userSlug,
            description: 'Welcome to our premium storefront',
            created_at: new Date().toISOString()
          };
          const dbVendorPayload = buildVendorDbPayload(vendorDataObj, detectedVendorColumns, currentUser.email, role);
          const { data, error } = await supabase
            .from('vendors')
            .insert(dbVendorPayload)
            .select()
            .single();

          if (error) throw error;
          vendorData = data;
        }

        if (vendorData) {
          setCurrentVendor(vendorData as Vendor);
        }
      } else {
        setCurrentVendor(null);
      }
      await fetchMarketplaceData();
    } catch (err) {
      console.error("Could not sync role to database: ", err);
    }
  };

  // --- PRODUCTS MANAGEMENT ---

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    if (!isConnected || !supabase) {
      return { success: false, error: 'Supabase database is not configured.' };
    }
    const activeVendorId = currentVendor?.id || '';
    if (!activeVendorId) {
      console.warn("Attempted to add product but currentVendor is null");
      return { success: false, error: 'Vendor profile not fully loaded. Please synchronize your store or refresh.' };
    }
    try {
      const dbProductObj = {
        vendor_id: activeVendorId,
        title: productData.title,
        description: productData.description || '',
        price: productData.price,
        stock: productData.stock,
        image_url: productData.image_urls?.[0] || '',
        image_urls: productData.image_urls || [],
        category: productData.category || 'Electronics',
        slug: productData.slug,
        created_at: new Date().toISOString()
      };
      const dbPayload = buildProductDbPayload(dbProductObj, detectedProductColumns);

      // Force delete image_urls if we suspect it's not in the DB based on recent errors
      if (dbPayload.image_urls && !detectedProductColumns.includes('image_urls')) {
        delete dbPayload.image_urls;
      }

      console.log("[ShopContext] Inserting product with payload:", dbPayload);

      const { data, error } = await supabase
        .from('products')
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error("[ShopContext] Supabase insert error:", error);
        throw error;
      }
      
      const mapped = mapDbToProduct(data);
      setProducts(prev => [mapped, ...prev]);
      return { success: true, product: mapped };
    } catch (err: any) {
      console.error("Add product error final catch:", err);
      return { success: false, error: err.message || 'Failed to insert product into database.' };
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    if (!isConnected || !supabase) {
      return { success: false, error: 'Supabase database is not configured.' };
    }
    try {
      const unmappedPayload: any = { ...productData };
      if (productData.image_urls) {
        unmappedPayload.image_url = productData.image_urls?.[0] || '';
      }
      
      const dbPayload = buildProductDbPayload(unmappedPayload, detectedProductColumns);
      // Remove id and created_at from update payload
      delete dbPayload.id;
      delete dbPayload.created_at;

      const { data, error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      const mapped = mapDbToProduct(data);
      setProducts(prev => prev.map(p => p.id === productId ? mapped : p));
      return { success: true, product: mapped };
    } catch (err: any) {
      console.error("Update product error:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!isConnected || !supabase) {
      return { success: false, error: 'Supabase database is not configured.' };
    }
    try {
      console.log(`[ShopContext] Initiating delete for product: ${productId}`);
      
      // 1. Clear cart references first to avoid Foreign Key constraint issues (common blocker)
      // We do this in a try-catch because RLS might prevent vendors from modifying other users' carts
      try {
        const { error: cartDelErr } = await supabase
          .from('cart')
          .delete()
          .eq('product_id', productId);
        
        if (cartDelErr) {
          console.warn("[ShopContext] Potential RLS restriction while clearing carts:", cartDelErr);
        }
      } catch (err) {
        console.warn("[ShopContext] Cart cleanup skipped or failed:", err);
      }

      // 2. Attempt deletion of the product itself
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error("[ShopContext] Supabase product delete error:", error);
        if (error.code === '23503') {
          throw new Error('This product is referenced by existing orders or in-active carts and cannot be deleted. You can set its stock to 0 instead.');
        }
        throw error;
      }
      
      console.log(`[ShopContext] Successfully deleted product: ${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      return { success: true };
    } catch (err: any) {
      console.error("[ShopContext] Delete product error:", err);
      return { success: false, error: err.message || 'Deletion rejected by database policy.' };
    }
  };

  // --- CART SYSTEM (Strict client-side persistence representation) ---

  const addToCart = async (productId: string, quantity = 1) => {
    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    if (!currentUser) {
      toastError("Please login to add items to cart.");
      return;
    }

    const existingIdx = cartItems.findIndex(item => item.product_id === productId);
    const newTotalQuantity = existingIdx > -1 ? cartItems[existingIdx].quantity + quantity : quantity;

    // If connected, we MUST ensure Supabase is updated first per user request
    if (isConnected && supabase && currentUser) {
      const cartObj = {
        user_id: currentUser.id,
        product_id: productId,
        quantity: newTotalQuantity,
        created_at: new Date().toISOString()
      };
      
      const dbCartPayload = filterPayloadForTable(cartObj, detectedCartColumns);
      
      try {
        console.log(`[ShopContext] Syncing cart add for: ${productId} with quantity ${newTotalQuantity}`);
        
        // Consistent Delete -> Insert cycle to ensure one row per user/product pair.
        const { error: delErr } = await supabase.from('cart')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('product_id', productId);
        
        if (delErr) throw delErr;

        const { error: insErr } = await supabase.from('cart').insert(dbCartPayload);
        if (insErr) throw insErr;

        // Only update local state if DB succeeded
        setCartItems(prev => {
          const idx = prev.findIndex(item => item.product_id === productId);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx].quantity = newTotalQuantity;
            return updated;
          } else {
            return [...prev, {
              id: 'cart-' + Math.random().toString(36).substring(2, 9),
              user_id: currentUser.id,
              product_id: productId,
              quantity: newTotalQuantity,
              product: matchedProduct
            }];
          }
        });
        toastSuccess(`${matchedProduct.title} added to cart.`);
      } catch (err: any) {
        console.error("[ShopContext] Cart sync error:", err);
        toastError(`Failed to sync cart: ${err.message || "Database error"}`);
      }
    } else {
      // Offline/Guest fallback
      setCartItems(prev => {
        const idx = prev.findIndex(item => item.product_id === productId);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx].quantity += quantity;
          return updated;
        } else {
          return [...prev, {
            id: 'cart-' + Math.random().toString(36).substring(2, 9),
            user_id: currentUser?.id || 'guest',
            product_id: productId,
            quantity,
            product: matchedProduct
          }];
        }
      });
      toastSuccess(`${matchedProduct.title} added to cart.`);
    }
  };

  const removeFromCart = async (productId: string) => {
    console.log(`[ShopContext] removeFromCart CALLED for: ${productId}`);
    
    if (isConnected && supabase && currentUser) {
      try {
        console.log(`[ShopContext] Syncing cart removal with Supabase for product: ${productId}`);
        const { error } = await supabase.from('cart')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('product_id', productId);
        
        if (error) throw error;

        // Only remove from state if DB succeeded
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
        console.log(`[ShopContext] Removed from Supabase and frontend.`);
      } catch (err: any) {
        console.error("[ShopContext] Supabase removal error:", err);
        toastError(`Failed to remove item: ${err.message || "Database error"}`);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (isConnected && supabase && currentUser) {
      const cartObj = {
        quantity,
        created_at: new Date().toISOString()
      };
      const dbCartPayload = filterPayloadForTable(cartObj, detectedCartColumns);

      try {
        const { error } = await supabase.from('cart')
          .update(dbCartPayload)
          .eq('user_id', currentUser.id)
          .eq('product_id', productId);
        
        if (error) throw error;
        
        setCartItems(prev => prev.map(item => {
          if (item.product_id === productId) {
            return { ...item, quantity };
          }
          return item;
        }));
      } catch (err: any) {
        console.error("[ShopContext] Update cart quantity error:", err);
        toastError(`Failed to update quantity: ${err.message || "Database error"}`);
      }
    } else {
      setCartItems(prev => prev.map(item => {
        if (item.product_id === productId) {
          return { ...item, quantity };
        }
        return item;
      }));
    }
  };

  const clearCart = async () => {
    if (isConnected && supabase && currentUser) {
      try {
        const { error } = await supabase.from('cart')
          .delete()
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        setCartItems([]);
        toastSuccess("Cart cleared.");
      } catch (err: any) {
        console.error("[ShopContext] Clear cart error:", err);
        toastError(`Failed to clear cart: ${err.message || "Database error"}`);
      }
    } else {
      setCartItems([]);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.product?.price || 0;
    return acc + (itemPrice * item.quantity);
  }, 0);

  // --- ORDERS SYSTEM ---

  const placeOrder = async (shippingAddress: string, paymentReference?: string, paymentStatus: string = 'paid', skipClearCart: boolean = false) => {
    if (cartItems.length === 0) return { success: false, error: 'Empty Shopping Cart' };

    if (isConnected && supabase && currentUser) {
      try {
        const orderId = generateUUID();
        
        // Prepare items for JSON storage
        const itemsPayload = cartItems.map(item => ({
          id: generateUUID(),
          order_id: orderId,
          product_id: item.product_id,
          vendor_id: item.product?.vendor_id || null,
          quantity: item.quantity,
          price_at_purchase: item.product?.price || 0,
          created_at: new Date().toISOString(),
          // Store product metadata directly in the items array for zero-join retrieval
          product: item.product
        }));

        const newOrderObj = {
          id: orderId,
          buyer_id: currentUser.id,
          total_price: Number(cartTotal),
          status: paymentStatus === 'pending' ? 'pending' : 'paid',
          shipping_address: shippingAddress,
          customer_email: currentUser.email,
          items: itemsPayload,
          payment_reference: paymentReference || null,
          created_at: new Date().toISOString()
        };

        const dbOrderPayload = {
          id: newOrderObj.id,
          buyer_id: newOrderObj.buyer_id,
          total_price: newOrderObj.total_price,
          status: newOrderObj.status,
          shipping_address: newOrderObj.shipping_address,
          customer_email: newOrderObj.customer_email,
          items: newOrderObj.items,
          payment_reference: newOrderObj.payment_reference,
          created_at: newOrderObj.created_at
        };

        console.log("[ShopContext] Creating merged order record...", dbOrderPayload);
        
        const { error: ordErr } = await supabase
          .from('orders')
          .insert(dbOrderPayload);

        if (ordErr) throw ordErr;
        
        // Optimistic State Update
        const resolvedOrder = mapDbToOrder(newOrderObj);
        setOrders(prev => [resolvedOrder, ...prev]);
        
        if (!skipClearCart) {
          // Instant Cart Clear
          setCartItems([]);
          localStorage.removeItem('jumia_cart_items');
          
          try {
            await supabase.from('cart').delete().eq('user_id', currentUser.id);
          } catch (scErr) {
            console.warn("[ShopContext] Cart cleanup warning:", scErr);
          }
        }
        
        return { success: true, orderId: orderId };
      } catch (err: any) {
        console.error("[ShopContext] Merged Order Critical Failure:", err);
        return { success: false, error: err.message || 'Payment accepted but records failed to save.' };
      }
    } else {
      return { success: false, error: 'Database is not connected or signed in.' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (isConnected && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);

        if (error) throw error;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        return true;
      } catch (err: any) {
        console.error("[ShopContext] Update order status error:", err);
        return false;
      }
    }
    return false;
  };

  const updateOrderPayment = async (orderId: string, reference: string, status: string = 'paid') => {
    if (isConnected && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status, 
            payment_reference: reference 
          })
          .eq('id', orderId);

        if (error) throw error;
        
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status, payment_reference: reference } : o
        ));
        return true;
      } catch (err: any) {
        console.error("[ShopContext] Update order payment error:", err);
        return false;
      }
    }
    return false;
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    return updateOrderStatus(orderId, status);
  };

  // Re-fetch product detail associations on list changes (for cart rendering robustness)
  useEffect(() => {
    if (products.length > 0 && cartItems.length > 0) {
      const updated = cartItems.map(item => {
        if (!item.product) {
          const fresh = products.find(p => p.id === item.product_id);
          if (fresh) return { ...item, product: fresh };
        }
        return item;
      });
      // Simple shallow check to prevent infinite feedback
      const hasMissingProductDetails = cartItems.some(item => !item.product);
      if (hasMissingProductDetails) {
        setCartItems(updated);
      }
    }
  }, [products]);

  return (
    <ShopContext.Provider value={{
      isConnected,
      supabaseConfigured,
      products,
      vendors,
      profiles,
      orders,
      currentUser,
      currentVendor,
      loadingAuth,
      signUp,
      signIn,
      signOut,
      updateRole,
      addProduct,
      updateProduct,
      deleteProduct,
      cartItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      placeOrder,
      updateOrderStatus,
      updateOrderPayment,
      updatePaymentStatus,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
