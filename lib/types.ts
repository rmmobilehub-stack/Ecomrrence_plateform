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
  primaryColor: string;
  currency: string;
  contactEmail: string;
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
  total: number;
  paymentMethod: 'COD';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
