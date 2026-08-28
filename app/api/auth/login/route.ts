import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readDb } from '@/lib/db';
import { signToken, createAuthCookie } from '@/lib/auth';
import type { SuperAdmin, Admin } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    let user: (SuperAdmin | Admin) | undefined;
    let userRole: 'super-admin' | 'admin';

    if (role === 'super-admin') {
      const superAdmins = await readDb<SuperAdmin>('super-admins');
      user = superAdmins.find((u) => u.email === email);
      userRole = 'super-admin';
    } else {
      const admins = await readDb<Admin>('admins');
      user = admins.find((u) => u.email === email);
      userRole = 'admin';
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if ('status' in user && user.status === 'suspended') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: userRole,
      storeId: 'storeId' in user ? user.storeId : undefined,
    };

    const token = await signToken(payload);
    const forwardedProtocol = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const cookie = createAuthCookie(token, req.nextUrl.protocol === 'https:' || forwardedProtocol === 'https');

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: userRole },
    });

    response.cookies.set(cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
