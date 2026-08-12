'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  name: string
  required?: boolean
  minLength?: number
  autoComplete?: 'current-password' | 'new-password'
}

export default function PasswordInput({
  name,
  required,
  minLength,
  autoComplete = 'current-password',
}: Props) {
  const [shown, setShown] = useState(false)

  return (
    <div className="relative">
      <input
        name={name}
        type={shown ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 pr-12 border border-dark/15 rounded-lg bg-cream/30 font-mono text-[14px] tracking-[-0.3px] text-dark placeholder:text-dark/40 focus:outline-none focus:border-primary focus:bg-white transition"
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/50 hover:text-primary transition"
      >
        {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
