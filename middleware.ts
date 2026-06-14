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
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
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

  let user = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  } catch (error) {
    console.error('Supabase auth error in middleware:', error);
  }

  const pathname = request.nextUrl.pathname;
  
  // Deteksi locale dari URL, default ke 'id' jika tidak ada prefix
  const localeMatch = pathname.match(/^\/(en|id)(\/|$)/);
  const currentLocale = localeMatch ? localeMatch[1] : 'id';
  const pathnameWithoutLocale = localeMatch ? pathname.replace(`/${currentLocale}`, '') || '/' : pathname;

  const isAuthPage = pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/register';
  const isRootPage = pathnameWithoutLocale === '/';

  const isProtectedRoute = 
    pathnameWithoutLocale.startsWith('/admin') || 
    pathnameWithoutLocale.startsWith('/consultant') || 
    pathnameWithoutLocale.startsWith('/operator') || 
    pathnameWithoutLocale.startsWith('/satgas') || 
    pathnameWithoutLocale.startsWith('/report');

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'reporter';
    
    // Tentukan allowed prefix dan default redirect path untuk role tersebut
    let allowedPrefix = '/report';
    let defaultPath = '/report/start';

    if (role === 'admin') {
      allowedPrefix = '/admin';
      defaultPath = '/admin/dashboard';
    } else if (role === 'consultant') {
      allowedPrefix = '/consultant';
      defaultPath = '/consultant/dashboard';
    } else if (role === 'operator') {
      allowedPrefix = '/operator';
      defaultPath = '/operator/dashboard';
    } else if (role === 'satgas') {
      allowedPrefix = '/satgas';
      defaultPath = '/satgas/dashboard';
    }

    // Redirect jika user berada di auth page, root page, atau mengakses rute terlindungi yang BUKAN milik role-nya
    if (isAuthPage || isRootPage || (isProtectedRoute && !pathnameWithoutLocale.startsWith(allowedPrefix))) {
      if (pathnameWithoutLocale !== defaultPath) {
        // Karena NextResponse.redirect tidak membawa cookies dari response sebelumnya (termasuk next-intl),
        // kita menggunakan response yang ada, lalu menambahkan header Location untuk redirect dan mengubah status.
        // Tapi cara termudah di App Router Middleware adalah mem-passing cookies ke NextResponse.redirect
        const redirectUrl = new URL(`/${currentLocale}${defaultPath}`, request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        
        // Salin cookies auth dari middleware intl/supabase ke redirectResponse
        response.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        
        return redirectResponse;
      }
    }
  } else if (isProtectedRoute && !isAuthPage) {
    // Jika belum login tapi mencoba akses halaman terlindungi
    const redirectUrl = new URL(`/${currentLocale}/login`, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
