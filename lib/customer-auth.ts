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
    const data = payload as unknown as CustomerAuthPayload;
    if (data.role !== 'customer' || !data.id || !data.storeId) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerAuthPayload | null> {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export async function getCustomerSessionFromRequest(
  req: NextRequest
): Promise<CustomerAuthPayload | null> {
  const token = req.cookies.get(CUSTOMER_COOKIE)?.value;
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
