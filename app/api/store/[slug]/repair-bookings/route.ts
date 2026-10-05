import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { findRepairIssue, findRepairSimOption, getDevicePreview } from '@/lib/iphone-repair-catalog';
import { insertOne, readDb } from '@/lib/db';
import type { RepairBooking, Store } from '@/lib/types';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const stores = await readDb<Store>('stores');
    const store = stores.find((entry) => entry.slug === params.slug && entry.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await request.json();
    const name = String(body.name ?? '').trim().slice(0, 100);
    const phone = String(body.phone ?? '').trim().slice(0, 40);
    const email = String(body.email ?? '').trim().slice(0, 120);
    const address = String(body.address ?? '').trim().slice(0, 240);
    const city = String(body.city ?? '').trim().slice(0, 80);
    const notes = String(body.notes ?? '').trim().slice(0, 500);
    const preferredDate = String(body.preferredDate ?? '').trim().slice(0, 40);
    const preferredTime = String(body.preferredTime ?? '').trim().slice(0, 40);
    const modelId = String(body.modelId ?? '').trim();
    const colorId = String(body.colorId ?? '').trim();
    const issueId = String(body.issueId ?? '').trim();
    const simTypeId = String(body.simTypeId ?? '').trim();
    const issueDetail = String(body.issueDetail ?? '').trim().slice(0, 300);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

    if (name.length < 2 || phone.length < 7 || !address || !city) {
      return NextResponse.json({ error: 'Name, phone, address and city are required' }, { status: 400 });
    }

    const preview = getDevicePreview(modelId, colorId);
    const issue = findRepairIssue(issueId);
    const simType = findRepairSimOption(simTypeId);
    if (!preview || !issue || !simType) {
      return NextResponse.json({ error: 'Select a valid iPhone model, colour, SIM configuration and issue' }, { status: 400 });
    }

    const existing = await readDb<RepairBooking>('repair-bookings');
    const storeCount = existing.filter((entry) => entry.storeId === store.id).length;
    const bookingNumber = `REP-${String(storeCount + 1).padStart(4, '0')}`;

    const booking = await insertOne<RepairBooking>('repair-bookings', {
      id: randomUUID(),
      storeId: store.id,
      bookingNumber,
      customer: {
        name,
        phone,
        email,
        address,
        city,
        notes,
        ...(hasCoords ? { lat, lng } : {}),
      },
      device: {
        modelId: preview.modelId,
        modelName: preview.modelName,
        colorId: preview.colorId,
        colorName: preview.colorName,
        colorHex: preview.colorHex,
        imageUrl: preview.imageUrl,
        simTypeId: simType.id,
        simTypeName: simType.name,
        simTypeDescription: simType.description,
      },
      issue: {
        issueId: issue.id,
        issueName: issue.name,
        description: issue.description,
        ...(issueDetail ? { detail: issueDetail } : {}),
      },
      preferredDate: preferredDate || undefined,
      preferredTime: preferredTime || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Repair booking error:', error);
    return NextResponse.json({ error: 'Could not save repair booking' }, { status: 500 });
  }
}
