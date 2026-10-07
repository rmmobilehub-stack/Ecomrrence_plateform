export interface StoreAd {
  id: string;
  type: 'image' | 'video';
  title: string;
  mediaUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

export interface Store {
  id: string;
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
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
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

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes?: string;
}

export interface CustomerProfile {
  id: string;
  storeId?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface HistoryStatusUpdate {
  status: string;
  note?: string;
  at: string;
}

export interface HistoryOrder {
  id: string;
  orderNumber: string;
  items: { qty: number; productName: string }[];
  total: number;
  status: string;
  createdAt: string;
  statusUpdates?: HistoryStatusUpdate[];
}

export interface HistoryRepair {
  id: string;
  bookingNumber: string;
  device: { modelName: string };
  issue: { issueName: string };
  status: string;
  createdAt: string;
  deviceEstimate?: { score: number };
  statusUpdates?: HistoryStatusUpdate[];
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  productDiscount?: number;
  discount?: number;
  couponCode?: string;
  deliveryFee?: number;
  total: number;
  status: string;
  whatsappNumber?: string;
  storeName?: string;
  currency?: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
}

export interface RepairColor {
  id: string;
  name: string;
  hex: string;
}

export interface RepairModel {
  id: string;
  name: string;
  series: string;
  imageUrl: string;
  colors: RepairColor[];
}

export interface RepairIssue {
  id: string;
  name: string;
  description: string;
}

export interface RepairSimOption {
  id: string;
  name: string;
  description: string;
}

export interface RepairCatalog {
  models: RepairModel[];
  issues: RepairIssue[];
  simOptions: RepairSimOption[];
}

export type ScreenCondition = 'all_neat' | 'some_scratches' | 'many_scratches';
export type OwnershipStatus = 'first_owner' | 'box_pack' | 'used' | 'non_active';
export type BodyFlag = 'scratches' | 'side_rough' | 'body_changed' | 'back_glass_changed';
export type ChangedPart = 'glass' | 'battery' | 'front_camera' | 'back_camera';

export interface DeviceConditionInput {
  screenCondition: ScreenCondition;
  bodyFlags: BodyFlag[];
  partsChanged: ChangedPart[];
  overallOutOf10: number;
  batteryHealthPercent: number;
  ageYears: number;
  ownership: OwnershipStatus;
  additionalNote: string;
}

export interface DeviceEstimate {
  score: number;
  scoreLabel: string;
  marketValueMinPkr: number;
  marketValueMaxPkr: number;
  currency: 'PKR';
  summary: string;
  suggestions: string[];
  buySuggestions?: string[];
}

export const DEFAULT_DEVICE_CONDITION: DeviceConditionInput = {
  screenCondition: 'all_neat',
  bodyFlags: [],
  partsChanged: [],
  overallOutOf10: 8,
  batteryHealthPercent: 85,
  ageYears: 1,
  ownership: 'used',
  additionalNote: '',
};

export const SCREEN_CONDITION_OPTIONS: { id: ScreenCondition; label: string }[] = [
  { id: 'all_neat', label: 'All neat / clean' },
  { id: 'some_scratches', label: 'Some scratches' },
  { id: 'many_scratches', label: 'Many scratches' },
];

export const BODY_FLAG_OPTIONS: { id: BodyFlag; label: string }[] = [
  { id: 'scratches', label: 'Body scratches' },
  { id: 'side_rough', label: 'Side rough' },
  { id: 'body_changed', label: 'Body changed' },
  { id: 'back_glass_changed', label: 'Back glass changed' },
];

export const PARTS_CHANGED_OPTIONS: { id: ChangedPart; label: string }[] = [
  { id: 'glass', label: 'Glass change' },
  { id: 'battery', label: 'Battery change' },
  { id: 'front_camera', label: 'Front camera change' },
  { id: 'back_camera', label: 'Back camera change' },
];

export const OWNERSHIP_OPTIONS: { id: OwnershipStatus; label: string }[] = [
  { id: 'first_owner', label: 'First owner' },
  { id: 'box_pack', label: 'Box pack' },
  { id: 'used', label: 'Used' },
  { id: 'non_active', label: 'Non-active' },
];
