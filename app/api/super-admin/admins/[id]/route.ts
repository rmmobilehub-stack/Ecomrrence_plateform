import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne, deleteOne } from '@/lib/db';
import type { Admin } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, status, plan, storeId } = await req.json();
  const updates: Partial<Admin> = {};

  if (name) updates.name = name;
  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const admins = await readDb<Admin>('admins');
    if (admins.some((admin) => admin.id !== params.id && admin.email.toLowerCase() === normalizedEmail)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    updates.email = normalizedEmail;
  }
  if (status) updates.status = status;
  if (plan) updates.plan = plan;
  if (storeId) {
    const stores = await readDb<{ id: string }>('stores');
    if (!stores.some((store) => store.id === storeId)) return NextResponse.json({ error: 'Choose a valid store' }, { status: 400 });
    updates.storeId = storeId;
  }
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);

  const updated = await updateOne<Admin>('admins', params.id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  const { passwordHash: _pw, ...safeAdmin } = updated;
  return NextResponse.json({ admin: safeAdmin });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await deleteOne<Admin>('admins', params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
