import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Inline the routes to avoid using unsupported imports in Edge Runtime
const routes = {
  login: '/account/login',
  dashboard: '/dashboard',
  shop: '/dashboard/shop',
  inquiry: '/dashboard/inquiry',
  user: '/dashboard/user',
  settings: '/dashboard/settings',
  product: '/dashboard/product',
  order: '/dashboard/order',
};

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

  // Redirect unauthenticated users trying to access protected routes
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL(routes.login, url));
  }

  if (token) {
    try {
      // Decode the token with jsonwebtoken instead of next-auth's getToken
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);

      const userRole = decoded.role;
      const userPermissions = decoded.permissions || [];

      // Define route-based access restrictions
      const restrictedRoutes = {
        [routes.shop]: { pageId: 1, permission: "can_view" },
        [routes.inquiry]: { pageId: 2, permission: "can_view" },
        [routes.user]: { pageId: 3, permission: "can_view" },
        [routes.settings]: { pageId: 4, permission: "can_view" },
        [routes.product]: { pageId: 5, permission: "can_view" },
        [routes.order]: { pageId: 6, permission: "can_view" },
      };

      // Redirect authenticated users away from /account to their respective dashboards
      if (url.pathname.startsWith('/account') && (userRole === 'ADMIN' || userRole === 'VENDOR')) {
        return NextResponse.redirect(new URL(routes.dashboard, url));
      }

      // Check if the user has permission to access specific dashboard routes
      for (const [path, { pageId, permission }] of Object.entries(restrictedRoutes)) {
        if (url.pathname.startsWith(path)) {
          const hasPermission = userPermissions.some(
            (perm) => perm.pageId === pageId && perm[permission]
          );

          if (!hasPermission) {
            // Redirect to dashboard if the user lacks permission for the specific route
            return NextResponse.redirect(new URL(routes.dashboard, url));
          }
        }
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      // Redirect to login if token verification fails
      return NextResponse.redirect(new URL(routes.login, url));
    }
  }

  // Allow the request to proceed if no redirects were triggered
  return NextResponse.next();
}

// Apply the middleware only to specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
