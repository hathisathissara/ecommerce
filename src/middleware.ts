import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Admin Routes වලට යන්න හදනවා නම්
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    
    // Token එක නැත්නම් Login පේජ් එකට යවනවා
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Login වෙලා ඉද්දි ආයෙත් Login පේජ් එකට යන්න හැදුවොත් Dashboard එකට යවනවා
  if (path === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// මේ Middleware එක වැඩ කරන්න ඕනේ Paths ටික
export const config = {
  matcher: ['/admin/:path*'],
};