
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const tokenCookie = request.cookies.get('token');
  const token = tokenCookie?.value;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/preferences'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  let isTokenValid = false;
  if (token) {
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        isTokenValid = true;
      }
    } catch (error) {
      // Invalid token format
      isTokenValid = false;
    }
  }

  // If trying to access a protected route without a valid token, redirect to signin
  if (isProtectedRoute && !isTokenValid) {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    // Clear the invalid cookie
    if (token) {
        response.cookies.delete('token');
    }
    return response;
  }

  // If trying to access signin page with a valid token, redirect to dashboard
  if (path.startsWith('/signin') && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/preferences/:path*', '/signin'],
};
