import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EMPTY_MANIFEST = {
  android: { version: 0, url: '', notes: '' },
  ios: { version: 0, url: '', notes: '' },
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'mobile-ota', 'manifest.json');
    const raw = await readFile(filePath, 'utf8');
    const manifest = JSON.parse(raw);
    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return NextResponse.json(EMPTY_MANIFEST, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }
}
