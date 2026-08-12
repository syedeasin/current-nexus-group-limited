'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string

  if (password !== confirm) {
    redirect(`/signup?error=${encodeURIComponent('Passwords do not match.')}`)
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent('Password must be at least 8 characters.')}`)
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmation is OFF in Supabase, signUp returns a session immediately.
  // If ON (default), session is null and the user must confirm via email link first.
  if (data.session) {
    redirect('/admin')
  }

  redirect('/signup?message=' + encodeURIComponent('Account created. Check your email to confirm before logging in.'))
}
