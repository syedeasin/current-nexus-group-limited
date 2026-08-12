import { updateSession } from './lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request, {
    protectedPrefix: '/admin',
    loginPath: '/admin/login',
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
