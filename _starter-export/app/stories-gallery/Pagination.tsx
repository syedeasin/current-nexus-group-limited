'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'

export default function Pagination({
                                       page,
                                       totalPages,
                                   }: {
    page: number
    totalPages: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()

    if (totalPages < 1) return null

    function goto(n: number) {
        if (n < 1 || n > totalPages || n === page) return
        const next = new URLSearchParams(params.toString())
        if (n <= 1) next.delete('page')
        else next.set('page', String(n))
        router.push(`${pathname}?${next.toString()}`)
    }

    // Visible page numbers: always show first, last; up to 3 around current
    const visible: (number | 'ellipsis')[] = []
    const windowStart = Math.max(2, page - 1)
    const windowEnd   = Math.min(totalPages - 1, page + 1)

    visible.push(1)
    if (windowStart > 2) visible.push('ellipsis')
    for (let i = windowStart; i <= windowEnd; i++) visible.push(i)
    if (windowEnd < totalPages - 1) visible.push('ellipsis')
    if (totalPages > 1) visible.push(totalPages)

    const navBtn =
        'flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40'

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-center gap-1 pt-6"
        >
            <button
                type="button"
                aria-label="First page"
                onClick={() => goto(1)}
                disabled={page === 1}
                className={navBtn}
            >
                <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label="Previous page"
                onClick={() => goto(Math.max(1, page - 1))}
                disabled={page === 1}
                className={navBtn}
            >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {visible.map((n, i) =>
                    n === 'ellipsis' ? (
                        <span
                            key={`e-${i}`}
                            aria-hidden="true"
                            className="flex h-9 w-9 items-center justify-center font-mono text-[14px] text-ink-3"
                        >
            …
          </span>
                    ) : (
                        <button
                            key={n}
                            type="button"
                            onClick={() => goto(n)}
                            aria-label={`Page ${n}`}
                            aria-current={page === n ? 'page' : undefined}
                            className={`flex h-9 w-9 items-center justify-center rounded-md font-mono text-[14px] tracking-[-0.3px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                page === n
                                    ? 'bg-secondary text-paper'
                                    : 'border border-line bg-white text-ink hover:border-primary'
                            }`}
                        >
                            {n}
                        </button>
                    )
            )}
            <button
                type="button"
                aria-label="Next page"
                onClick={() => goto(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={navBtn}
            >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label="Last page"
                onClick={() => goto(totalPages)}
                disabled={page === totalPages}
                className={navBtn}
            >
                <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </button>
        </nav>
    )
}
