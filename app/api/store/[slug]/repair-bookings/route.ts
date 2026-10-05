import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { findRepairIssue, findRepairSimOption, getDevicePreview } from '@/lib/iphone-repair-catalog';
import { parseConditionPayload, type DeviceEstimate } from '@/lib/device-estimate';
import { insertOne, readDb } from '@/lib/db';
import { buildStatusNotifyMessage } from '@/lib/customer-notify';
import { sendCustomerEmail } from '@/lib/email';
import type { RepairBooking, Store } from '@/lib/types';

function parseEstimatePayload(value: unknown): DeviceEstimate | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  const score = Number(raw.score);
  const min = Number(raw.marketValueMinPkr);
  const max = Number(raw.marketValueMaxPkr);
  if (!Number.isFinite(score) || !Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  const suggestions = Array.isArray(raw.suggestions)
    ? raw.suggestions.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 5)
    : [];
  const buySuggestions = Array.isArray(raw.buySuggestions)
    ? raw.buySuggestions.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 5)
    : [];
  return {
    score: Math.round(Math.min(100, Math.max(1, score))),
    scoreLabel: String(raw.scoreLabel || '').slice(0, 80) || 'Estimated',
    marketValueMinPkr: Math.max(0, Math.round(min)),
    marketValueMaxPkr: Math.max(0, Math.round(max)),
    currency: 'PKR',
    summary: String(raw.summary || '').slice(0, 320),
    suggestions,
    buySuggestions,
    source: 'rules',
  };
}

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
    const deviceCondition = parseConditionPayload(body.deviceCondition);
    const deviceEstimate = parseEstimatePayload(body.deviceEstimate);

    if (name.length < 2 || phone.length < 7 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !address || !city) {
      return NextResponse.json({ error: 'Name, phone, a valid email, address and city are required' }, { status: 400 });
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
      ...(deviceCondition ? { deviceCondition } : {}),
      ...(deviceEstimate ? { deviceEstimate } : {}),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    const confirmationMessage = buildStatusNotifyMessage({
      storeName: store.name,
      referenceLabel: 'Repair booking',
      referenceNumber: bookingNumber,
      customerName: name,
      status: 'received',
      extraLines: [
        `Device: ${preview.modelName} · ${preview.colorName}`,
        `Issue: ${issue.name}`,
        'We will contact you to confirm the doorstep visit.',
      ],
    });
    const emailResult = await sendCustomerEmail({
      to: email,
      subject: `${store.name}: we received repair booking ${bookingNumber}`,
      text: confirmationMessage,
      brandName: store.name,
    });

    return NextResponse.json({ success: true, booking, emailSent: emailResult.sent, emailReason: emailResult.reason }, { status: 201 });
  } catch (error) {
    console.error('Repair booking error:', error);
    return NextResponse.json({ error: 'Could not save repair booking' }, { status: 500 });
  }
}
