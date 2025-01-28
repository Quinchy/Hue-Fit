import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();
  const stepPaths = ["/partnership/1", "/partnership/2", "/partnership/success"];

  // Partnership path check for preventing skipping forward steps
  if (url.pathname.startsWith("/partnership")) {
    const currentStep = parseInt(req.cookies.get("currentStep") || "1");
    const currentStepIndex = stepPaths.indexOf(url.pathname);

    if (currentStepIndex > currentStep - 1) {
      return NextResponse.redirect(new URL(stepPaths[currentStep - 1], url));
    }
  }

  // Redirect unauthenticated users trying to access /dashboard paths
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/account/login", url));
  }

  // If user is authenticated, check for role-based access restrictions
  if (token) {
    const userRole = token.role;

    // Define restricted routes for specific roles
    const roleBasedAccess = {
      ADMIN: [
        "/dashboard",
        "/dashboard/shop",
        "/dashboard/inquiry",
        "/dashboard/user",
        "/dashboard/settings",
      ],
      VENDOR: [
        "/dashboard",
        "/dashboard/product",
        "/dashboard/order",
        "/dashboard/maintenance",
        "/dashboard/virtual-fitting",
      ],
    };

    // Redirect authenticated users away from /account paths to their respective dashboards
    if (url.pathname.startsWith("/account")) {
      if (userRole === "ADMIN" || userRole === "VENDOR") {
        return NextResponse.redirect(new URL("/dashboard", url));
      }
    }

    // Check if the user has access to the specific route
    const allowedRoutes = roleBasedAccess[userRole] || [];
    if (!allowedRoutes.some((route) => url.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/partnership/:path*"],
};
