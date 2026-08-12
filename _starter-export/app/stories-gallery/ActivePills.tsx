'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

type LabelMap = Record<string, Record<string, string>>

type Pill =
    | { kind: 'filter'; paramName: string; slug: string; label: string }
    | { kind: 'query'; value: string }

const DEFAULT_FILTER_PARAMS = ['subject', 'topic', 'keyword', 'format', 'genre', 'year', 'age']

export default function ActivePills({
                                      labels,
                                      filterParams = DEFAULT_FILTER_PARAMS,
                                      pinned,
                                    }: {
  labels: LabelMap
  /** URL param names treated as filters, e.g. ['subject', 'topic']. */
  filterParams?: string[]
  /** A single (param, slug) pair that is always active and should never show a removable pill for it — replaces the source project's hardcoded "photo format is implied in image view" special case. */
  pinned?: { paramName: string; slug: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const pills: Pill[] = []

  const q = (params.get('q') ?? '').trim()
  if (q) pills.push({ kind: 'query', value: q })

  for (const paramName of filterParams) {
    const slugs = (params.get(paramName) ?? '').split(',').filter(Boolean)
    for (const slug of slugs) {
      if (pinned && pinned.paramName === paramName && pinned.slug === slug) continue
      pills.push({ kind: 'filter', paramName, slug, label: labels[paramName]?.[slug] ?? slug })
    }
  }

  function removeFilter(paramName: string, slug: string) {
    const next = new URLSearchParams(params.toString())
    const current = (next.get(paramName) ?? '').split(',').filter(Boolean)
    const filtered = current.filter((s) => s !== slug)
    if (filtered.length === 0) next.delete(paramName)
    else next.set(paramName, filtered.join(','))
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  function removeQuery() {
    const next = new URLSearchParams(params.toString())
    next.delete('q')
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  function reset() {
    router.push(pathname)
  }

  if (pills.length === 0) {
    return (
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[14px] text-ink-3">No filters applied</span>
        </div>
    )
  }

  return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[16px] font-semibold tracking-[-0.5px] text-ink">
          You searched for:
        </span>
          <button
              type="button"
              onClick={reset}
              className="shrink-0 font-mono text-[16px] tracking-[-0.5px] text-primary underline underline-offset-4 hover:opacity-80"
          >
            Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) =>
              pill.kind === 'query' ? (
                  <button
                      key="query"
                      type="button"
                      onClick={removeQuery}
                      aria-label={`Clear search for ${pill.value}`}
                      className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-1 font-mono text-[14px] tracking-[-0.3px] text-ink-2 transition-colors hover:border-primary"
                  >
                    <span className="font-semibold">Search:</span>
                    &quot;{pill.value}&quot;
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
              ) : (
                  <button
                      key={`${pill.paramName}-${pill.slug}`}
                      type="button"
                      onClick={() => removeFilter(pill.paramName, pill.slug)}
                      aria-label={`Remove filter ${pill.label}`}
                      className="inline-flex items-center gap-[8px] rounded-md bg-white py-[4px] pl-[12px] pr-[4px] transition-colors hover:bg-cream-leaf"
                  >
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[14px] leading-[20px] tracking-[-0.7px] text-ink-2">
                {pill.label}
              </span>
                    <span className="flex shrink-0 items-center rounded bg-cream p-[4px]">
                <X className="h-4 w-4 text-ink-2" aria-hidden="true" />
              </span>
                  </button>
              )
          )}
        </div>
      </div>
  )
}
