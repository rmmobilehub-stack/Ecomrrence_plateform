import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import type { Store, Admin } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await readDb<Store>('stores');
  const admins = await readDb<Admin>('admins');

  const result = stores.map((store) => {
    const admin = admins.find((a) => a.id === store.adminId);
    return {
      ...store,
      admin: admin ? { id: admin.id, name: admin.name, email: admin.email, status: admin.status } : null,
    };
  });

  return NextResponse.json({ stores: result });
}
