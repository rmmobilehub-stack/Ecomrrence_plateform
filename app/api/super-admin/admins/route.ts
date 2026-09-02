import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, insertOne } from '@/lib/db';
import type { Admin, Store } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [admins, stores] = await Promise.all([readDb<Admin>('admins'), readDb<Store>('stores')]);
  return NextResponse.json({ admins: admins.map(({ passwordHash: _password, ...admin }) => ({
    ...admin,
    store: stores.find((store) => store.id === admin.storeId) ?? null,
  })) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, password, plan = 'free', storeId } = await req.json();
  if (!name || !email || !password || !storeId) return NextResponse.json({ error: 'Name, login email, password and assigned store are required' }, { status: 400 });

  const [admins, stores] = await Promise.all([readDb<Admin>('admins'), readDb<Store>('stores')]);
  const normalizedEmail = String(email).trim().toLowerCase();
  if (admins.some((admin) => admin.email.toLowerCase() === normalizedEmail)) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  const store = stores.find((entry) => entry.id === storeId);
  if (!store) return NextResponse.json({ error: 'Choose a valid store' }, { status: 400 });

  const newAdmin: Admin = {
    id: uuidv4(), name: String(name).trim(), email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12), status: 'active', plan, storeId,
    createdAt: new Date().toISOString(),
  };
  try {
    await insertOne<Admin>('admins', newAdmin);
  } catch (error) {
    console.error('Create assigned admin failed:', error);
    return NextResponse.json({ error: 'Could not create and assign this administrator' }, { status: 500 });
  }
  const { passwordHash: _password, ...safeAdmin } = newAdmin;
  return NextResponse.json({ admin: { ...safeAdmin, store } }, { status: 201 });
}
