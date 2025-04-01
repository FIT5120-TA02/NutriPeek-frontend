import { routing } from '@/libs/i18nNavigation';
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: routing.locales,
  
  // If this locale is matched, pathname will remain unchanged
  defaultLocale: routing.defaultLocale,
  
  // Used when no locale matches
  localePrefix: routing.localePrefix,
});

export const config = {
  // Match all pathnames except for
  // - static files (e.g., '/images/*')
  // - api routes (e.g., '/api/*')
  // - endpoints (e.g., '/_next/*')
  // - and locales (e.g., '/en/*')
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
}; 