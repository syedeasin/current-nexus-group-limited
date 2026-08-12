import { login } from './actions'
import PasswordInput from '../../../components/ui/PasswordInput'

export default function LoginPage({
  searchParams,
  logo,
}: {
  searchParams: { error?: string }
  /** Slot for your brand mark — originally a hardcoded <BrandLogo />. */
  logo?: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-primary/10 shadow-sm p-8 md:p-10">
        <div className="flex justify-center mb-8">
          {logo}
        </div>

        <div className="text-center mb-8">
          <p className="font-fjalla text-[14px] uppercase tracking-[2.88px] text-secondary mb-2">
            Welcome back
          </p>
          <h1 className="font-fjalla text-[28px] uppercase leading-tight tracking-[-0.5px] text-dark">
            Admin Login
          </h1>
          <p className="font-mono text-[13px] leading-6 tracking-[-0.3px] text-dark/60 mt-2">
            Sign in to manage your content.
          </p>
        </div>

        <form action={login} className="space-y-5">
          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase tracking-[1.5px] text-dark/70 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-dark/15 rounded-lg bg-cream/30 font-mono text-[14px] tracking-[-0.3px] text-dark placeholder:text-dark/40 focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold uppercase tracking-[1.5px] text-dark/70 mb-2">
              Password
            </label>
            <PasswordInput name="password" required autoComplete="current-password" />
          </div>

          {searchParams.error && (
            <div className="font-mono text-[12px] leading-5 tracking-[-0.3px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {searchParams.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 font-mono text-[13px] font-bold uppercase tracking-[1.5px] text-cream hover:bg-primary/90 transition mt-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
