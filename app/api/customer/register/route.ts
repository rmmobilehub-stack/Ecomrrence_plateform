import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
} from '@/lib/customer-auth';
import { getActiveStoreBySlug } from '@/lib/db';
import { registerCustomer } from '@/lib/customers';
import { sendCustomerEmail } from '@/lib/email';
import { emailValidationMessage, phoneValidationMessage } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const storeSlug = String(body.storeSlug || '').trim();
    const store = await getActiveStoreBySlug(storeSlug);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const password = String(body.password || '');
    const confirmPassword = String(body.confirmPassword || '');
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and confirm password do not match' }, { status: 400 });
    }

    const emailError = emailValidationMessage(String(body.email || ''));
    if (emailError) return NextResponse.json({ error: emailError }, { status: 400 });

    const phoneError = phoneValidationMessage(String(body.phone || ''), false);
    if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });

    const customer = await registerCustomer({
      storeId: store.id,
      email: String(body.email || ''),
      password,
      name: String(body.name || ''),
      phone: String(body.phone || ''),
    });

    const brandName = store.name || 'RM Mobile Hub';
    void sendCustomerEmail({
      to: customer.email,
      brandName,
      subject: `Welcome to ${brandName}`,
      text: [
        `Hi ${customer.name || 'there'},`,
        '',
        `You are registered in ${brandName}.`,
        'You can sign in anytime with your email and password.',
        '',
        `Thanks,`,
        brandName,
      ].join('\n'),
    });

    const token = await signCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
      storeId: customer.storeId,
      avatarUrl: customer.avatarUrl,
    });

    const response = NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
    response.cookies.set(createCustomerAuthCookie(token, isSecureRequest(req)));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not register';
    const status = /already exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
