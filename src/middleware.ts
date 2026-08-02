import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // If trying to go to Admin Routes
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    
    // If the token is not there, it will be sent to the login page
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If you try to go to the login page again while logged in, you will be sent to the Dashboard
  if (path === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Paths are required for this middleware to work
export const config = {
  matcher: ['/admin/:path*'],
};