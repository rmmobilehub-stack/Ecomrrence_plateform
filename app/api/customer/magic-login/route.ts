import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
  verifyMagicLoginToken,
} from '@/lib/customer-auth';
import { findById } from '@/lib/db';
import { storefrontPath } from '@/lib/storefront-paths';
import type { CustomerAccount, Store } from '@/lib/types';

function siteOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();
  if (configured) return configured;
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const token = String(req.nextUrl.searchParams.get('token') || '').trim();
  const origin = siteOrigin(req);

  if (!token) {
    return NextResponse.redirect(`${origin}/account/login?error=missing_link`);
  }

  const magic = await verifyMagicLoginToken(token);
  if (!magic) {
    return NextResponse.redirect(`${origin}/account/login?error=expired_link`);
  }

  const customer = await findById<CustomerAccount>('customers', magic.id);
  if (!customer || customer.storeId !== magic.storeId) {
    return NextResponse.redirect(`${origin}/account/login?error=invalid_link`);
  }

  const store = await findById<Store>('stores', customer.storeId);
  const storeSlug = store?.slug || magic.storeSlug;
  const sessionToken = await signCustomerToken({
    id: customer.id,
    email: customer.email,
    name: customer.name,
    role: 'customer',
    storeId: customer.storeId,
    avatarUrl: customer.avatarUrl,
  });

  const redirectPath = storefrontPath(storeSlug, 'account');
  const response = NextResponse.redirect(`${origin}${redirectPath}`);
  response.cookies.set(createCustomerAuthCookie(sessionToken, isSecureRequest(req)));
  return response;
}
