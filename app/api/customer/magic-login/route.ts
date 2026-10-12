import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerAuthCookie,
  isSecureRequest,
  signCustomerToken,
  verifyMagicLoginToken,
} from '@/lib/customer-auth';
import { findById } from '@/lib/db';
import { storefrontPath } from '@/lib/storefront-paths';
import type { CustomerAccount, Store } from '@/lib/types';

function siteOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();
  if (configured) return configured;
  return req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const token = String(req.nextUrl.searchParams.get('token') || '').trim();
  const preferApp = String(req.nextUrl.searchParams.get('client') || '').trim().toLowerCase() === 'app';
  const origin = siteOrigin(req);

  if (!token) {
    return NextResponse.redirect(`${origin}/account/login?error=missing_link`);
  }

  const magic = await verifyMagicLoginToken(token);
  if (!magic) {
    return NextResponse.redirect(`${origin}/account/login?error=expired_link`);
  }

  const customer = await findById<CustomerAccount>('customers', magic.id);
  if (!customer || customer.storeId !== magic.storeId) {
    return NextResponse.redirect(`${origin}/account/login?error=invalid_link`);
  }

  const store = await findById<Store>('stores', customer.storeId);
  const storeSlug = store?.slug || magic.storeSlug;
  const sessionToken = await signCustomerToken({
    id: customer.id,
    email: customer.email,
    name: customer.name,
    role: 'customer',
    storeId: customer.storeId,
    avatarUrl: customer.avatarUrl,
  });

  const redirectPath = storefrontPath(storeSlug, 'account');
  const webUrl = `${origin}${redirectPath}`;
  const appUrl = `shopsaas://magic-login?token=${encodeURIComponent(sessionToken)}`;

  if (preferApp) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Opening app…</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #EDF8FD; color: #12384E; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; text-align: center; }
    a { color: #0284C7; font-weight: 700; }
    .card { background: #fff; border: 1px solid #D9EAF5; border-radius: 20px; padding: 28px 22px; max-width: 420px; width: 100%; box-shadow: 0 10px 30px rgba(18, 56, 78, 0.06); }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    p { margin: 0 0 14px; line-height: 1.5; color: #587185; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Opening RM Mobile Hub…</h1>
    <p>Use the login link in the app. If nothing happens, tap Open app.</p>
    <p><a id="open" href="${appUrl}">Open app</a> · <a href="${webUrl}">Continue on web</a></p>
  </div>
  <script>
    var app = ${JSON.stringify(appUrl)};
    var web = ${JSON.stringify(webUrl)};
    window.location.href = app;
    setTimeout(function () { window.location.href = web; }, 1600);
  </script>
</body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
    response.cookies.set(createCustomerAuthCookie(sessionToken, isSecureRequest(req)));
    return response;
  }

  const response = NextResponse.redirect(webUrl);
  response.cookies.set(createCustomerAuthCookie(sessionToken, isSecureRequest(req)));
  return response;
}
