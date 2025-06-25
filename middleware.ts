import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register"];

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    console.log(`[Middleware] Pathname: ${pathname}, Token exists: ${!!token}`);

    // Redirect authenticated users from login/register to dashboard
    if (token && publicPaths.includes(pathname)) {
      console.log(`[Middleware] Authenticated user on public path. Redirecting to /dashboard.`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the path is protected and there's no token, redirect to login
    if (!token && !publicPaths.includes(pathname)) {
      console.log(`[Middleware] Unauthenticated user on protected path. Redirecting to /login.`);
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    console.log(`[Middleware] Allowing request to proceed.`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        console.log(`[Authorized Callback] Pathname: ${pathname}, Token exists: ${!!token}`);

        // Allow all public paths without authentication
        if (publicPaths.includes(pathname)) {
          console.log(`[Authorized Callback] Path is public. Authorizing.`);
          return true;
        }
        // For protected paths, authorization depends on the token existence
        const isAuthorized = !!token;
        console.log(`[Authorized Callback] Path is protected. Authorized: ${isAuthorized}`);
        return isAuthorized;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).{1,})",
  ],
};
