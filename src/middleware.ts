import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const adminSecret = process.env.ADMIN_SECRET_KEY;

  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin_token")?.value;
    const accessPass = request.cookies.get("admin_access_pass")?.value;
    const secretKeyParam = searchParams.get("key");

    // Case 1: Attempting to access login with secret key query param (?key=...)
    if (pathname === "/admin/login" && secretKeyParam) {
      if (adminSecret && secretKeyParam === adminSecret) {
        // Correct secret key: Set access pass cookie and redirect to clean /admin/login
        const cleanUrl = new URL("/admin/login", request.url);
        const response = NextResponse.redirect(cleanUrl);
        response.cookies.set("admin_access_pass", adminSecret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 4, // 4 hours
          path: "/",
        });
        return response;
      }

      // Invalid secret key -> return 404 (Not Found)
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }

    // Case 2: On /admin/login
    if (pathname === "/admin/login") {
      // If already logged in, go straight to Admin Dashboard
      if (adminToken) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // If secret key is enabled and client does NOT have valid access pass -> 404
      if (adminSecret && accessPass !== adminSecret) {
        return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
      }

      return NextResponse.next();
    }

    // Case 3: Other Admin Routes (/admin, /admin/products, /admin/orders, etc.)
    if (!adminToken) {
      // If they unlocked login previously, send them to login
      if (adminSecret && accessPass === adminSecret) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // If unauthorized with no secret pass, disguise as 404
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};