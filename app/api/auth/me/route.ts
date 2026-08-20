import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import type { SuperAdmin, Admin } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let user;
  if (session.role === 'super-admin') {
    const superAdmins = await readDb<SuperAdmin>('super-admins.json');
    user = superAdmins.find((u) => u.id === session.id);
  } else {
    const admins = await readDb<Admin>('admins.json');
    user = admins.find((u) => u.id === session.id);
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { passwordHash: _pw, ...safeUser } = user as (SuperAdmin | Admin) & { passwordHash: string };
  return NextResponse.json({ user: { ...safeUser, role: session.role } });
}
