import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, insertOne, writeDb } from '@/lib/db';
import type { Admin, Store } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await readDb<Admin>('admins');
  const stores = await readDb<Store>('stores');

  const result = admins.map(({ passwordHash: _pw, ...admin }) => {
    const store = stores.find((s) => s.id === admin.storeId);
    return { ...admin, store: store || null };
  });

  return NextResponse.json({ admins: result });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, plan = 'free' } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
  }

  const admins = await readDb<Admin>('admins');
  if (admins.find((a) => a.email === email)) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const storeId = uuidv4();
  const adminId = uuidv4();

  const newAdmin: Admin = {
    id: adminId,
    name,
    email,
    passwordHash,
    status: 'active',
    plan,
    storeId,
    createdAt: new Date().toISOString(),
  };

  // Create a default store for this admin
  const newStore: Store = {
    id: storeId,
    adminId,
    name: `${name}'s Store`,
    slug: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
    description: '',
    logo: '',
    banner: '',
    heroSlides: [],
    primaryColor: '#6c63ff',
    currency: 'USD',
    contactEmail: email,
    socialLinks: {},
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await insertOne<Admin>('admins', newAdmin);
  await insertOne<Store>('stores', newStore);

  const { passwordHash: _pw, ...safeAdmin } = newAdmin;
  return NextResponse.json({ admin: safeAdmin }, { status: 201 });
}
