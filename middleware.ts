import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware to handle translations and locale prefixing
  const response = intlMiddleware(request);

  // 2. Setup Supabase to check session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Basic route protection based on session and role
  // This is a placeholder for actual role-based routing
  const pathname = request.nextUrl.pathname;

  // e.g. /admin requires admin role
  if (pathname.includes('/admin') && !session) {
    // redirect to login
    const loginUrl = new URL('/id/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
