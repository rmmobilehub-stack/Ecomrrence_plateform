import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
} from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { loginCustomer } from '@/lib/customers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const storeSlug = String(body.storeSlug || '').trim();
    const store = await getActiveStoreBySlug(storeSlug);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const customer = await loginCustomer({
      storeId: store.id,
      email: String(body.email || ''),
      password: String(body.password || ''),
    });

    const token = await signCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
      storeId: customer.storeId,
      avatarUrl: customer.avatarUrl,
    });

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
    response.cookies.set(createCustomerAuthCookie(token, isSecureRequest(req)));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not login';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
