import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const locks: Record<string, boolean> = {};
const cache = new Map<string, unknown[]>();
const pendingReads = new Map<string, Promise<unknown[]>>();

async function atomicWrite(filePath: string, data: unknown): Promise<void> {
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

async function acquireLock(file: string): Promise<void> {
  while (locks[file]) {
    await new Promise((r) => setTimeout(r, 10));
  }
  locks[file] = true;
}

function releaseLock(file: string): void {
  locks[file] = false;
}

export async function readDb<T>(filename: string): Promise<T[]> {
  if (cache.has(filename)) {
    return cache.get(filename) as T[];
  }

  const pending = pendingReads.get(filename);
  if (pending) {
    return pending as Promise<T[]>;
  }

  const filePath = path.join(DATA_DIR, filename);
  const read = fs.readFile(filePath, 'utf-8')
    .then((content) => JSON.parse(content) as T[])
    .catch(() => [] as T[])
    .then((items) => {
      cache.set(filename, items);
      return items;
    })
    .finally(() => pendingReads.delete(filename));
  pendingReads.set(filename, read as Promise<unknown[]>);
  return read;
}

export async function writeDb<T>(filename: string, data: T[]): Promise<void> {
  await acquireLock(filename);
  try {
    const filePath = path.join(DATA_DIR, filename);
    await atomicWrite(filePath, data);
    cache.set(filename, data);
  } finally {
    releaseLock(filename);
  }
}

export async function findById<T extends { id: string }>(
  filename: string,
  id: string
): Promise<T | null> {
  const items = await readDb<T>(filename);
  return items.find((item) => item.id === id) ?? null;
}

export async function insertOne<T>(filename: string, item: T): Promise<T> {
  await acquireLock(filename);
  try {
    const filePath = path.join(DATA_DIR, filename);
    const items = [...await readDb<T>(filename), item];
    await atomicWrite(filePath, items);
    cache.set(filename, items);
    return item;
  } finally {
    releaseLock(filename);
  }
}

export async function updateOne<T extends { id: string }>(
  filename: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  await acquireLock(filename);
  try {
    const filePath = path.join(DATA_DIR, filename);
    const items = [...await readDb<T>(filename)];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    await atomicWrite(filePath, items);
    cache.set(filename, items);
    return items[index];
  } finally {
    releaseLock(filename);
  }
}

export async function deleteOne<T extends { id: string }>(
  filename: string,
  id: string
): Promise<boolean> {
  await acquireLock(filename);
  try {
    const filePath = path.join(DATA_DIR, filename);
    const items = await readDb<T>(filename);
    const newItems = items.filter((item) => item.id !== id);
    if (newItems.length === items.length) return false;
    await atomicWrite(filePath, newItems);
    cache.set(filename, newItems);
    return true;
  } finally {
    releaseLock(filename);
  }
}
