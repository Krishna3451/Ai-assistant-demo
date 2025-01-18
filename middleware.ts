import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add public paths that don't require authentication
const publicPaths = ['/login'];

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Always allow access to public paths regardless of auth status
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If the path is private and user is not authenticated, redirect to login
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
