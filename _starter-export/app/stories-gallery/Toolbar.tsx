'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, LayoutGrid, List as ListIcon, Images } from 'lucide-react'
import type { ViewHrefBase } from './ViewToggle'

function viewHref(params: URLSearchParams, dest: 'gallery' | 'list' | 'photos', hrefBase: ViewHrefBase): string {
  const next = new URLSearchParams(params.toString())
  next.delete('page')
  next.delete('view')
  if (dest === 'photos') next.set('view', 'photos')
  const base = dest === 'list' ? hrefBase.list : hrefBase.gallery
  return `${base}?${next.toString()}`
}

const SORT_OPTIONS = [
  { value: 'alpha-asc',  label: 'Alphabetically, A-Z' },
  { value: 'alpha-desc', label: 'Alphabetically, Z-A' },
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
] as const
const SHOW_OPTIONS = [12, 24, 36, 48]

export default function Toolbar({
                                  total,
                                  page,
                                  perPage,
                                  sort,
                                  view,
                                  hrefBase,
                                }: {
  total: number
  page: number
  perPage: number
  sort: string
  view: 'gallery' | 'list' | 'photos'
  /** Base paths for the list/gallery views — see ViewToggle. */
  hrefBase: ViewHrefBase
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [sortOpen, setSortOpen] = useState(false)
  const [showOpen, setShowOpen] = useState(false)

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? SORT_OPTIONS[0].label

  function updateParam(key: string, value: string | null, opts?: { resetPage?: boolean }) {
    const next = new URLSearchParams(params.toString())
    if (value === null) next.delete(key)
    else next.set(key, value)
    if (opts?.resetPage) next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  return (
      <div
          className="hidden flex-wrap items-center justify-between gap-4 rounded-md border border-line px-[20px] py-[16px] font-mono text-[16px] leading-[24px] tracking-[-0.8px] text-ink md:flex">
        {/* Left: sort + count */}
        <div className="flex flex-wrap items-center gap-[16px]">
          <span className="font-normal text-ink-3">Sort by :</span>
          <div className="relative">
            <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                aria-label={`Sort by: ${sortLabel}`}
                className="flex items-center gap-[12px] font-normal text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {sortLabel}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true"/>
            </button>
            {sortOpen && (
                <ul role="listbox"
                    className="absolute left-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-md border border-line bg-white shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                      <li key={opt.value} role="option" aria-selected={opt.value === sort}>
                        <button
                            type="button"
                            onClick={() => {
                              setSortOpen(false)
                              updateParam('sort', opt.value, {resetPage: true})
                            }}
                            className={`block w-full px-3 py-2 text-left font-mono text-[16px] leading-[24px] tracking-[-0.8px] transition-colors hover:bg-cream ${
                                opt.value === sort ? 'bg-primary/5 font-semibold text-primary' : 'font-normal text-ink'
                            }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                  ))}
                </ul>
            )}
          </div>
          <div className="h-[16px] w-px shrink-0 bg-line"/>
          {/* "results" kept as one node so VoiceOver reads it as a single word */}
          <span className="font-normal text-ink">
          Showing {from} - {to} of {total} <span>{total === 1 ? 'result' : 'results'}</span>
        </span>
        </div>

        {/* Right: show count + view toggle */}
        <div className="flex items-center gap-[16px]">
          <span className="font-normal text-ink-3">Show :</span>
          <div className="relative">
            <button
                type="button"
                onClick={() => setShowOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={showOpen}
                aria-label={`Show ${perPage} per page`}
                className="flex items-center gap-[12px] font-normal text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {perPage}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true"/>
            </button>
            {showOpen && (
                <ul role="listbox"
                    className="absolute right-0 top-full z-10 mt-1 w-20 overflow-hidden rounded-md border border-line bg-white shadow-lg">
                  {SHOW_OPTIONS.map((opt) => (
                      <li key={opt} role="option" aria-selected={opt === perPage}>
                        <button
                            type="button"
                            onClick={() => {
                              setShowOpen(false)
                              updateParam('per', String(opt), {resetPage: true})
                            }}
                            className={`block w-full px-3 py-2 text-left font-mono text-[16px] leading-[24px] tracking-[-0.8px] transition-colors hover:bg-cream ${
                                opt === perPage ? 'bg-primary/5 font-semibold text-primary' : 'font-normal text-ink'
                            }`}
                        >
                          {opt}
                        </button>
                      </li>
                  ))}
                </ul>
            )}
          </div>
          <div className="h-[16px] w-px shrink-0 bg-line"/>
          <div className="flex items-center gap-[16px]">
            {view === 'list' ? (
                <button type="button" aria-label="List view" aria-current="page" className="text-primary">
                  <ListIcon className="h-5 w-5"/>
                </button>
            ) : (
                <Link href={viewHref(params, 'list', hrefBase)} aria-label="List view"
                      className="text-ink-3 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  <ListIcon className="h-5 w-5"/>
                </Link>
            )}
            {view === 'gallery' ? (
                <button type="button" aria-label="Gallery view" aria-current="page" className="text-primary">
                  <LayoutGrid className="h-5 w-5"/>
                </button>
            ) : (
                <Link href={viewHref(params, 'gallery', hrefBase)} aria-label="Gallery view"
                      className="text-ink-3 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  <LayoutGrid className="h-5 w-5"/>
                </Link>
            )}
            {view === 'photos' ? (
                <button type="button" aria-label="Photos view" aria-current="page" className="text-primary">
                  <Images className="h-5 w-5"/>
                </button>
            ) : (
                <Link href={viewHref(params, 'photos', hrefBase)} aria-label="Photos view"
                      className="text-ink-3 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  <Images className="h-5 w-5"/>
                </Link>
            )}
          </div>
        </div>
      </div>
  )
}
