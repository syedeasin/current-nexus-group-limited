"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VISIBILITY_PAGES } from "@/config/page-visibility";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass } from "@/components/dashboard/ui-classes";
import { savePageVisibility, type FormResult } from "./actions";

const GROUPS = [...new Set(VISIBILITY_PAGES.map((page) => page.group))];

export default function PageVisibilityForm({ hidden }: { hidden: string[] }) {
  const router = useRouter();
  const [visible, setVisible] = useState(() => new Set(VISIBILITY_PAGES.map((p) => p.path).filter((p) => !hidden.includes(p))));
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);

  function toggle(path: string) {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const next = await savePageVisibility(new FormData(e.currentTarget));
      setResult(next);
      if (next.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      <h2 className={cardTitleClass}>Show or hide pages</h2>
      <p className="mt-8 max-w-640 text-p4 text-neutral-5">
        A hidden page is removed from the header menu, the footer and the sitemap, and its address shows “Page not found”.
        Manufacturing and Solutions &amp; Projects pages are shown or hidden with Draft / Published on each page.
      </p>

      <div className="mt-24 grid gap-24 md:grid-cols-2">
        {GROUPS.map((group) => (
          <fieldset key={group} className="rounded-12 border border-neutral-10 p-16">
            <legend className="px-4 text-p4 font-semibold uppercase tracking-[1.5px] text-neutral-5">{group}</legend>
            <ul className="flex flex-col gap-4">
              {VISIBILITY_PAGES.filter((page) => page.group === group).map((page) => {
                const on = visible.has(page.path);
                return (
                  <li key={page.path}>
                    <label className="flex cursor-pointer items-center justify-between gap-16 rounded-8 px-8 py-8 hover:bg-surface-2">
                      <span className="min-w-0">
                        <span className="block text-p3 text-neutral-1">{page.label}</span>
                        <span className="block truncate text-p4 text-neutral-6">{page.path}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-8">
                        <span className={`text-p4 font-semibold ${on ? "text-success" : "text-neutral-6"}`}>{on ? "Shown" : "Hidden"}</span>
                        <input
                          type="checkbox"
                          name="visible"
                          value={page.path}
                          checked={on}
                          onChange={() => toggle(page.path)}
                          className="h-18 w-18 accent-primary"
                        />
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {result ? <p className={`mt-24 ${result.ok ? noticeClass.success : noticeClass.error}`}>{result.ok ? result.message : result.error}</p> : null}

      <div className="mt-24">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save visibility"}
        </button>
      </div>
    </form>
  );
}
