import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths - no auth needed
  const publicPaths = [
    '/login',
    '/super-admin/login',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/store',
    '/_next',
    '/favicon.ico',
    '/uploads',
  ];

  const isPublic =
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/store/');

  if (isPublic) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  // Super admin routes
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/api/super-admin')) {
    if (!session || session.role !== 'super-admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!session || session.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/api/super-admin/:path*',
    '/api/admin/:path*',
  ],
};
