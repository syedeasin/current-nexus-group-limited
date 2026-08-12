'use client'
import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, Search, Check } from 'lucide-react'

type Option = { id: string; name: string; slug: string; count: number }
type Group = {
  id: string         // URL param name, e.g. 'subject', 'topic', 'keyword'
  title: string
  options: Option[]
}

export default function FilterPanel({
                                      groups,
                                      pinned,
                                      scrollInsideOptions = true,
                                    }: {
  groups: Group[]
  /** A single (group id, slug) pair that is always selected and hidden from its own count — replaces the source project's hardcoded "photo format is implied in image view" special case. */
  pinned?: { groupId: string; slug: string }
  scrollInsideOptions?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
      Object.fromEntries(groups.map((g) => [g.id, true]))
  )
  const [searches, setSearches] = useState<Record<string, string>>(
      Object.fromEntries(groups.map((g) => [g.id, '']))
  )

  function toggleSelected(paramName: string, slug: string) {
    if (pinned && pinned.groupId === paramName) return
    const next = new URLSearchParams(params.toString())
    const current = (next.get(paramName) ?? '').split(',').filter(Boolean)
    const newValues = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug]
    if (newValues.length === 0) next.delete(paramName)
    else next.set(paramName, newValues.join(','))
    router.push(`${pathname}?${next.toString()}`)
  }

  function isSelected(paramName: string, slug: string) {
    if (pinned && pinned.groupId === paramName && pinned.slug === slug) return true
    const current = (params.get(paramName) ?? '').split(',').filter(Boolean)
    return current.includes(slug)
  }

  return (
      <>
        {groups.map((group) => {
          const filtered = group.options.filter(
              (o) => o.name.toLowerCase().includes((searches[group.id] ?? '').toLowerCase())
          )
          const isExpanded = expanded[group.id]
          return (
              <div key={group.id} className="overflow-hidden rounded-2xl border border-line bg-cream">
                {/* Accordion header */}
                <button
                    type="button"
                    onClick={() => setExpanded((p) => ({ ...p, [group.id]: !p[group.id] }))}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between bg-primary px-5 py-3 transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                >
              <span className="font-fjalla text-[20px] leading-[24px] uppercase tracking-[-0.4px] text-paper">
                {group.title}
              </span>
                  <ChevronDown
                      className={`h-5 w-5 text-paper transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                      aria-hidden="true"
                  />
                </button>

                {isExpanded && (
                    <div className="flex flex-col gap-3">
                      {/* Search inside filter */}
                      <div className="border-b border-line p-3">
                        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-[16px] py-[12px]">
                          <Search className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                          <input
                              type="text"
                              value={searches[group.id] ?? ''}
                              onChange={(e) => setSearches((p) => ({ ...p, [group.id]: e.target.value }))}
                              placeholder="Search options..."
                              aria-label={`Search ${group.title}`}
                              className="flex-1 bg-transparent font-mono text-[16px] leading-[24px] tracking-[-0.64px] font-normal text-ink outline-none placeholder:text-ink-3"
                          />
                        </div>
                      </div>

                      {/* Options list */}
                      <ul
                          className={`flex flex-col gap-2 p-3 pr-2 ${
                              scrollInsideOptions
                                  ? 'max-h-[208px] overflow-y-auto [scrollbar-color:#404645_#FCF8EB] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-ink-2 [&::-webkit-scrollbar-track]:bg-cream'
                                  : ''
                          }`}
                      >
                        {filtered.length === 0 && (
                            <li className="py-2 text-center font-mono text-[13px] text-ink-3">No options</li>
                        )}
                        {filtered.map((option) => {
                          const selected = isSelected(group.id, option.slug)
                          return (
                              <li key={option.slug}>
                                <label className="flex cursor-pointer items-center gap-3">
                          <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 ${
                                  selected ? 'border-primary bg-primary' : 'border-ink-3 bg-white'
                              }`}
                          >
                            {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true"/>}
                          </span>
                                  <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => toggleSelected(group.id, option.slug)}
                                      aria-label={`${option.name} (${option.count})`}
                                      className="peer sr-only"
                                  />
                                  <span
                                      className={`flex-1 font-mono text-[16px] leading-[24px] tracking-[-0.9px] ${
                                          selected ? 'font-semibold text-ink' : 'font-normal text-ink-2'
                                      }`}
                                  >
                            {option.name}
                          </span>
                                  {!(pinned && pinned.groupId === group.id) && (
                                      <span
                                          className={`font-mono text-[16px] leading-[24px] tracking-[-0.9px] ${
                                              selected ? 'font-semibold text-ink' : 'font-normal text-ink-2'
                                          }`}
                                      >
                              {option.count}
                            </span>
                                  )}
                                </label>
                              </li>
                          )
                        })}
                      </ul>
                    </div>
                )}
              </div>
          )
        })}
      </>
  )
}
