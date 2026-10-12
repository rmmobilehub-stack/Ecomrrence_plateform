import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { CustomerAuthPayload } from './types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ecommerce-saas-super-secret-key-2024'
);

export const CUSTOMER_COOKIE = 'customer_auth_token';

export async function signCustomerToken(payload: CustomerAuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET);
}

export async function verifyCustomerToken(token: string): Promise<CustomerAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const data = payload as unknown as CustomerAuthPayload & { purpose?: string };
    if (data.purpose === 'magic_login') return null;
    if (data.role !== 'customer' || !data.id || !data.storeId) return null;
    return data;
  } catch {
    return null;
  }
}

/** Short-lived one-click login link used in registration emails. */
export async function signMagicLoginToken(payload: {
  id: string;
  email: string;
  name: string;
  storeId: string;
  storeSlug: string;
  avatarUrl?: string;
}): Promise<string> {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: 'customer',
    storeId: payload.storeId,
    storeSlug: payload.storeSlug,
    avatarUrl: payload.avatarUrl || '',
    purpose: 'magic_login',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyMagicLoginToken(
  token: string,
): Promise<(CustomerAuthPayload & { storeSlug: string }) | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const data = payload as unknown as CustomerAuthPayload & { purpose?: string; storeSlug?: string };
    if (data.purpose !== 'magic_login' || data.role !== 'customer' || !data.id || !data.storeId) {
      return null;
    }
    const storeSlug = String(data.storeSlug || '').trim();
    if (!storeSlug) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: 'customer',
      storeId: data.storeId,
      avatarUrl: data.avatarUrl,
      storeSlug,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerAuthPayload | null> {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function getCustomerTokenFromRequest(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const bearer = header.match(/^Bearer\s+(\S+)/i)?.[1];
  if (bearer) return bearer;
  return req.cookies.get(CUSTOMER_COOKIE)?.value ?? null;
}

export async function getCustomerSessionFromRequest(
  req: NextRequest
): Promise<CustomerAuthPayload | null> {
  const token = getCustomerTokenFromRequest(req);
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function createCustomerAuthCookie(token: string, secure: boolean) {
  return {
    name: CUSTOMER_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };
}

export function clearCustomerAuthCookie() {
  return {
    name: CUSTOMER_COOKIE,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  };
}

export function isSecureRequest(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  return req.nextUrl.protocol === 'https:' || forwarded === 'https' || process.env.NODE_ENV === 'production';
}

export function setCustomerSessionOnResponse(
  response: NextResponse,
  token: string,
  secure: boolean
) {
  response.cookies.set(createCustomerAuthCookie(token, secure));
  return response;
}

export function clearCustomerSessionOnResponse(response: NextResponse) {
  response.cookies.set(clearCustomerAuthCookie());
  return response;
}
