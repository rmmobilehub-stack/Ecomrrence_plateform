import { API_BASE_URL, STORE_SLUG } from './config';
import { getAuthToken } from './session';
import type {
  CartItem,
  Category,
  Coupon,
  CustomerInfo,
  CustomerProfile,
  DeviceConditionInput,
  DeviceEstimate,
  HistoryOrder,
  HistoryRepair,
  Product,
  RepairCatalog,
  Store,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(
      'Could not reach the web API. Start the website with yarn dev, then retry. Android emulator uses 10.0.2.2:3001.',
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export function fetchStore() {
  return request<{ store: Store }>(`/api/store/${STORE_SLUG}`);
}

export function fetchProducts(query: { search?: string; categoryId?: string; sortBy?: string } = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  const suffix = params.toString() ? `?${params}` : '';
  return request<{ products: Product[]; categories: Category[] }>(
    `/api/store/${STORE_SLUG}/products${suffix}`,
  );
}

export function fetchProduct(id: string) {
  return request<{ product: Product }>(`/api/store/${STORE_SLUG}/products/${id}`);
}

export function fetchCoupon(code: string) {
  return request<{ discount: Coupon }>(`/api/store/${STORE_SLUG}/discounts/${encodeURIComponent(code)}`);
}

export function placeOrder(payload: { customer: CustomerInfo; items: CartItem[]; couponCode?: string }) {
  return request<{
    success: boolean;
    order: {
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
    };
    whatsappNumber: string;
    storeName: string;
    currency: string;
  }>(`/api/store/${STORE_SLUG}/orders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createWhatsAppOrder(payload: {
  productId: string;
  qty: number;
  selectedVariants: Record<string, string>;
}) {
  return request<{ order: { orderNumber: string; total: number } }>(
    `/api/store/${STORE_SLUG}/whatsapp-order`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export function fetchRepairCatalog() {
  return request<RepairCatalog>(`/api/store/${STORE_SLUG}/repair/catalog`);
}

export function fetchDeviceEstimate(payload: {
  modelId: string;
  colorId?: string;
  issueId?: string;
  issueDetail?: string;
  condition: DeviceConditionInput;
}) {
  return request<{ estimate: DeviceEstimate }>(`/api/store/${STORE_SLUG}/repair/estimate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createRepairBooking(payload: Record<string, unknown>) {
  return request<{ booking: { bookingNumber: string; id: string } }>(`/api/store/${STORE_SLUG}/repair-bookings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createLead(payload: { name: string; contact: string; interest: string }) {
  return request<{ success?: boolean }>(`/api/store/${STORE_SLUG}/leads`, {
    method: 'POST',
    body: JSON.stringify({ ...payload, source: 'chatbot' }),
  });
}

type AuthCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storeId?: string;
};

export function loginCustomer(email: string, password: string) {
  return request<{ success: boolean; token: string; customer: AuthCustomer }>('/api/customer/login', {
    method: 'POST',
    body: JSON.stringify({ storeSlug: STORE_SLUG, email, password }),
  });
}

export function registerCustomer(payload: {
  name: string;
  phone?: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return request<{ success: boolean; token: string; customer: AuthCustomer }>('/api/customer/register', {
    method: 'POST',
    body: JSON.stringify({ storeSlug: STORE_SLUG, ...payload }),
  });
}

export function fetchCustomerMe() {
  return request<{ customer: CustomerProfile | null }>('/api/customer/me');
}

export function fetchCustomerHistory() {
  return request<{
    customer: CustomerProfile;
    orders: HistoryOrder[];
    repairs: HistoryRepair[];
  }>(`/api/customer/history?storeSlug=${encodeURIComponent(STORE_SLUG)}`);
}

export function logoutCustomer() {
  return request<{ ok?: boolean }>('/api/customer/logout', { method: 'POST' });
}
