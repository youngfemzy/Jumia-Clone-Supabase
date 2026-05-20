import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Vendor, Profile, Order, OrderItem, CartItem, UserRole, CategoryType } from '../types';
import { getSupabase, isConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { SAMPLE_PRODUCTS, SAMPLE_VENDORS } from '../data/dummyData';

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
let detectedProductColumns: string[] = ['id', 'vendor_id', 'title', 'description', 'price', 'stock', 'image_url', 'image_urls', 'category', 'slug', 'created_at'];
let detectedOrderColumns: string[] = ['id', 'buyer_id', 'total_price', 'status', 'created_at'];
let detectedOrderItemColumns: string[] = ['id', 'order_id', 'product_id', 'quantity', 'price_at_purchase', 'created_at'];
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
  const hasColumn = (name: string) => columns.includes(name);
  
  const payload: any = {
    id: product.id,
    vendor_id: product.vendor_id,
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,
    created_at: product.created_at
  };

  if (hasColumn('image_url')) {
    payload.image_url = product.image_url || (product.image_urls && product.image_urls[0]) || '';
  }
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
    payment_status: dbObj.payment_status || (dbObj.status === 'paid' ? 'paid' : 'pending'),
    order_status: dbObj.order_status || (dbObj.status && dbObj.status !== 'paid' ? dbObj.status : 'pending'),
    shipping_address: dbObj.shipping_address || 'Default Address',
    created_at: dbObj.created_at || new Date().toISOString()
  };
};

const buildOrderDbPayload = (order: any, columns: string[]): any => {
  const hasColumn = (name: string) => columns.includes(name);

  const payload: any = {
    id: order.id,
    buyer_id: order.buyer_id,
    total_price: order.total_price,
    created_at: order.created_at
  };

  if (hasColumn('status')) {
    payload.status = order.payment_status === 'paid' ? 'paid' : order.order_status || 'pending';
  }
  if (hasColumn('payment_status')) {
    payload.payment_status = order.payment_status;
  }
  if (hasColumn('order_status')) {
    payload.order_status = order.order_status;
  }
  if (hasColumn('shipping_address')) {
    payload.shipping_address = order.shipping_address;
  }

  return filterPayloadForTable(payload, columns);
};

