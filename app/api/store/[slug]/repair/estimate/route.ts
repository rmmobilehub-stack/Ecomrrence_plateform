import { NextRequest, NextResponse } from 'next/server';
import { estimateDeviceWorth, parseConditionPayload } from '@/lib/device-estimate';
import { findRepairIssue, getDevicePreview, getRepairCatalog } from '@/lib/iphone-repair-catalog';
import { readDb } from '@/lib/db';
import { getCustomerSessionFromRequest } from '@/lib/customer-auth';
import type { Store } from '@/lib/types';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const stores = await readDb<Store>('stores');
    const store = stores.find((entry) => entry.slug === params.slug && entry.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const customerSession = await getCustomerSessionFromRequest(request);
    if (!customerSession || customerSession.storeId !== store.id) {
      return NextResponse.json({ error: 'Login required for phone check' }, { status: 401 });
    }

    const body = await request.json();
    const modelId = String(body.modelId ?? '').trim();
    const colorId = String(body.colorId ?? '').trim();
    const issueId = String(body.issueId ?? '').trim();
    const issueDetail = String(body.issueDetail ?? '').trim().slice(0, 300);
    const condition = parseConditionPayload(body.condition);
    if (!condition) {
      return NextResponse.json({ error: 'Complete screen, battery, condition and ownership details' }, { status: 400 });
    }

    const catalog = getRepairCatalog();
    const model = catalog.models.find((entry) => entry.id === modelId);
    const preview = colorId ? getDevicePreview(modelId, colorId) : null;
    const modelName = preview?.modelName || model?.name;
    const colorName = preview?.colorName || model?.colors[0]?.name || '';
    if (!modelName) {
      return NextResponse.json({ error: 'Select a valid model first' }, { status: 400 });
    }

    const issue = issueId ? findRepairIssue(issueId) : null;

    const estimate = await estimateDeviceWorth({
      modelName,
      colorName,
      issueName: issue?.name,
      issueDetail,
      condition,
    });

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error('Repair estimate error:', error);
    return NextResponse.json({ error: 'Could not estimate device value' }, { status: 500 });
  }
}
