import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://missing-supabase-url'
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-supabase-key'

  const supabase = createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')

  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/trades') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/equity') ||
    pathname.startsWith('/strategies') ||
    pathname.startsWith('/psychology') ||
    pathname.startsWith('/prop-firms') ||
    pathname.startsWith('/accounts') ||
    pathname.startsWith('/risk') ||
    pathname.startsWith('/calculators') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/import') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings')

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
