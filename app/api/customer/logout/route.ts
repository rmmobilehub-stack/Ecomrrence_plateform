import { NextResponse } from 'next/server';
import { clearCustomerAuthCookie } from '@/lib/customer-auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearCustomerAuthCookie());
  return response;
}
