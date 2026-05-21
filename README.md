# Jumia Clone - Professional E-Commerce Suite

This application is a high-performance, full-stack e-commerce marketplace built with **React**, **TypeScript**, and **Supabase**. It features a multi-vendor architecture, secure real-time payments via Paystack, and a unified order tracking system.

## 🏗️ Technical Architecture

- **Frontend**: React 18 (Stay on v18 for `react-paystack` compatibility) with Vite
- **Styling**: Tailwind CSS with Framer Motion animations
- **Backend / BaaS**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Paystack Gateway Integration
- **State Management**: React Context API with persistent Supabase synchronization

## 🛒 Core Features

### 1. Unified Unified Checkout
To prevent data loss during payment redirects, the app utilizes an "Instant Reflection" order architecture. Orders are created in a `pending` state with all line items nested as **JSONB** before the payment gateway is triggered. This ensures that even if a user closes their browser mid-payment, the order record and total price are preserved.

### 2. Multi-Vendor Dashboards
- **Buyer Dashboard**: Track order history, payment status (Pending/Paid), and regional delivery progress.
- **Vendor Dashboard**: Manage product inventory (CRUD), track store-specific sales, and update fulfillment status.
- **Admin Dashboard**: Global overview of marketplace health and platform-wide order management.

### 3. Smart Inventory
Automated stock tracking and real-time cart synchronization across devices using Supabase Realtime-inspired state updates.

---

## 📂 Database Schema Documentation

### Tables
| Table | Description | Key Columns |
| :--- | :--- | :--- |
| `profile` | User identity & roles | `id`, `email`, `role` (buyer/vendor/admin), `full_name` |
| `vendors` | Storefront metadata | `id`, `user_id`, `store_name`, `store_slug`, `description` |
| `products` | Marketplace inventory | `id`, `vendor_id`, `title`, `price`, `stock`, `image_urls` |
| `orders` | Transaction records | `id`, `buyer_id`, `items` (JSONB), `status`, `payment_reference` |
| `cart` | Persistent shopping sessions | `id`, `user_id`, `product_id`, `quantity` |

### Storage Buckets
- `product-images`: Public bucket for product galleries.
- `vendor-logos`: Public bucket for store branding.

---

## 🛠️ Supabase Setup & SQL Queries

Run the following SQL in your Supabase SQL Editor to initialize the backend:

### 1. Tables Creation
```sql
-- Profiles: Extended user data
create table public.profile (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vendors: Storefront information
create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profile(id) on delete cascade not null,
  store_name text not null,
  store_slug text unique not null,
  description text,
  logo_url text,
  email text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products: Inventory
create table public.products (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  price numeric not null,
  stock integer default 0,
  category text,
  image_url text,
  image_urls text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart: User sessions
create table public.cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profile(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Unified Orders: Nested JSON items prevent sync errors
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profile(id) on delete set null,
  total_price numeric not null,
  status text default 'pending',
  shipping_address text not null,
  customer_email text,
  payment_reference text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2. Row Level Security (RLS) Policies
```sql
-- Enable RLS
alter table public.profile enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.cart enable row level security;
alter table public.orders enable row level security;

-- Profile Policies
create policy "Public profiles are viewable by everyone" on public.profile for select using (true);
create policy "Users can update own profile" on public.profile for update using (auth.uid() = id);

-- Product Policies
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Vendors can manage own products" on public.products for all using (
  exists (select 1 from public.vendors where id = vendor_id and user_id = auth.uid())
);

-- Cart Policies
create policy "Users can manage own cart" on public.cart for all using (auth.uid() = user_id);

-- Order Policies
create policy "Buyers can view own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Buyers can insert own orders" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Vendors can view orders containing their products" on public.orders for select using (
  exists (
    select 1 from jsonb_array_elements(items) as item 
    where (item->>'vendor_id')::uuid in (select id from public.vendors where user_id = auth.uid())
  )
);
```

### 3. Storage Setup
```sql
-- Run this in the SQL editor or create manually in Storage UI
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public) values ('vendor-logos', 'vendor-logos', true);

create policy "Images are public" on storage.objects for select using (bucket_id = 'product-images');
create policy "Vendors can upload images" on storage.objects for insert with check (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
```

---

## 🤖 Re-Engineering Prompt for AI

*Copy and paste this prompt to another AI to replicate this project:*

> "Act as a Senior Full-Stack Engineer. Build a Jumia-inspired marketplace using React 18, Tailwind CSS, and Supabase. Implement a multi-role system (Buyer, Vendor, Admin) where Vendors can manage products and Buyers can purchase via Paystack. Key Requirement: Use a Unified Order Architecture where the checkout process creates a pending order with all cart items stored as a JSONB array in a single 'orders' table. This must happen BEFORE the Paystack popup triggers to ensure data integrity. After payment success, the system must update the order status to 'paid' using the Paystack reference. Secure the database using Row Level Security (RLS) where users only see their own orders or products. Ensure the frontend uses a highly polished Jumia-branded aesthetic with orange accents and smooth motion transitions."

