import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { findById, insertOne, readDb, toApplicationRow, updateOne } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { CustomerAccount, Order, RepairBooking } from '@/lib/types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findCustomerByEmail(storeId: string, email: string) {
  const customers = await readDb<CustomerAccount>('customers');
  const target = normalizeEmail(email);
  return customers.find((entry) => entry.storeId === storeId && normalizeEmail(entry.email) === target) ?? null;
}

export async function registerCustomer(input: {
  storeId: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<CustomerAccount> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim().slice(0, 100);
  const phone = String(input.phone || '').trim().slice(0, 40);
  const password = String(input.password || '');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address');
  }
  if (name.length < 2) throw new Error('Enter your full name');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const existing = await findCustomerByEmail(input.storeId, email);
  if (existing) throw new Error('An account with this email already exists. Please login.');

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await insertOne<CustomerAccount>('customers', {
    id: uuidv4(),
    storeId: input.storeId,
    email,
    name,
    phone,
    avatarUrl: '',
    passwordHash,
    createdAt: now,
    lastLoginAt: now,
  });
  await claimGuestHistory(created);
  return created;
}

export async function loginCustomer(input: {
  storeId: string;
  email: string;
  password: string;
}): Promise<CustomerAccount> {
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  if (!email || !password) throw new Error('Email and password required');

  const existing = await findCustomerByEmail(input.storeId, email);
  if (!existing?.passwordHash) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, existing.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  const updated = await updateOne<CustomerAccount>('customers', existing.id, {
    lastLoginAt: new Date().toISOString(),
  });
  const customer = updated || existing;
  await claimGuestHistory(customer);
  return customer;
}

/** Attach older guest orders/repairs that used the same email. */
async function claimGuestHistory(customer: CustomerAccount) {
  const email = normalizeEmail(customer.email);
  const client = getSupabaseAdmin();

  const { data: orders } = await client
    .from('orders')
    .select('id, customer, customer_id')
    .eq('store_id', customer.storeId)
    .is('customer_id', null);

  for (const row of orders ?? []) {
    const guestEmail = String((row.customer as { email?: string } | null)?.email || '').toLowerCase();
    if (guestEmail === email) {
      await client.from('orders').update({ customer_id: customer.id }).eq('id', row.id);
    }
  }

  const { data: repairs } = await client
    .from('repair_bookings')
    .select('id, customer, customer_id')
    .eq('store_id', customer.storeId)
    .is('customer_id', null);

  for (const row of repairs ?? []) {
    const guestEmail = String((row.customer as { email?: string } | null)?.email || '').toLowerCase();
    if (guestEmail === email) {
      await client.from('repair_bookings').update({ customer_id: customer.id }).eq('id', row.id);
    }
  }
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toApplicationRow<Order>(row as Record<string, unknown>));
}

export async function getCustomerRepairs(customerId: string): Promise<RepairBooking[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('repair_bookings')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toApplicationRow<RepairBooking>(row as Record<string, unknown>));
}

export async function getCustomerById(id: string) {
  return findById<CustomerAccount>('customers', id);
}
