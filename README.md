# Jumia Clone Professional Edition - Dev Documentation

This repository contains the source code for a production-grade, multivendor e-commerce marketplace built to emulate **Jumia.com**. It leverages **React**, **Tailwind CSS**, and **Supabase** for a scalable, secure, and fast shopping experience.

---

## 🤖 The Ultimate AI Build Prompt

*Use this prompt to replicate this exact architecture in any AI coding environment:*

> **You are an expert senior full-stack ecommerce engineer and UI/UX designer.**
>
> **Build a modern multivendor ecommerce marketplace inspired by the layout, structure, and shopping experience of Jumia.com.**
>
> The platform should support multiple vendors selling different categories of products including:
> - Groceries
> - Phones
> - Laptops
> - Fashion
> - Home Appliances
> - Electronics
> - Beauty Products
> - Gaming
> - Accessories
>
> The design should feel modern, clean, responsive, fast, and production-ready.
>
> ==================================================
> TECH STACK
> ==================================================
>
> **Frontend**:
> - React / Vite
> - Tailwind CSS
> - Framer Motion for subtle animations
> - Lucide React for modern iconography
>
> **Backend**:
> - Supabase (Auth, Database, Storage)
> - Row Level Security (RLS) for all tables
>
> ==================================================
> CORE ARCHITECTURE RULES
> ==================================================
> 1. **Unified Order System**: Orders must be created in the `orders` table snapshotting all items as a **JSONB** array *before* redirecting to payment.
> 2. **Authentication**: Three clear roles: `buyer`, `vendor`, `admin`.
> 3. **Persistence**: The cart must sync between standard local state and the Supabase `cart` table.
> 4. **Multivendor Visibility**: Vendors must only see orders containing their products (via JSONB item filtering).
> 5. **Clean Routing**: Use React Router for distinct pathing (`/product/:id`, `/category/:name`, `/store/:id`).
> 6. **Zero Mocking**: No fake data in production. All elements must pull from the database.

---

## 📖 Functional documentation

### 1. Unified Fulfillment Logic
To prevent loss of transaction data, we use a **Merged Order Schema**. Instead of splitting orders into two tables at the expensive database layer, we snapshot the state of the cart into a single `items` JSONB column in the `orders` record. This allows vendors to search for their `vendor_id` inside any global order and fulfill their specific items without affecting other vendors in the same order.

### 2. Synchronization Strategy
The `ShopContext` acts as the central brain. It:
- Detects the Supabase schema dynamically.
- Synchronizes Auth sessions with the `profile` table.
- Parallelizes marketplace data fetching (Products, Vendors, Orders) using `Promise.all`.
- Handles real-time cart updates with `localStorage` fallback for offline-first responsiveness.

---

## 🗄️ Database Schema & SQL Scripts

Copy and run this in your Supabase SQL Editor:

```sql
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
    UNIQUE(user_id, product_id)
);

-- 5. ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id),
    total_price DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'paid', 
    shipping_address TEXT NOT NULL,
    customer_email TEXT,
    payment_reference TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- POLICIES (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Product Policy (Public View, Vendor Manage)
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Vendors Manage Products" ON public.products ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);

-- Cart Policy (Private)
CREATE POLICY "Users Manage Cart" ON public.cart ALL USING (auth.uid() = user_id);

-- Order Policy (Private Buyer, Relevant Vendor)
CREATE POLICY "Buyers Manage Orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers Create Orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Vendors Fulfillment" ON public.orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jsonb_array_elements(items) as item 
        WHERE (item->>'vendor_id')::text = (
            SELECT id::text FROM public.vendors WHERE user_id = auth.uid() LIMIT 1
        )
    )
);
```

---

## 🚀 Deployment

### 1. Supabase Setup
- Create a new project at [supabase.com](https://supabase.com).
- Open the **SQL Editor** in the Supabase dashboard.
- Copy the content of `database.sql` (or the SQL block above) and run it.
- This will create the necessary tables (`profile`, `vendors`, `products`, `cart`, `orders`) and set up **Row Level Security** policies.

### 2. Environment Variables
Configure the following in your deployment platform (Vercel, Netlify, or local `.env`):
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Anon Key.
- `VITE_PAYSTACK_PUBLIC_KEY`: (Optional) For payment integration.

### 3. Build & Deploy
```bash
npm install
npm run build
```
The static files will be generated in the `dist/` directory, ready to be served by any static hosting provider.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Context API with real-time Supabase sync.

---

## 🏗️ Core Features Implemented
- **Professional Layout**: Jumia-inspired storefront with category navigation and flash sales.
- **Multivendor Engine**: Separate dashboards for Buyers, Vendors, and Admins.
- **Dynamic Cart**: Synchronizes between local storage and database for persistent shopping.
- **Real-time Order Snapping**: Orders preserve product data at the time of purchase in JSONB format.
- **No Mock Data**: Every product, vendor, and order is pulled directly from your Supabase instance.
