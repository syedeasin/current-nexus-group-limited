'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export type ToastState = { ok?: boolean; error?: string } | null

export default function Toast({ state }: { state: ToastState }) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!state) return
    setVisible(true)
    setKey((k) => k + 1)
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [state])

  if (!visible || !state) return null

  const isError = !!state.error
  const message = state.error ?? 'Saved successfully.'

  return (
    <div
      key={key}
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 max-w-sm rounded-lg shadow-lg border px-4 py-3 animate-[slideIn_0.2s_ease-out] ${
        isError
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-green-50 border-green-200 text-green-900'
      }`}
    >
      {isError ? (
        <XCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
      )}
      <div className="flex-1 text-sm leading-snug">{message}</div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-current opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
