import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSessionFromRequest } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    if (files.length > 8) {
      return NextResponse.json({ error: 'Upload up to 8 images at a time' }, { status: 400 });
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    for (const file of files) {
      if (!allowedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images up to 5 MB are allowed' }, { status: 400 });
      }
    }

    const urls: string[] = [];
    const storage = getSupabaseAdmin().storage.from('product-images');

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[file.type];
      const owner = session.storeId || 'platform';
      const objectPath = `${owner}/${Date.now()}-${randomUUID()}.${ext}`;
      const { error } = await storage.upload(objectPath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw error;

      const { data } = storage.getPublicUrl(objectPath);
      urls.push(data.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
