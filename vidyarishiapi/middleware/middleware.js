// middleware.js
import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";

export function middleware(req) {
  const url = req.nextUrl.pathname;

  const publicApiRoutes = [
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/send-otp",
    "/api/auth/verify-otp",
    "/api/auth/check-user",
  ];

  const publicFrontendRoutes = ["/", "/register"];

  // Allow public API routes without auth
  if (url.startsWith("/api") && publicApiRoutes.includes(url)) {
    return NextResponse.next();
  }

  // Allow public frontend pages
  if (publicFrontendRoutes.includes(url)) {
    return NextResponse.next();
  }

  // Protect dashboard routes (student + normal)
  if (url.startsWith("/dashboard") || url.startsWith("/student-dashboard")) {
    const cookieAccessToken = req.cookies.get("accessToken")?.value;

    if (!cookieAccessToken) {
      return NextResponse.redirect(new URL("/register", req.url));
    }

    try {
      const decoded = verifyAccessToken(cookieAccessToken);
      if (!decoded?.id) {
        return NextResponse.redirect(new URL("/register", req.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/register", req.url));
    }
  }

  // Protect all other API routes
  if (url.startsWith("/api")) {
    const authHeader = req.headers.get("authorization");
    const cookieAccessToken = req.cookies.get("accessToken")?.value;

    if (!authHeader && !cookieAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader?.split(" ")[1] || cookieAccessToken;

    try {
      const decoded = verifyAccessToken(token);
      if (!decoded?.id) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      const newHeaders = new Headers(req.headers);
      newHeaders.set("x-user-id", decoded.id);

      return NextResponse.next({
        request: { headers: newHeaders },
      });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // Everything else: allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/student-dashboard/:path*"],
};
