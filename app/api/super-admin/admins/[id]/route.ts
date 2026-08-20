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

  const { name, email, password, status, plan } = await req.json();
  const updates: Partial<Admin> = {};

  if (name) updates.name = name;
  if (email) updates.email = email;
  if (status) updates.status = status;
  if (plan) updates.plan = plan;
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);

  const updated = await updateOne<Admin>('admins.json', params.id, updates);
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

  const deleted = await deleteOne<Admin>('admins.json', params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
