import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
  signMagicLoginToken,
} from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { registerCustomer } from '@/lib/customers';
import { sendCustomerEmail } from '@/lib/email';

function siteOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();
  if (configured) return configured;
  const forwarded = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) return `${forwarded || req.nextUrl.protocol.replace(':', '')}://${host}`;
  return req.nextUrl.origin;
}

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

    const magicToken = await signMagicLoginToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      storeId: customer.storeId,
      storeSlug: store.slug,
      avatarUrl: customer.avatarUrl,
    });
    const loginLink = `${siteOrigin(req)}/api/customer/magic-login?token=${encodeURIComponent(magicToken)}`;

    void sendCustomerEmail({
      to: customer.email,
      brandName: store.name,
      subject: `Welcome to ${store.name}`,
      actionUrl: loginLink,
      actionLabel: 'Log in to your account',
      text: [
        `Hi ${customer.name || 'there'},`,
        '',
        `Your account on ${store.name} is ready.`,
        'Click the button below to log in instantly — no password needed for this link.',
        '',
        'This link works for 7 days. After that, use your email and password on the login page.',
        '',
        'If you did not create this account, please contact the store.',
        '',
        `Thanks,`,
        store.name,
      ].join('\n'),
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
