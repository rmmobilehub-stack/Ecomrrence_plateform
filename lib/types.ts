// Shared TypeScript types for the entire platform

export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  status: 'active' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
  storeId: string;
  createdAt: string;
}

export interface Store {
  id: string;
  adminId: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  heroTitle?: string;
  heroCtaLabel?: string;
  announcement?: string;
  primaryColor: string;
  currency: string;
  contactEmail: string;
  whatsappNumber?: string;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface CustomProperty {
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

export interface ProductVariant {
  name: string;
  options: string[];
  priceModifier: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number;
  discount: number;
  images: string[];
  thumbnail: string;
  categoryId: string;
  tags: string[];
  stock: number;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  customProperties: CustomProperty[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  thumbnail: string;
  qty: number;
  price: number;
  originalPrice?: number;
  selectedVariants: Record<string, string>;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  productDiscount?: number;
  discount?: number;
  couponCode?: string;
  deliveryFee?: number;
  total: number;
  paymentMethod: 'COD';
  channel?: 'website' | 'whatsapp';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Discount {
  id: string;
  storeId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  adminId: string;
  type: 'new_order';
  title: string;
  message: string;
  orderId: string;
  isRead: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  qty: number;
  selectedVariants: Record<string, string>;
}

export type UserRole = 'super-admin' | 'admin';

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
  storeId?: string;
}