const buildOrderItemDbPayload = (item: any, columns: string[]): any => {
  return filterPayloadForTable(item, columns);
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
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Order Operations
  placeOrder: (shippingAddress: string) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: Order['order_status']) => Promise<boolean>;
  updatePaymentStatus: (orderId: string, status: Order['payment_status']) => Promise<boolean>;

  // Filter/UI helpers
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const activeSyncPromises = new Map<string, Promise<{ profile: Profile; vendor: Vendor | null }>>();

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = getSupabase();
  const supabaseConfigured = isConfigured;

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
              if (spec.definitions.order_items) {
                const orderItemCols = Object.keys(spec.definitions.order_items.properties || {});
                if (orderItemCols.length > 0) {
                  detectedOrderItemColumns = orderItemCols;
                  console.log('[Supabase Schema Detection] Detected order_items columns:', detectedOrderItemColumns);
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

      // Orders
      const { data: realOrders } = await supabase
        .from('orders')
        .select('*');

      // Sync local collections
      if (realProducts) {
        setProducts((realProducts as any[]).map(mapDbToProduct));
      } else {
        setProducts([]);
      }

      if (realVendors) {
        setVendors(realVendors as Vendor[]);
      } else {
        setVendors([]);
      }

      if (realOrders) {
        setOrders((realOrders as any[]).map(mapDbToOrder));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Database loading failed. Ensuring safe empty state.", e);
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

  // Helper: toggle user Roles dynamically
  const updateRole = async (role: UserRole) => {
    if (!currentUser || !isConnected || !supabase) return;
    
    try {
      await supabase
        .from('profile')
        .update({ role })
        .eq('id', currentUser.id);
      
      const updatedProfile = { ...currentUser, role };
      setCurrentUser(updatedProfile);

      // Ensure Vendor storefront exists
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
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        image_url: productData.image_urls?.[0] || '',
        image_urls: productData.image_urls || [],
        category: productData.category,
        slug: productData.slug,
        created_at: new Date().toISOString()
      };
      const dbPayload = buildProductDbPayload(dbProductObj, detectedProductColumns);

      const { data, error } = await supabase
        .from('products')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;
      const mapped = mapDbToProduct(data);
      setProducts(prev => [mapped, ...prev]);
      return { success: true, product: mapped };
    } catch (err: any) {
      console.error("Add product error:", err);
      return { success: false, error: err.message };
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // --- CART SYSTEM (Strict client-side persistence representation) ---

  const addToCart = (productId: string, quantity = 1) => {
    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.product_id === productId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
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

    // If connected, we push changes to Supabase 'cart' table in the background
    if (isConnected && supabase && currentUser) {
      const cartObj = {
        user_id: currentUser.id,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString()
      };
      const dbCartPayload = filterPayloadForTable(cartObj, detectedCartColumns);
      
      supabase.from('cart').insert(dbCartPayload).then(({ error }) => {
        if (error) console.warn("Could not sync added card item:", error);
      });
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
    
    if (isConnected && supabase && currentUser) {
      supabase.from('cart')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('product_id', productId)
        .then(({ error }) => {
          if (error) console.warn("Could not remove item from remote sync cart:", error);
        });
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity };
      }
      return item;
    }));

    if (isConnected && supabase && currentUser) {
      const cartObj = {
        quantity,
        created_at: new Date().toISOString()
      };
      const dbCartPayload = filterPayloadForTable(cartObj, detectedCartColumns);

      supabase.from('cart')
        .update(dbCartPayload)
        .eq('user_id', currentUser.id)
        .eq('product_id', productId)
        .then(({ error }) => {
          if (error) console.warn("Could not sync quantity in base:", error);
        });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (isConnected && supabase && currentUser) {
      supabase.from('cart')
        .delete()
        .eq('user_id', currentUser.id)
        .then(({ error }) => {
          if (error) console.warn("Failed to clear remote cart state:", error);
        });
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.product?.price || 0;
    return acc + (itemPrice * item.quantity);
  }, 0);

  // --- ORDERS SYSTEM ---

  const placeOrder = async (shippingAddress: string) => {
    if (cartItems.length === 0) return { success: false, error: 'Empty Shopping Cart' };

    if (isConnected && supabase && currentUser) {
      try {
        const orderId = generateUUID();
        const newOrderObj = {
          id: orderId,
          buyer_id: currentUser.id,
          total_price: cartTotal,
          payment_status: 'pending',
          order_status: 'pending',
          shipping_address: shippingAddress,
          created_at: new Date().toISOString()
        };

        const dbOrderPayload = buildOrderDbPayload(newOrderObj, detectedOrderColumns);

        // Create order
        const { data: ordRaw, error: ordErr } = await supabase
          .from('orders')
          .insert(dbOrderPayload)
          .select()
          .single();

        if (ordErr) throw ordErr;

        const resolvedOrder = mapDbToOrder(ordRaw);

        // Create order items
        const rawItems = cartItems.map(item => {
          const itemObj = {
            order_id: resolvedOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.product?.price || 0,
            created_at: new Date().toISOString()
          };
          return buildOrderItemDbPayload(itemObj, detectedOrderItemColumns);
        });

        const { error: itemErr } = await supabase
          .from('order_items')
          .insert(rawItems);

        if (itemErr) throw itemErr;

        setOrders(prev => [resolvedOrder, ...prev]);
        clearCart();
        return { success: true, orderId: resolvedOrder.id };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    } else {
      return { success: false, error: 'Database is not connected or signed in. Orders cannot be created.' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['order_status']) => {
    if (isConnected && supabase) {
      try {
        const payload: any = {};
        if (detectedOrderColumns.includes('order_status')) {
          payload.order_status = status;
        }
        if (detectedOrderColumns.includes('status')) {
          payload.status = status;
        }

        const { error } = await supabase
          .from('orders')
          .update(payload)
          .eq('id', orderId);

        if (error) throw error;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: status } : o));
        return true;
      } catch (_) {
        return false;
      }
    } else {
      return false;
    }
  };

  const updatePaymentStatus = async (orderId: string, status: Order['payment_status']) => {
    if (isConnected && supabase) {
      try {
        const payload: any = {};
        if (detectedOrderColumns.includes('payment_status')) {
          payload.payment_status = status;
        }
        if (detectedOrderColumns.includes('status')) {
          payload.status = status === 'paid' ? 'paid' : status;
        }

        const { error } = await supabase
          .from('orders')
          .update(payload)
          .eq('id', orderId);

        if (error) throw error;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: status } : o));
        return true;
      } catch (_) {
        return false;
      }
    } else {
      return false;
    }
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
