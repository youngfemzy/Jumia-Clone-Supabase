-- JUMIA CLONE - FULL DATABASE SCHEMA
-- Use this script in the Supabase SQL Editor to initialize all required tables.

-- 1. PROFILES Table
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. VENDORS Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    store_name TEXT NOT NULL,
    store_slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 1,
    category TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CART Table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- CRITICAL: Unique constraint for upsert functionality
    UNIQUE(user_id, product_id)
);

-- 5. ORDERS TABLE (Unified Schema)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'paid', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
    shipping_address TEXT NOT NULL,
    customer_email TEXT,
    payment_reference TEXT,
    -- 'items' column stores the entire order bundle as a JSON array for instant retrieval
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profile FOR UPDATE USING (auth.uid() = id);

-- Vendors
CREATE POLICY "Public vendors are viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own store" ON public.vendors ALL USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own products" ON public.products ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);

-- Cart
CREATE POLICY "Users can manage own cart" ON public.cart ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = buyer_id);

-- Multi-vendor order visibility (Vendors see orders containing their products)
CREATE POLICY "Vendors can view relevant orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM jsonb_array_elements(items) as item 
        WHERE (item->>'vendor_id')::text = (
            SELECT id::text FROM public.vendors WHERE user_id = auth.uid() LIMIT 1
        )
    )
);

CREATE POLICY "Vendors can update order status" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM jsonb_array_elements(items) as item 
        WHERE (item->>'vendor_id')::text = (
            SELECT id::text FROM public.vendors WHERE user_id = auth.uid() LIMIT 1
        )
    )
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS products_vendor_id_idx ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS cart_user_id_idx ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_items_gin_idx ON public.orders USING GIN (items);
