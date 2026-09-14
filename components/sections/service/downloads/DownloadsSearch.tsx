"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { ParsedDownloadParams } from "@/lib/downloads-params";
import { cn } from "@/lib/utils";
import { downloadsHref } from "./links";
import type { DownloadsLabels } from "./labels";

interface DownloadsSearchProps {
  params: ParsedDownloadParams;
  basePath: string;
  labels: DownloadsLabels;
  className?: string;
}

/**
 * Search commits on submit, not on keystroke: every commit is a server round
 * trip and a new entry in the URL, and debouncing that would fill the history
 * with half-typed queries.
 */
export default function DownloadsSearch({
  params,
  basePath,
  labels,
  className,
}: DownloadsSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(params.search);
  const [valueFor, setValueFor] = useState(params.search);
  if (valueFor !== params.search) {
    // Clear all / back button / a chip removal rewrote the URL — follow it.
    setValueFor(params.search);
    setValue(params.search);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(downloadsHref(basePath, params, { search: value.trim() }), { scroll: false });
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full items-center gap-8 rounded-full border-[1.5px] border-neutral-10 bg-white py-18 pl-24 pr-18",
        "focus-within:border-secondary transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] motion-reduce:transition-none",
        className
      )}
    >
      <button
        type="submit"
        aria-label={labels.searchSubmit}
        className="flex shrink-0 items-center justify-center rounded-full text-neutral-1 transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none"
      >
        <Search size={20} aria-hidden="true" />
      </button>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchLabel}
        className="min-w-0 flex-1 bg-transparent text-p4 text-neutral-1 outline-none placeholder:text-neutral-5"
      />
    </form>
  );
}
