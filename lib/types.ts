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
  adminId?: string | null;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  heroSlides: string[];
  heroTitle?: string;
  heroCtaLabel?: string;
  announcement?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string;
  ads?: StoreAd[];
  primaryColor: string;
  currency: string;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: string;
  whatsappNumber?: string;
  contactWidgetMode?: 'chatbot' | 'whatsapp' | 'both' | 'none';
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface StoreAd {
  id: string;
  type: 'image' | 'video';
  title: string;
  mediaUrl: string;
  linkUrl?: string;
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

export interface StatusNotifyEntry {
  status: string;
  note: string;
  at: string;
  emailSent: boolean;
}

export interface CustomerAccount {
  id: string;
  storeId: string;
  email: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  passwordHash?: string;
  googleId?: string | null;
  facebookId?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId?: string | null;
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
  adminNote?: string;
  statusUpdates?: StatusNotifyEntry[];
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

export interface Lead {
  id: string;
  storeId: string;
  name: string;
  contact: string;
  interest: string;
  source: 'chatbot';
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  conversation: { role: 'visitor' | 'assistant'; message: string }[];
  createdAt: string;
}

export interface RepairBookingCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface RepairBookingDevice {
  modelId: string;
  modelName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  simTypeId: string;
  simTypeName: string;
  simTypeDescription: string;
}

export interface RepairBookingIssue {
  issueId: string;
  issueName: string;
  description: string;
  detail?: string;
}

export interface RepairDeviceCondition {
  screenCondition: 'all_neat' | 'some_scratches' | 'many_scratches';
  bodyFlags: Array<'scratches' | 'side_rough' | 'body_changed' | 'back_glass_changed'>;
  partsChanged: Array<'glass' | 'battery' | 'front_camera' | 'back_camera'>;
  overallOutOf10: number;
  batteryHealthPercent: number;
  ageYears: number;
  ownership: 'first_owner' | 'box_pack' | 'used' | 'non_active';
  additionalNote?: string;
}

export interface RepairDeviceEstimate {
  score: number;
  scoreLabel: string;
  marketValueMinPkr: number;
  marketValueMaxPkr: number;
  currency: 'PKR';
  summary: string;
  suggestions: string[];
  buySuggestions?: string[];
  source: 'rules';
}

export interface RepairBooking {
  id: string;
  storeId: string;
  bookingNumber: string;
  customerId?: string | null;
  customer: RepairBookingCustomer;
  device: RepairBookingDevice;
  issue: RepairBookingIssue;
  preferredDate?: string;
  preferredTime?: string;
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  adminNote?: string;
  statusUpdates?: StatusNotifyEntry[];
  deviceCondition?: RepairDeviceCondition;
  deviceEstimate?: RepairDeviceEstimate;
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

export type UserRole = 'super-admin' | 'admin' | 'customer';

export interface AuthPayload {
  id: string;
  email: string;
  role: UserRole;
  storeId?: string;
}

export interface CustomerAuthPayload {
  id: string;
  email: string;
  name: string;
  role: 'customer';
  storeId: string;
  avatarUrl?: string;
}
