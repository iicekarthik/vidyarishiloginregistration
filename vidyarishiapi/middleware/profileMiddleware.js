import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 👉 Allow public routes (login, register, otp)
  const publicRoutes = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/send-otp",
    "/api/auth/verify-otp"
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 👉 For all other /api routes → JWT required
  if (pathname.startsWith("/api")) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);

      if (!decoded?.id) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Attach userId to request so APIs can use it
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Apply middleware only to API routes
export const config = {
  matcher: ["/api/:path*"],
};
