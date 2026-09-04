"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  /** focuses the input when it flips true, e.g. when a search overlay opens */
  active?: boolean;
  onSubmitted?: () => void;
  className?: string;
}

// TODO: wire to real search backend — for now this only routes with the query.
export default function SearchForm({ active = false, onSubmitted, className }: SearchFormProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onSubmitted?.();
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("search")}
        className={cn(
          "h-48 w-full rounded-8 bg-surface-2 px-16 text-p3 text-neutral-1 outline-none",
          "placeholder:text-neutral-4 focus:ring-2 focus:ring-secondary"
        )}
      />
    </form>
  );
}
