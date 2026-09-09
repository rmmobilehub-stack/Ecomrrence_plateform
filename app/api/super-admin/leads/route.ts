import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Lead, Store } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [leads, stores] = await Promise.all([readDb<Lead>('leads'), readDb<Store>('stores')]);
  const sorted = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    leads: sorted.map((lead) => {
      const store = stores.find((entry) => entry.id === lead.storeId);
      return {
        ...lead,
        store: store ? { id: store.id, name: store.name, slug: store.slug } : null,
      };
    }),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const statuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'closed'];
  if (!body.id || !statuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });
  }

  const lead = await updateOne<Lead>('leads', body.id, { status: body.status });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  return NextResponse.json({ lead });
}
