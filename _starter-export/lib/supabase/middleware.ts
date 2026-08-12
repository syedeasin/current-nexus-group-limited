import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type UpdateSessionOptions = {
  /** Path prefix that requires a signed-in user, e.g. '/admin'. */
  protectedPrefix: string
  /** Exact path of the sign-in page, e.g. '/admin/login'. */
  loginPath: string
  /** Where a signed-in user is sent if they land on loginPath. Defaults to protectedPrefix. */
  redirectAuthedTo?: string
}

export async function updateSession(request: NextRequest, options: UpdateSessionOptions) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const isProtectedRoute = request.nextUrl.pathname.startsWith(options.protectedPrefix)
  const isLoginRoute = request.nextUrl.pathname === options.loginPath

  if (isProtectedRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = options.loginPath
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = options.redirectAuthedTo ?? options.protectedPrefix
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
