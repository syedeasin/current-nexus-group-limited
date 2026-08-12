'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import FilterPanel from './FilterPanel'
import ViewToggle from './ViewToggle'


type Option = { id: string; name: string; slug: string; count: number }
type Group = { id: string; title: string; options: Option[] }

const DEFAULT_FILTER_PARAMS = ['subject', 'topic', 'keyword', 'year', 'format', 'genre', 'age']

export default function FilterDrawer({
                                         groups,
                                         filterParams = DEFAULT_FILTER_PARAMS,
                                         pinned,
                                         viewHrefBase,
                                         view = 'gallery',
                                     }: {
    groups: Group[]
    /** URL param names counted toward the mobile "Filters" badge. */
    filterParams?: string[]
    /** Forwarded to FilterPanel — a (group id, slug) pair that's always selected. */
    pinned?: { groupId: string; slug: string }
    /** Forwarded to ViewToggle — base paths for each view. */
    viewHrefBase: { gallery: string; list: string }
    view?: 'gallery' | 'list' | 'photos'
}) {
    const params = useSearchParams()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    // Count active filters for the button badge.
    const activeCount = filterParams.reduce((sum, key) => {
        const vals = (params.get(key) ?? '').split(',').filter(Boolean)
        return sum + vals.length
    }, 0)

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // Close on Escape.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    return (
        <>
        {/* ── DESKTOP: sticky sidebar (unchanged behaviour) ── */}
        <div className="hidden flex-col gap-3 md:flex md:sticky md:top-24">
            <FilterPanel groups={groups} pinned={pinned} />
        </div>

        {/* ── MOBILE: FILTERS button + view toggle pill in one row ── */}
        <div className="flex items-center justify-between gap-3 md:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-[14px] font-semibold uppercase tracking-[-0.5px] text-white transition-opacity hover:opacity-90"
            >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {activeCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 font-mono text-[12px] font-bold text-primary">
              {activeCount}
            </span>
                )}
            </button>

            {/* View toggle pill */}
            <div className="flex items-center gap-4 rounded-full border border-line bg-white px-5 py-3">
                <ViewToggle view={view} hrefBase={viewHrefBase} />
            </div>
        </div>

        {/* ── MOBILE: overlay + left drawer ── */}
        {/* Overlay */}
        <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
        />

        {/* Drawer */}
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className={`fixed inset-y-0 left-0 z-[70] flex w-[88%] max-w-[360px] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out md:hidden ${
                open ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-fjalla text-[22px] uppercase tracking-[-0.4px] text-ink">
            Filters
          </span>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close filters"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/5 text-ink transition-colors hover:bg-secondary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {/* Filter list — each accordion shows ~6 options then scrolls inside,
            just like desktop. The drawer itself scrolls between accordions. */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <div className="flex flex-col gap-3">
                    <FilterPanel groups={groups} pinned={pinned} />
                </div>
            </div>

            {/* Sticky footer: clear / view results */}
            <div className="flex items-center gap-3 border-t border-line bg-cream px-5 py-4">
                <a
                    href={pathname}
                    className="flex-1 rounded-full border border-line py-3 text-center font-mono text-[13px] font-bold uppercase tracking-[0.5px] text-ink-2 transition-colors hover:border-primary hover:text-primary"
                >
                    Clear all
                </a>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-[2] rounded-full bg-primary py-3 text-center font-mono text-[13px] font-bold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90"
                >
                    View results
                </button>
            </div>
        </div>
        </>
    )
}
