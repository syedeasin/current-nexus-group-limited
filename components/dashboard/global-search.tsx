"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { globalSearch, type SearchResult } from "@/app/dashboard/search-actions";

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const r = await globalSearch(query);
      setResults(r);
      setLoading(false);
      setActiveIndex(-1);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function go(result: SearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(result.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex]);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative w-full max-w-[420px]">
      <div className="relative">
        <Search size={16} strokeWidth={1.5} className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 text-neutral-6" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search posts, pages, downloads..."
          className="h-40 w-full rounded-full border border-neutral-10 bg-surface-2 pl-40 pr-56 text-p4 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-6 focus:border-primary focus:bg-white"
        />
        <kbd className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 rounded-4 border border-neutral-10 bg-white px-6 py-2 text-[11px] font-medium text-neutral-6">
          ⌘K
        </kbd>
      </div>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-8 max-h-[70vh] overflow-y-auto rounded-12 border border-neutral-10 bg-white shadow-xl"
        >
          {loading ? (
            <div className="flex items-center gap-8 px-16 py-20 text-p4 text-neutral-5">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-16 py-20 text-p4 text-neutral-5">No results for "{query}".</p>
          ) : (
            <ul className="py-8">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.href}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => go(r)}
                    className={[
                      "flex w-full items-center justify-between gap-16 px-16 py-10 text-left transition-colors duration-150",
                      i === activeIndex ? "bg-surface-1" : "hover:bg-surface-1",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-p4 font-medium text-neutral-1">{r.title}</span>
                      <span className="block text-[11px] text-neutral-5">
                        {r.type}
                        {r.subtitle ? ` · ${r.subtitle}` : ""}
                      </span>
                    </span>
                    {r.status && (
                      <span className="shrink-0 rounded-full bg-surface-2 px-10 py-4 text-[11px] font-semibold uppercase tracking-[1px] text-neutral-5">
                        {r.status}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
