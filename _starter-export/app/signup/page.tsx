import { redirect } from 'next/navigation'

// Signup is disabled for now — admin-only access.
// To re-enable public signup, remove the redirect below. See git history
// of the source project's app/signup/page.tsx for a full reference
// implementation (email/password form posting to ./actions#signup).
export default function SignupPage() {
  redirect('/admin/login')
}
