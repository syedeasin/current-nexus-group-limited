'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function AdminSearchBar({
  placeholder = 'Search…',
}: {
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [value, setValue] = useState(initialQ)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  function clear() {
    setValue('')
    const next = new URLSearchParams(params.toString())
    next.delete('q')
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-dark/15 rounded-lg bg-white font-mono text-[13px] text-dark placeholder:text-dark/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  )
}
