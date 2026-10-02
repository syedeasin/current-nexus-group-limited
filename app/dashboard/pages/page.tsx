import Link from "next/link";
import { ExternalLink, PencilLine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { routing } from "@/i18n/routing";
import { PAGES, pageSlug } from "@/lib/page-content/registry";

const LOCALE_LABEL: Record<string, string> = { en: "English", fr: "French" };

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PagesDashboardPage() {
  await requirePageAccess("page.manage");

  const rows = await prisma.pageContent.findMany({
    select: { pageKey: true, locale: true, updatedAt: true, updatedBy: { select: { name: true } } },
  });
  const edits = new Map(rows.map((r) => [`${r.pageKey}:${r.locale.toLowerCase()}`, r]));

  const groups = PAGES.reduce<Record<string, typeof PAGES>>((acc, page) => {
    (acc[page.group] ??= []).push(page);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-32">
        <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Website</p>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">
          Pages
        </h1>
        <p className="mt-8 max-w-760 text-p3 font-light text-neutral-5">
          Edit the text, images, links and lists on every fixed-design page of the website, in each language.
          Product pages are built under Manufacturing, solution and project pages under Solutions &amp; Projects,
          and articles under News.
        </p>
      </div>

      <div className="space-y-32">
        {Object.entries(groups).map(([group, pages]) => (
          <section key={group} aria-labelledby={`group-${group.replace(/\W+/g, "-")}`}>
            <h2
              id={`group-${group.replace(/\W+/g, "-")}`}
              className="mb-12 text-p4 font-semibold uppercase tracking-[2px] text-neutral-5"
            >
              {group}
            </h2>
            <ul className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
              {pages.map((page) => (
                <li
                  key={page.key}
                  className="flex flex-col gap-16 border-b border-neutral-10 px-24 py-20 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/pages/${pageSlug(page.key)}`}
                      className="text-p2 font-medium text-neutral-1 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {page.label}
                    </Link>
                    <p className="mt-2 text-p4 text-neutral-5">{page.description}</p>
                    <p className="mt-4 text-p4 text-neutral-5">
                      {routing.locales.map((locale, i) => {
                        const edit = edits.get(`${page.key}:${locale}`);
                        return (
                          <span key={locale}>
                            {i > 0 && " · "}
                            {LOCALE_LABEL[locale] ?? locale}:{" "}
                            {edit
                              ? `edited ${formatDate(edit.updatedAt)}${edit.updatedBy ? ` by ${edit.updatedBy.name}` : ""}`
                              : "default copy"}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-8">
                    {routing.locales.map((locale) => (
                      <Link
                        key={locale}
                        href={`/dashboard/pages/${pageSlug(page.key)}?locale=${locale}`}
                        className="inline-flex items-center gap-6 rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <PencilLine size={14} aria-hidden="true" />
                        Edit {locale.toUpperCase()}
                        <span className="sr-only"> — {page.label}</span>
                      </Link>
                    ))}
                    {page.href && (
                      <a
                        href={`/${routing.defaultLocale}${page.href === "/" ? "" : page.href}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-6 rounded-full px-12 py-8 text-p4 font-semibold uppercase tracking-[1px] text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        View
                        <ExternalLink size={14} aria-hidden="true" />
                        <span className="sr-only"> {page.label} (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
