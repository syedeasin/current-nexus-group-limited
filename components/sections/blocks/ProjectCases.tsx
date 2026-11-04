import { getLocale } from "next-intl/server";
import Image from "@/components/ui/Picture";
import Reveal from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { BlockSection, TextLink, type BlockProps } from "@/components/sections/blocks/ContentBlocks";
import { getCaseStudyCards } from "@/lib/data/news";
import { entries, num, str } from "@/lib/page-content/read";
import { cascade, stagger } from "@/lib/motion/timing";
import { CARD_IMAGE_ZOOM, CARD_LIFT, CARD_TITLE_TINT } from "@/lib/motion/interactions";
import { cn } from "@/lib/utils";

function splitValues(text: string): string[] {
  return text
    .split(/\s*\/\s*|,\s*|\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Project examples: optional facets (Facility type → Factory · Warehouse …)
 * describing what a project profile covers, then cards for the newest
 * published Case Studies posts (Dashboard → News → Posts) with location,
 * requirements and CNX's supply scope. Real projects only — nothing here is
 * invented copy; with no published cases only the facets and link remain.
 */
export default async function ProjectCases({ data, tone }: BlockProps) {
  const locale = await getLocale();
  const facets = entries(data.facets)
    .map(([id, facet]) => ({ id, label: str(facet, "label"), values: splitValues(str(facet, "values")) }))
    .filter((facet) => facet.label && facet.values.length > 0);
  const cases = await getCaseStudyCards(locale, Math.max(1, Math.min(6, num(data, "count", 3))), str(data, "match").split(","));
  if (facets.length === 0 && cases.length === 0) return null;

  return (
    <BlockSection data={data} tone={tone}>
      {facets.length > 0 ? (
        <Reveal as="div" delay={cascade(2)}>
          <dl className="grid gap-x-32 gap-y-20 rounded-20 border border-neutral-10 bg-white p-24 sm:grid-cols-2 md:p-32 xl:grid-cols-4">
            {facets.map((facet) => (
              <div key={facet.id} className="flex flex-col gap-10">
                <dt className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{facet.label}</dt>
                <dd className="flex flex-wrap gap-8">
                  {facet.values.map((value) => (
                    <span key={value} className="rounded-full bg-surface-2 px-12 py-4 text-p4 font-medium text-neutral-1">
                      {value}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ) : null}

      {cases.length > 0 ? (
        <ul className="grid gap-24 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item, index) => {
            const { details } = item;
            const meta = details.location;
            const requirements = [details.capacity, details.application].filter(Boolean).join(" · ");
            return (
              <Reveal key={item.href} as="li" delay={stagger(index, cascade(3))} className="flex">
                <Link
                  href={item.href}
                  className={cn("group flex w-full flex-col overflow-hidden rounded-16 border border-neutral-10 bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary", CARD_LIFT)}
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-10">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                        className={cn("object-cover", CARD_IMAGE_ZOOM)}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-16 p-24">
                    {meta ? <p className="text-p4 font-medium text-neutral-5">{meta}</p> : null}
                    <h3 className={cn("text-h6 font-semibold text-neutral-1", CARD_TITLE_TINT)}>{item.title}</h3>
                    <dl className="flex flex-col gap-12 border-t border-neutral-10 pt-16">
                      {requirements ? (
                        <div className="flex flex-col gap-2">
                          <dt className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{str(data, "requirementsLabel")}</dt>
                          <dd className="text-p3 text-neutral-2">{requirements}</dd>
                        </div>
                      ) : null}
                      {details.products ? (
                        <div className="flex flex-col gap-2">
                          <dt className="text-p4 font-semibold uppercase tracking-[1px] text-neutral-5">{str(data, "scopeLabel")}</dt>
                          <dd className="text-p3 text-neutral-2">{details.products}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <span className="mt-auto inline-flex items-center gap-8 pt-8 text-p3 font-semibold text-neutral-1 transition-colors group-hover:text-secondary">
                      {str(data, "cardLinkLabel")}
                      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      ) : null}

      <TextLink href={str(data, "linkHref")} label={str(data, "linkLabel")} dark={tone === "dark"} />
    </BlockSection>
  );
}
