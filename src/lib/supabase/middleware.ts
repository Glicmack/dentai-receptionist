import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Route classification
  const isAdminRoute = path.startsWith('/admin')
  const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/onboarding')
  const isAuthRoute = path === '/login' || path === '/register'
  const isStoreAuthRoute = path === '/store/login' || path === '/store/register'
  const isStoreDashboard = path === '/store/dashboard'
  const isDrChat = /^\/dr\/[^/]+\/chat/.test(path)
  const isDrBook = /^\/dr\/[^/]+\/book/.test(path)
  const isPatientProtected = isStoreDashboard || isDrChat || isDrBook

  // Handle OAuth redirect landing on root with code parameter
  if (path === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  // If Supabase is not configured, block protected routes
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isDashboardRoute || isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    const { data: { user } } = await supabase.auth.getUser()

    // === ADMIN ROUTE PROTECTION ===
    if (isAdminRoute) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
      // Check admin status via API-level (middleware can't query DB directly with admin client easily)
      // We set a header flag and let the admin layout verify
      supabaseResponse.headers.set('x-user-email', user.email || '')
      return supabaseResponse
    }

    // === DASHBOARD ROUTE PROTECTION (Doctor Panel) ===
    if (isDashboardRoute) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // === PATIENT PROTECTED ROUTES ===
    if (isPatientProtected) {
      const patientToken = request.cookies.get('patient_session')?.value
      if (!patientToken) {
        const url = request.nextUrl.clone()
        url.pathname = '/store/login'
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // === AUTH ROUTES: Redirect logged-in users ===
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // === STORE AUTH ROUTES: Redirect logged-in patients ===
    if (isStoreAuthRoute) {
      const patientToken = request.cookies.get('patient_session')?.value
      if (patientToken) {
        const url = request.nextUrl.clone()
        url.pathname = '/store/dashboard'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch {
    if (isDashboardRoute || isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }
}
