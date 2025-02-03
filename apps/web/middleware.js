import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Inline only the minimal route paths needed by the middleware.
// This avoids importing the external "routes" file that may pull in problematic modules.
const routes = {
  shopSuccess: "/shop/success",
  shopSetup: "/shop/setup",
};

// Helper to remove trailing slashes (except for the root "/")
function normalizePath(path) {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const normalizedPath = normalizePath(pathname);

  // 0. Redirect vendors accessing shopSuccess to shopSetup if status is PENDING or SHOP_SETUP.
  if (
    token &&
    token.role === "VENDOR" &&
    normalizedPath === normalizePath(routes.shopSuccess)
  ) {
    if (token.status === "PENDING" || token.status === "SHOP_SETUP") {
      return NextResponse.redirect(new URL(routes.shopSetup, url));
    }
    return NextResponse.next();
  }

  // 1. Unauthenticated Access: Protect dashboard and partnership routes.
  if (
    !token &&
    (normalizedPath.startsWith("/dashboard") ||
      normalizedPath.startsWith("/partnership"))
  ) {
    return NextResponse.redirect(new URL("/account/login", url));
  }

  // 2. Redirect Authenticated Users Away from /account.
  if (token && normalizedPath.startsWith("/account")) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  // 3. Role & Status Based Access Control.
  if (token) {
    if (token.role === "VENDOR") {
      // Vendors with PENDING or SHOP_SETUP status must remain on shopSetup.
      if (token.status === "PENDING" || token.status === "SHOP_SETUP") {
        if (normalizedPath !== normalizePath(routes.shopSetup)) {
          return NextResponse.redirect(new URL(routes.shopSetup, url));
        }
      }
      // ACTIVE vendors are allowed only specific routes.
      else if (token.status === "ACTIVE") {
        const vendorAllowedRoutes = [
          "/dashboard",
          "/dashboard/product",
          "/dashboard/order",
          "/dashboard/maintenance",
          "/dashboard/virtual-fitting",
        ];
        const allowed = vendorAllowedRoutes.some((route) =>
          normalizedPath.startsWith(normalizePath(route))
        );
        if (!allowed) {
          return NextResponse.redirect(new URL("/dashboard", url));
        }
      }
      // Fallback: any other vendor status redirects to dashboard.
      else {
        return NextResponse.redirect(new URL("/dashboard", url));
      }
    } else if (token.role === "ADMIN") {
      const adminAllowedRoutes = [
        "/dashboard",
        "/dashboard/shop",
        "/dashboard/inquiry",
        "/dashboard/user",
        "/dashboard/settings",
      ];
      const allowed = adminAllowedRoutes.some((route) =>
        normalizedPath.startsWith(normalizePath(route))
      );
      if (!allowed) {
        return NextResponse.redirect(new URL("/dashboard", url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/partnership/:path*"],
};
