// middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import routes from '@/routes';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  // Redirect unauthenticated users trying to access /dashboard paths
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL(routes.login, url));
  }

  // If user is authenticated, check for role-based and permission-based access restrictions
  if (token) {
    const userRole = token.role;
    const userPermissions = token.permissions; // Array of permission objects for the user's role

    // Restrict access based on routes and permissions, using integer pageId values
    const restrictedRoutes = {
      [routes.shop]: { pageId: 1, permission: "can_view" },
      [routes.inquiry]: { pageId: 2, permission: "can_view" },
      [routes.user]: { pageId: 3, permission: "can_view" },
      [routes.settings]: { pageId: 4, permission: "can_view" },
      [routes.product]: { pageId: 5, permission: "can_view" },
      [routes.order]: { pageId: 6, permission: "can_view" },
    };

    // Redirect authenticated users away from /account paths to their respective dashboards
    if (url.pathname.startsWith('/account')) {
      if (userRole === 'ADMIN' || userRole === 'VENDOR') {
        return NextResponse.redirect(new URL(routes.dashboard, url));
      }
    }

    // Check if the user has permission to access specific dashboard routes
    for (const [path, { pageId, permission }] of Object.entries(restrictedRoutes)) {
      if (url.pathname.startsWith(path)) {
        const hasPermission = userPermissions.some(
          (perm) => perm.pageId === pageId && perm[permission]
        );

        if (!hasPermission) {
          // Redirect to dashboard if user lacks permission for the specific route
          return NextResponse.redirect(new URL(routes.dashboard, url));
        }
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
