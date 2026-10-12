import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { listCustomersByStore } from '@/lib/customers';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin' || !session.storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await listCustomersByStore(session.storeId);
  return NextResponse.json({ users });
}
