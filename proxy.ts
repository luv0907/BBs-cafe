import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Read the environment variable that Vercel injects
  // "CUSTOMER" handles public traffic, "ADMIN" handles the backend dashboard.
  const appMode = process.env.DEPLOYMENT_TYPE || 'CUSTOMER'
  const path = request.nextUrl.pathname

  // ----------------------------------------------------
  // SCENARIO A: The CUSTOMER Deployment Link
  // ----------------------------------------------------
  if (appMode === 'CUSTOMER') {
    // Ensure the `/admin` terminal cannot be accessed mathematically
    if (path.startsWith('/admin')) {
      // Rewrite the URL internally to a Next.js built-in 404 page
      // This hides the existence of the Admin dashboard completely on this domain
      request.nextUrl.pathname = '/404'
      return NextResponse.rewrite(request.nextUrl)
    }
  }

  // ----------------------------------------------------
  // SCENARIO B: The ADMIN Deployment Link
  // ----------------------------------------------------
  if (appMode === 'ADMIN') {
    // If an administrator accesses the bare domain (bbs-admin.vercel.app/), 
    // force redirect them straight into the control panel.
    if (path === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Allow all normal traffic (like /checkout, /about) to pass through smoothly
  return NextResponse.next()
}

// Limit the Middleware to only intercept specific routes so images and static assets load quickly
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
