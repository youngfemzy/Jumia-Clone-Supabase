export type UserRole = 'buyer' | 'vendor' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_urls: string[];
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  // Join fields supported
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  // Join fields supported
  product?: Product;
}

export type CategoryType = 
  | 'Groceries'
  | 'Phones'
  | 'Laptops'
  | 'Fashion'
  | 'Home Appliances'
  | 'Electronics'
  | 'Beauty Products'
  | 'Gaming'
  | 'Accessories';

export const CATEGORIES: CategoryType[] = [
  'Groceries',
  'Phones',
  'Laptops',
  'Fashion',
  'Home Appliances',
  'Electronics',
  'Beauty Products',
  'Gaming',
  'Accessories'
];
