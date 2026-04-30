import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_workshop_site';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  console.log(`Proxy hit: ${pathname}`);
  const token = request.cookies.get('admin_token')?.value;

  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    if (!token) {
      console.log('No token found, redirecting...');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      console.log('Token verified');
      return NextResponse.next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
