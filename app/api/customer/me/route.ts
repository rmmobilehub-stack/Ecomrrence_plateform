import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';
import { getCustomerById } from '@/lib/customers';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ customer: null });

  const customer = await getCustomerById(session.id);
  if (!customer || customer.storeId !== session.storeId) {
    return NextResponse.json({ customer: null });
  }

  return NextResponse.json({
    customer: {
      id: customer.id,
      storeId: customer.storeId,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl || '',
    },
  });
}
