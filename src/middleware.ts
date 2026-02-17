import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "auris-secret-key-change-in-production-2024"
);

const COOKIE_NAME = "cv_session";

// Routes that DON'T require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth"];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin", "/api/requests", "/api/users"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow other API routes (they're used by the app)
  // But protect admin APIs
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith("/api/");

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // No token → redirect to login (for pages) or return 401 (for APIs)
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Admin check
    if (isAdminRoute && payload.role !== "admin") {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid token → clear cookie and redirect to login
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
