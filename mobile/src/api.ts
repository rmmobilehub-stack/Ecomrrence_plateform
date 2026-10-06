import { API_BASE_URL, STORE_SLUG } from './config';
import type {
  CartItem,
  Category,
  Coupon,
  CustomerInfo,
  DeviceConditionInput,
  DeviceEstimate,
  Product,
  RepairCatalog,
  Store,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(
      'Could not reach the web API. Start the website with npm run dev, then retry. Android emulator uses 10.0.2.2:3001.',
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
