import { Product, Vendor, CategoryType } from '../types';

export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: 'v-1',
    user_id: 'u-vendor-1',
    store_name: 'ElectroMax Direct',
    store_slug: 'electromax-direct',
    logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=85',
    description: 'Universal and authentic electronics from top global manufacturers.',
    created_at: new Date().toISOString()
  },
  {
    id: 'v-2',
    user_id: 'u-vendor-2',
    store_name: 'Fashion hub',
    store_slug: 'fashion-hub',
    logo_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=85',
    description: 'Chic, modern, and traditional apparel for all seasons.',
    created_at: new Date().toISOString()
  },
  {
    id: 'v-3',
    user_id: 'u-vendor-3',
    store_name: 'Pantry & Co.',
    store_slug: 'pantry-co',
    logo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=85',
    description: 'Fresh groceries, food items, utilities to round out your daily pantry needs.',
    created_at: new Date().toISOString()
  },
  {
    id: 'v-4',
    user_id: 'u-vendor-4',
    store_name: 'Aura Beauty Care',
    store_slug: 'aura-beauty-care',
    logo_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=85',
    description: 'Dermatologist tested makeup, skincare serums, and premium cosmetics.',
    created_at: new Date().toISOString()
  }
];

export const SAMPLE_PRODUCTS: Product[] = [
  // PHONES
  {
    id: 'p-iphone15',
    vendor_id: 'v-1',
    title: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    slug: 'apple-iphone-15-pro-max-256gb',
    description: 'The titanium design, revolutionary A17 Pro chip, customisable Action button, and longest optical zoom ever on an iPhone.',
    category: 'Phones',
    price: 1199,
    stock: 14,
    image_urls: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-samsung24',
    vendor_id: 'v-1',
    title: 'Samsung Galaxy S24 Ultra - 512GB - Titanium Grey',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    description: 'Equipped with Galaxy AI, a 200MP camera, built-in S Pen, and the fastest processor for supreme multitasking.',
    category: 'Phones',
    price: 1299,
    stock: 8,
    image_urls: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-xiaomi14',
    vendor_id: 'v-1',
    title: 'Xiaomi Redmi Note 13 Pro 4G - 8GB RAM - 256GB ROM',
    slug: 'xiaomi-redmi-note-13-pro-4g',
    description: 'Ultra-clear 200MP camera with OIS. 120Hz FHD+ AMOLED display. 67W turbo charging with 5000mAh battery.',
    category: 'Phones',
    price: 269,
    stock: 35,
    image_urls: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // LAPTOPS
  {
    id: 'p-macbook',
    vendor_id: 'v-1',
    title: 'Apple MacBook Pro 16" (M3 Max, 36GB Unified Memory, 1TB SSD) - Space Black',
    slug: 'apple-macbook-pro-16-m3-max',
    description: 'The most advanced laptop chip for creators, coders, and developers. Gorgeous Liquid Retina XDR screen with up to 22h battery life.',
    category: 'Laptops',
    price: 3199,
    stock: 5,
    image_urls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-hp-pavilion',
    vendor_id: 'v-1',
    title: 'HP Pavilion 15.6" Touchscreen Laptop - Core i5 - 16GB RAM - 512GB SSD',
    slug: 'hp-pavilion-15-touchscreen-i5',
    description: 'Thin, light, and powerful notebook for everyday productivity. Vibrant display, premium audio, and long stellar battery life.',
    category: 'Laptops',
    price: 599,
    stock: 12,
    image_urls: [
      'https://images.unsplash.com/photo-1496181130204-7552cc14b1e0?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // GROCERIES
  {
    id: 'p-rice',
    vendor_id: 'v-3',
    title: 'DeLuxe Premium Basmati Rice - Extra Long Grain - 5kg Bag',
    slug: 'deluxe-premium-basmati-rice-5kg',
    description: 'Aromatic, perfectly aged, non-sticky premium quality basmati rice. Sourced from organic Himalayan valleys.',
    category: 'Groceries',
    price: 18.50,
    stock: 150,
    image_urls: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-sunflower-oil',
    vendor_id: 'v-3',
    title: 'Healthee Pure Refined Sunflower Cooking Oil - 3L Bottle',
    slug: 'healthee-pure-sunflower-cooking-oil-3l',
    description: 'Rich in Vitamin E, cholesterol free, high smoke point oil ideal for frying, baking, and healthy family meals.',
    category: 'Groceries',
    price: 11.20,
    stock: 85,
    image_urls: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // FASHION
  {
    id: 'p-sneakers',
    vendor_id: 'v-2',
    title: 'Retro Classic Leather Sneakers - Unisex Athletic Court Shoes',
    slug: 'retro-classic-leather-sneakers-unisex',
    description: 'Durable full-grain leather outer with padded collars and breathable mesh lining. Ortholite insoles for dual cushioning all day.',
    category: 'Fashion',
    price: 79.99,
    stock: 40,
    image_urls: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-watch',
    vendor_id: 'v-2',
    title: 'Classic Quartz Minimalist Wristwatch - Tan Leather Strap',
    slug: 'classic-quartz-minimalist-wristwatch',
    description: 'Elegant luxury watch featuring a 40mm charcoal dial with polished hands and reliable high-precision Swiss-quartz movement.',
    category: 'Fashion',
    price: 125,
    stock: 15,
    image_urls: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // HOME APPLIANCES
  {
    id: 'p-microwave',
    vendor_id: 'v-1',
    title: 'Smart Inverter Grill Microwave Oven - 25 Litres Capacity',
    slug: 'smart-inverter-grill-microwave-25l',
    description: 'Provides precise heating controls and fast multi-angle cooking. Healthy fry function and anti-bacterial cavity coating.',
    category: 'Home Appliances',
    price: 189,
    stock: 7,
    image_urls: [
      'https://images.unsplash.com/photo-1585659722982-79c750d5117a?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-blender',
    vendor_id: 'v-1',
    title: 'Apex Pro High-Speed Countertop Smoothie Blender - 1200W',
    slug: 'apex-pro-high-speed-smoothie-blender-1200w',
    description: 'Tough stainless steel blades crush ice, nuts, frozen fruits in seconds. Included portable sports jar and 2L main glass pitcher.',
    category: 'Home Appliances',
    price: 85,
    stock: 22,
    image_urls: [
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // ELECTRONICS
  {
    id: 'p-smarttv',
    vendor_id: 'v-1',
    title: 'Crystal Clear 4K UHD LED Smart TV - 55-inch with Atmos Audio',
    slug: 'crystal-clear-4k-uhd-led-smart-tv-55',
    description: 'Astonishing 4K detail with built-in streaming apps. AirPlay and Chromecast support. Cinematic Dolby Atmos rich sound.',
    category: 'Electronics',
    price: 449,
    stock: 9,
    image_urls: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'p-headphones',
    vendor_id: 'v-1',
    title: 'Acoustic Pro Active Noise Cancelling Wireless Headphones',
    slug: 'acoustic-pro-active-noise-cancelling-headphones',
    description: 'Hybrid ANC blocks 95% of background noise. Crystal clear calling microphones. 40 hours of dense high-fidelity playtime.',
    category: 'Electronics',
    price: 149,
    stock: 18,
    image_urls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // BEAUTY PRODUCTS
  {
    id: 'p-serum',
    vendor_id: 'v-4',
    title: 'Vibrant Skin Hydrating Face Serum with Pure Vitamin C & E',
    slug: 'vibrant-skin-hydrating-vitamin-c-serum',
    description: 'Dramatically brightens dark spots, boosts skin elasticity, and hydrates with double botanical hyaluronic acid formulas.',
    category: 'Beauty Products',
    price: 24.90,
    stock: 120,
    image_urls: [
      'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // GAMING
  {
    id: 'p-console',
    vendor_id: 'v-1',
    title: 'Sony PlayStation 5 Console Slim Edition - White - 1TB SSD',
    slug: 'sony-playstation-5-console-slim-1tb',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers and 3D Audio.',
    category: 'Gaming',
    price: 499,
    stock: 4,
    image_urls: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  },

  // ACCESSORIES
  {
    id: 'p-powerbank',
    vendor_id: 'v-1',
    title: 'ChargeSync Fast Charging 20,000mAh Power Bank - 22.5W',
    slug: 'chargesync-fast-charging-20000mah-power-bank',
    description: 'Dual USB-A and USB-C power delivery ports capable of charging a modern smartphone up to three times over safely.',
    category: 'Accessories',
    price: 35,
    stock: 60,
    image_urls: [
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&auto=format&fit=crop&q=80'
    ],
    created_at: new Date().toISOString()
  }
];

export const PROMOTIONS = [
  {
    id: 'p-1',
    title: 'Flash Sales Active Now',
    subtitle: 'Save up to 60% on our premier electronic brands!',
    bgGradient: 'from-orange-500 to-amber-600',
    tag: 'Electronics Mega-Week',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=450&auto=format&fit=crop&q=80'
  },
  {
    id: 'p-2',
    title: 'Freshness Guaranteed',
    subtitle: 'Daily essentials delivered directly to your doorstep in 1 hour.',
    bgGradient: 'from-green-600 to-emerald-700',
    tag: 'Groceries Prime',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=450&auto=format&fit=crop&q=80'
  },
  {
    id: 'p-3',
    title: 'Walk in Absolute Comfort',
    subtitle: 'A stunning roster of shoes and premium sneakers at incredible prices.',
    bgGradient: 'from-indigo-600 to-blue-700',
    tag: 'Fashion Forward',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=450&auto=format&fit=crop&q=80'
  }
];
