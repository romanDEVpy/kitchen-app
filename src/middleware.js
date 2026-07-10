import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

async function readSession(request) {
  const token = request.cookies.get('admin_token')?.value;
  return verifyToken(token);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redirect /manager/login to /admin/login
  if (pathname === '/manager/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Redirect /manager and its subroutes to /admin
  if (pathname.startsWith('/manager')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await readSession(request);
    if (!session || !['admin', 'manager'].includes(session.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Generate unique nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set strict Content-Security-Policy (allows HMR in dev mode via 'unsafe-eval')
  const isDev = process.env.NODE_ENV === 'development';
  const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' ws: wss: https://*.githack.com https://*.githubusercontent.com https://*.jsdelivr.net https://*.polyhaven.org https://*.github.com; font-src 'self' data:; frame-ancestors 'self'; frame-src 'self' https://rutube.ru https://*.rutube.ru;`;
  
  response.headers.set('Content-Security-Policy', cspHeader);

  // Set Strict-Transport-Security only on secure HTTPS requests (RFC 6797 compliance)
  const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  if (proto === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
