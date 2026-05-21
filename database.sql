-- JUMIA CLONE - UNIFIED ORDERS SCHEMA (Instant Reflection Architecture)
-- This schema merges 'orders' and 'order_items' to avoid complex joins and provide instant fulfillment updates.

-- 1. DROP OLD TABLES (OPTIONAL - BACKUP DATA IF NEEDED)
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;

-- 2. CREATE UNIFIED ORDERS TABLE
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

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES

-- Policy: Buyers can view their own order history
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = buyer_id);

-- Policy: Vendors can view orders containing their products
-- This SQL checks if the vendor's ID exists inside any object in the 'items' JSON array
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

-- Policy: Authenticated buyers can insert new orders
CREATE POLICY "Users can create orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = buyer_id);

-- Policy: Vendors can update status for orders containing their items
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

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
-- GIN index for fast JSON searches within the items array
CREATE INDEX IF NOT EXISTS orders_items_gin_idx ON public.orders USING GIN (items);
