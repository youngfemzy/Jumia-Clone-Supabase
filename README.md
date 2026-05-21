# Jumia Clone - Professional E-Commerce Suite

This is a high-performance, multi-vendor e-commerce marketplace inspired by Jumia.com. It features a modern React frontend and a scalable Supabase backend with high-integrity payment processing.

---

## 📖 Full Documentation

### Core Ecosystem
You are building a modern multivendor ecommerce marketplace inspired by the layout, structure, and shopping experience of Jumia.com.

The platform supports multiple vendors selling hardware, fashion, electronics, and daily essentials across these categories:
- Groceries, Phones, Laptops, Fashion, Home Appliances, Electronics, Beauty Products, Gaming, Accessories.

### Important Development Rules
- **Direct Integration**: No fake backend logic or mock auth. All data flows directly through Supabase.
- **Unified Order Architecture**: To prevent "stuck" orders during payment redirects, orders are created in a `pending` state with all line items nested as **JSONB** in the `orders` table *before* the payment gateway (Paystack) is triggered.
- **Security**: Row Level Security (RLS) is strictly enforced for all user roles.
- **Performance**: High use of Tailwind CSS for styling and Framer Motion for premium transitions.
- **Mobile First**: Fully responsive UI with a sticky header and mobile bottom navigation.

### Pages & Dashboards
- **Public**: Home (Jumia-style), Product List, Categories, Product Detail, Vendor Storefronts, Cart, Checkout.
- **Buyer Dashboard**: Order history tracking and payment status management.
- **Vendor Dashboard**: Inventory CRUD, Sales overview, and fulfillment status updates.
- **Admin Dashboard**: Global platform management for users, vendors, and orders.

---

## 📂 Database Schema

### Tables
| Table | Fields | RLS Rules |
| :--- | :--- | :--- |
| `profile` | `id`, `full_name`, `email`, `role` (buyer/vendor/admin), `avatar_url` | Users manage own; Admin manages all. |
| `vendors` | `id`, `user_id`, `store_name`, `store_slug`, `logo_url`, `banner_url`, `description` | Public view; Vendors manage own. |
| `products` | `id`, `vendor_id`, `title`, `slug`, `description`, `category`, `price`, `stock`, `image_urls` | Public view; Vendors manage own inventory. |
| `orders` | `id`, `buyer_id`, `total_price`, `status`, `shipping_address`, `items` (JSONB), `payment_reference` | Buyers manage own; Admin manages all. |
| `cart` | `id`, `user_id`, `product_id`, `quantity` | Users manage own cart sessions. |

### Storage Buckets
- `product-images`: Public read access. Vendors can upload/delete their own product assets.
- `store-assets`: Logos and banners for vendor branding.
- `receipts`: Storage for payment invoices and receipts.

---

## 🤖 Re-Engineering Prompt for AI

*Copy and paste this prompt to another AI to replicate this project with maximum accuracy:*

> "You are an expert senior full-stack ecommerce engineer and UI/UX designer. Build a modern multivendor ecommerce marketplace inspired by the layout, structure, and shopping experience of Jumia.com.
> 
> **Tech Stack**: React 18 (Vite), Tailwind CSS, Framer Motion, and Supabase.
> 
> **Core Architecture Requirements**: 
> 1. **Unified Order System**: Checkout must create a row in the `orders` table with status 'pending' AND all cart items stored as a JSONB array (`items` column) BEFORE the Paystack popup triggers. This ensures the order exists even if the popup is closed or the user refreshes. 
> 2. **Roles**: Handle 'buyer', 'vendor', and 'admin' roles using Supabase Auth and a linked `profile` table.
> 3. **UI/UX**: Implement a Jumia-branded aesthetic (Orange/White/Gold) with a sticky header, mobile bottom navigation, and skeleton loading states.
> 4. **Fulfillment**: Vendors must see orders containing their products (via JSONB item filtering) and be able to update status.
> 
> **Database Structure**:
> - `profile`: Extended auth data.
> - `vendors`: Store info linked to profiles.
> - `products`: Managed by vendors, searchable by category.
> - `orders`: Single table using JSONB for line items to avoid complex multi-table insert failures during payment.
> - `cart`: Persistent database-backed shopping cart.
> 
> **Rules**: No mock data. Connect directly to Supabase. Implement RLS policies for every table. Use storage buckets for images."

---

## 🛠️ SQL Initialization Script

```sql
-- 1. Tables Creation
create table public.profile (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profile(id) on delete cascade not null,
  store_name text not null,
  store_slug text unique not null,
  description text,
  logo_url text,
  banner_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.products (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  price numeric not null,
  stock integer default 0,
  category text,
  image_urls text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profile(id) on delete set null,
  total_price numeric not null,
  status text default 'pending', -- 'pending', 'paid', 'shipped', 'delivered'
  shipping_address text not null,
  customer_email text,
  payment_reference text,
  items jsonb not null default '[]'::jsonb, -- Unified line items
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profile(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Security (RLS)
alter table public.profile enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.cart enable row level security;

create policy "Profiles visible to all" on public.profile for select using (true);
create policy "Users update own profile" on public.profile for update using (auth.uid() = id);

create policy "Vendors visible to all" on public.vendors for select using (true);
create policy "Vendors manage own store" on public.vendors for all using (user_id = auth.uid());

create policy "Products visible to all" on public.products for select using (true);
create policy "Vendors manage products" on public.products for all using (
  exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
);

create policy "Buyers view own orders" on public.orders for select using (auth.uid() = buyer_id);
create policy "Buyers create orders" on public.orders for insert with check (auth.uid() = buyer_id);

create policy "Users manage own cart" on public.cart for all using (auth.uid() = user_id);

-- 3. Storage Buckets
-- Create 'product-images', 'store-assets', and 'receipts' buckets manually in UI or via API
-- Ensure 'product-images' is public.
```
