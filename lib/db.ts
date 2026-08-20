import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const locks: Record<string, boolean> = {};

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
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  } catch {
    return [];
  }
}

export async function writeDb<T>(filename: string, data: T[]): Promise<void> {
  await acquireLock(filename);
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
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
    let items: T[] = [];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      items = JSON.parse(content);
    } catch {}
    items.push(item);
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
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
    const content = await fs.readFile(filePath, 'utf-8');
    const items: T[] = JSON.parse(content);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
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
    const content = await fs.readFile(filePath, 'utf-8');
    const items: T[] = JSON.parse(content);
    const newItems = items.filter((item) => item.id !== id);
    if (newItems.length === items.length) return false;
    await fs.writeFile(filePath, JSON.stringify(newItems, null, 2), 'utf-8');
    return true;
  } finally {
    releaseLock(filename);
  }
}
