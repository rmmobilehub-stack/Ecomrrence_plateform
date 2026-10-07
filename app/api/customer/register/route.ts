import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
} from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { registerCustomer } from '@/lib/customers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const storeSlug = String(body.storeSlug || '').trim();
    const store = await getActiveStoreBySlug(storeSlug);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and confirm password do not match' }, { status: 400 });
    }

    const customer = await registerCustomer({
      storeId: store.id,
      email: String(body.email || ''),
      password,
      name: String(body.name || ''),
      phone: String(body.phone || ''),
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
      token,
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
    const message = error instanceof Error ? error.message : 'Could not register';
    const status = /already exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
