'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, List as ListIcon, Images } from 'lucide-react'

export type ViewHrefBase = { gallery: string; list: string }

function viewHref(params: URLSearchParams, dest: 'gallery' | 'list' | 'photos', hrefBase: ViewHrefBase): string {
    const next = new URLSearchParams(params.toString())
    next.delete('page')
    next.delete('view')
    if (dest === 'photos') next.set('view', 'photos')
    const base = dest === 'list' ? hrefBase.list : hrefBase.gallery
    return `${base}?${next.toString()}`
}

export default function ViewToggle({
                                       view,
                                       hrefBase,
                                       className = '',
                                   }: {
    view: 'gallery' | 'list' | 'photos'
    /** Base paths for the list/gallery views, e.g. { gallery: '/stories-gallery', list: '/stories-list' }. The "photos" view reuses the gallery base with ?view=photos. */
    hrefBase: ViewHrefBase
    className?: string
}) {
    const params = useSearchParams()

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {view === 'list' ? (
                <button type="button" aria-label="List view" aria-current="page" className="text-primary">
                    <ListIcon className="h-5 w-5" />
                </button>
            ) : (
                <Link href={viewHref(params, 'list', hrefBase)} aria-label="List view" className="text-ink-3 transition-colors hover:text-primary">
                    <ListIcon className="h-5 w-5" />
                </Link>
            )}
            {view === 'gallery' ? (
                <button type="button" aria-label="Gallery view" aria-current="page" className="text-primary">
                    <LayoutGrid className="h-5 w-5" />
                </button>
            ) : (
                <Link href={viewHref(params, 'gallery', hrefBase)} aria-label="Gallery view" className="text-ink-3 transition-colors hover:text-primary">
                    <LayoutGrid className="h-5 w-5" />
                </Link>
            )}
            {view === 'photos' ? (
                <button type="button" aria-label="Photos view" aria-current="page" className="text-primary">
                    <Images className="h-5 w-5" />
                </button>
            ) : (
                <Link href={viewHref(params, 'photos', hrefBase)} aria-label="Photos view" className="text-ink-3 transition-colors hover:text-primary">
                    <Images className="h-5 w-5" />
                </Link>
            )}
        </div>
    )
}
