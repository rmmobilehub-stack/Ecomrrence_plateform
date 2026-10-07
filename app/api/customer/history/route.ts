import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { getCustomerOrders, getCustomerRepairs } from '@/lib/customers';

export async function GET(req: NextRequest) {
  const session = await getCustomerSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const storeSlug = String(req.nextUrl.searchParams.get('storeSlug') || '').trim();
  if (!storeSlug) return NextResponse.json({ error: 'storeSlug required' }, { status: 400 });

  const store = await getActiveStoreBySlug(storeSlug);
  if (!store || store.id !== session.storeId) {
    return NextResponse.json({ error: 'Wrong store account' }, { status: 403 });
  }

  const [orders, repairs] = await Promise.all([
    getCustomerOrders(session.id),
    getCustomerRepairs(session.id),
  ]);

  return NextResponse.json({
    customer: {
      id: session.id,
      name: session.name,
      email: session.email,
      avatarUrl: session.avatarUrl || '',
    },
    orders,
    repairs,
  });
}
