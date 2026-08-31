import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Lead } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const leads = (await readDb<Lead>('leads'))
    .filter((lead) => lead.storeId === session.storeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ leads });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const statuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'closed'];
  if (!body.id || !statuses.includes(body.status)) return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 });
  const leads = await readDb<Lead>('leads');
  const lead = leads.find((entry) => entry.id === body.id && entry.storeId === session.storeId);
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  const updated = await updateOne<Lead>('leads', lead.id, { status: body.status });
  return NextResponse.json({ lead: updated });
}

