"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  /** Sub-section (e.g. "2.1 …"): indented under its parent. */
  sub: boolean;
}

/**
 * "On this page" list for the legal pages. Highlights the section being read
 * (scroll spy) and jumps to a section on click.
 */
export default function LegalToc({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    // A section counts as "being read" once its top passes just under the header.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -65% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="flex flex-col gap-16">
      <p className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{label}</p>
      <ol className="flex flex-col border-l border-neutral-10">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-5 pr-8 text-p4 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
                  item.sub ? "pl-32" : "pl-16",
                  current ? "border-secondary font-semibold text-neutral-1" : "border-transparent text-neutral-5 hover:text-neutral-1"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
