import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CalendarDays, CircleCheck } from "lucide-react";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import PageBanner from "@/components/sections/shared/PageBanner";
import LegalToc from "@/components/sections/legal/LegalToc";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { Link } from "@/i18n/navigation";
import { entries, str } from "@/lib/page-content/read";
import { pageTitle } from "@/lib/seo";
import { assertPageVisible } from "@/lib/page-visibility";
import { cn } from "@/lib/utils";

export type LegalKey = "privacy" | "cookies" | "terms";

const LEGAL_PATHS: Record<LegalKey, string> = {
  privacy: "/privacy-policy",
  cookies: "/cookie-policy",
  terms: "/terms",
};

export async function legalMetadata(locale: string, key: LegalKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `legal.${key}.meta` });
  return { title: pageTitle(t("title")), description: t("description") };
}

type Block = { kind: "text"; text: string } | { kind: "list"; items: string[] };

function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of body.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[-•]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (!bullet) blocks.push({ kind: "text", text: line });
    else if (last?.kind === "list") last.items.push(bullet[1]);
    else blocks.push({ kind: "list", items: [bullet[1]] });
  }
  return blocks;
}

/** "2.1 Strictly Necessary Cookies" → a sub-section of section 2. */
const isSubHeading = (heading: string) => /^\d+\.\d+\s/.test(heading);

function Body({ body }: { body: string }) {
  return (
    <>
      {toBlocks(body).map((block, index) =>
        block.kind === "list" ? (
          <ul key={index} className="flex flex-col gap-10">
            {block.items.map((item, i) => (
              <li key={i} className="relative pl-24 text-p3 text-neutral-3">
                <span aria-hidden="true" className="absolute top-[10px] left-4 size-6 rounded-full bg-secondary" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <Text key={index} size="p3" className="text-neutral-3">
            {block.text}
          </Text>
        )
      )}
    </>
  );
}

/**
 * Privacy Policy / Cookie Policy / Terms (client revision 1008, redesigned
 * after 1022). Banner, then a sticky "On this page" list beside a narrow
 * reading column: last-updated date, an "At a glance" summary and the
 * numbered sections. Everything is edited in Dashboard → Pages → Legal; a new
 * line starts a paragraph, "- " starts a bullet, and "2.1 …" headings become
 * sub-sections.
 */
export default async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  await assertPageVisible(LEGAL_PATHS[pageKey]);
  const [t, ui, all] = await Promise.all([
    getTranslations(`legal.${pageKey}`),
    getTranslations("legal.ui"),
    getTranslations("legal"),
  ]);
  const sections = entries(t.raw("sections" as never))
    .map(([id, section]) => ({ id: `legal-${id}`, heading: str(section, "heading"), body: str(section, "body") }))
    .filter((section) => section.heading || section.body);
  const toc = sections
    .filter((section) => section.heading)
    .map((section) => ({ id: section.id, label: section.heading, sub: isSubHeading(section.heading) }));
  const summary = t.has("summary")
    ? toBlocks(t("summary")).flatMap((block) => (block.kind === "list" ? block.items : [block.text]))
    : [];
  const related = (Object.keys(LEGAL_PATHS) as LegalKey[])
    .filter((key) => key !== pageKey)
    .map((key) => ({ key, href: LEGAL_PATHS[key], label: all(`${key}.title` as never) }));

  const helpCard = (
    <div className="flex flex-col gap-16 rounded-16 bg-neutral-1 p-24 text-white">
      <div className="flex flex-col gap-8">
        <p className="text-h6 font-semibold">{ui("helpTitle")}</p>
        <p className="text-p4 text-neutral-8">{ui("helpBody")}</p>
      </div>
      <Button href={ui("helpCtaHref")} size="sm" className="w-fit">
        {ui("helpCta")}
        <ArrowRight size={BUTTON_ICON_SIZE} />
      </Button>
    </div>
  );

  const relatedLinks = (
    <div className="flex flex-col gap-12">
      <p className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{ui("related")}</p>
      <ul className="flex flex-col gap-8">
        {related.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="group inline-flex items-center gap-6 text-p4 font-semibold text-neutral-1 hover:text-secondary">
              {item.label}
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {/* Photo banner like the other pages. Image: Pages → Legal → Banner image. */}
      <PageBanner
        eyebrowLabel={t("eyebrow")}
        heading={t("title")}
        description={t("intro")}
        descriptionTopHeavy
        image={{ src: t("bannerImage") || "/images/home/CTABackground.webp", objectPosition: "center" }}
        containerClassName="h-360 justify-end py-48 md:h-400 xl:h-440 xl:pb-80"
      />

      <section className="w-full bg-white py-56 md:py-80 xl:py-100">
        <Container className="grid gap-40 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-64 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-120">
          {/* Desktop: sticky contents and the help card. */}
          <aside className="hidden lg:block">
            {/* The contents list scrolls inside itself when the screen is short, so
                the help card below always shows in full. */}
            <div className="sticky top-[120px] flex max-h-[calc(100svh-160px)] flex-col gap-40">
              {toc.length > 1 && (
                <div className="min-h-0 overflow-y-auto [scrollbar-width:thin]">
                  <LegalToc items={toc} label={ui("toc")} />
                </div>
              )}
              <div className="shrink-0">{helpCard}</div>
            </div>
          </aside>

          <article className="flex min-w-0 max-w-[680px] flex-col">
            <p className="flex items-center gap-8 text-p4 text-neutral-5">
              <CalendarDays size={16} aria-hidden="true" className="text-secondary" />
              {t("updated")}
            </p>

            {/* Phones/tablets: contents in a collapsible box. */}
            {toc.length > 1 && (
              <details className="group mt-24 rounded-16 border border-neutral-10 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-20 py-16 text-p3 font-semibold text-neutral-1 [&::-webkit-details-marker]:hidden">
                  {ui("toc")}
                  <span aria-hidden="true" className="text-h5 leading-none text-secondary transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <ol className="flex flex-col gap-2 border-t border-neutral-10 px-20 py-12">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className={cn("block py-6 text-p4 text-neutral-3 hover:text-neutral-1", item.sub && "pl-16")}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            {summary.length > 0 && (
              <div className="mt-32 flex flex-col gap-20 rounded-16 bg-surface-2 p-24 md:p-32">
                <Heading level={2} size="h6">
                  {t.has("summaryHeading") ? t("summaryHeading") : ""}
                </Heading>
                <ul className="flex flex-col gap-14">
                  {summary.map((point, index) => (
                    <li key={index} className="flex items-start gap-12 text-p3 text-neutral-2">
                      <CircleCheck size={20} aria-hidden="true" className="mt-2 shrink-0 text-secondary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-16 flex flex-col">
              {sections.map((section) => {
                const sub = isSubHeading(section.heading);
                return (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-label={section.heading || undefined}
                    className={cn(
                      "flex scroll-mt-[140px] flex-col",
                      sub ? "gap-14 pt-8 pb-24" : "gap-16 border-t border-neutral-10 pt-40 pb-24 first:border-t-0"
                    )}
                  >
                    {section.heading ? (
                      <Heading level={sub ? 3 : 2} size={sub ? "h6" : "h5"}>
                        {section.heading}
                      </Heading>
                    ) : null}
                    <Body body={section.body} />
                  </section>
                );
              })}
            </div>

            <div className="mt-24 flex flex-col gap-32 border-t border-neutral-10 pt-40">
              <div className="lg:hidden">{helpCard}</div>
              {relatedLinks}
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
