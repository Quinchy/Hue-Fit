import { NextResponse } from 'next/server';

export async function middleware(req) {

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/pms/:path*'], // Apply middleware to specific routes
};
