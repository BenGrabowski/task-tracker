import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isInviteRoute = pathname.startsWith("/invite");

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.includes(pathname) || isInviteRoute;

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated but has no household, redirect to household setup
  if (
    session?.user &&
    !session.user.householdId &&
    pathname !== "/household/setup" &&
    !isInviteRoute
  ) {
    return NextResponse.redirect(new URL("/household/setup", request.url));
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
