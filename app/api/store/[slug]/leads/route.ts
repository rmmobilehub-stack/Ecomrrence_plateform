import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { insertOne, readDb } from '@/lib/db';
import type { Lead, Store } from '@/lib/types';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    if (body.website) return NextResponse.json({ success: true });

    const name = String(body.name ?? '').trim().slice(0, 100);
    const contact = String(body.contact ?? '').trim().slice(0, 160);
    const interest = String(body.interest ?? '').trim().slice(0, 500);
    if (name.length < 2 || contact.length < 5) {
      return NextResponse.json({ error: 'Name and valid contact are required' }, { status: 400 });
    }

    const stores = await readDb<Store>('stores');
    const store = stores.find((entry) => entry.slug === params.slug && entry.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const conversation = Array.isArray(body.conversation)
      ? body.conversation.slice(-20).map((entry: { role?: string; message?: string }) => ({
        role: entry.role === 'visitor' ? 'visitor' as const : 'assistant' as const,
        message: String(entry.message ?? '').trim().slice(0, 500),
      })).filter((entry: { message: string }) => entry.message)
      : [];

    const lead = await insertOne<Lead>('leads', {
      id: randomUUID(),
      storeId: store.id,
      name,
      contact,
      interest,
      source: 'chatbot',
      status: 'new',
      conversation,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: 'Could not save your request' }, { status: 500 });
  }
}

