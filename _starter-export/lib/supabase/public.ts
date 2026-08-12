import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Read-only client for PUBLIC pages. Unlike the cookie-based server client,
// this never touches `cookies()`, so pages that use it can be statically
// rendered / ISR-cached instead of being forced dynamic on every request.
// It runs as the anon role; your public_read_* RLS policies should expose
// exactly the published data your public site needs.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
