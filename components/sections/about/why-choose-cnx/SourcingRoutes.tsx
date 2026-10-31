import { createElement } from "react";
import Image from "@/components/ui/Picture";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { pageIcon } from "@/lib/page-content/icons";
import { bool, entries, str } from "@/lib/page-content/read";
import { cascade, stagger } from "@/lib/motion/timing";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * About Us → "One Partner. Multiple Sourcing Routes." (client brief, revision
 * 1022). Three standard routes read as one open row divided by hairlines (no
 * boxes); the Featured route — Revamping, the business the client wants to
 * stand out — gets its own band with a photo underneath.
 */
export default async function SourcingRoutes() {
  const t = await getTranslations("about.whyChooseCnx.sourcingRoutes");
  const cards = entries(t.raw("cards" as never)).map(([id, card], index) => ({
    id,
    number: pad(index + 1),
    icon: str(card, "icon"),
    title: str(card, "title"),
    body: str(card, "body"),
    featured: bool(card, "featured"),
    featuredLabel: str(card, "featuredLabel"),
    image: str(card, "image"),
    imageAlt: str(card, "imageAlt"),
    linkLabel: str(card, "linkLabel"),
    linkHref: str(card, "linkHref"),
  }));
  const routes = cards.filter((card) => !card.featured);
  const featured = cards.find((card) => card.featured);

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
        {/* Header: title left; the promise line, intro and buttons right. */}
        <div className="grid gap-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-80">
          <div className="flex flex-col gap-12">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} tone="dark" />
            </Reveal>
            <Heading level={2} size="h2" className="text-balance text-white">
              {t("heading")}
            </Heading>
          </div>
          <Reveal as="div" delay={cascade(1)} className="flex flex-col gap-24 lg:pt-36">
            <div className="flex flex-col gap-12">
              <p className="text-p2 font-medium text-white">{t("subheading")}</p>
              <Text size="p3" className="text-neutral-7">
                {t("body")}
              </Text>
            </div>
            <div className="flex w-full flex-col gap-12 min-[481px]:flex-row min-[481px]:flex-wrap">
              <Button href={t("primaryCtaHref")} size="lg" className="w-full justify-center min-[481px]:w-fit">
                {t("primaryCta")}
                <ArrowRight size={BUTTON_ICON_SIZE} />
              </Button>
              {t("secondaryCta") && (
                <Button href={t("secondaryCtaHref")} size="lg" variant="secondary" className="w-full justify-center min-[481px]:w-fit">
                  {t("secondaryCta")}
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-40 md:gap-56">
          {/* Standard routes: one open row, hairline dividers, no boxes. */}
          <ul className="grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
            {routes.map((route, index) => (
              <Reveal
                key={route.id}
                as="li"
                delay={stagger(index, cascade(2))}
                className="flex flex-col border-b border-white/10 py-28 md:border-b-0 md:py-40 md:pr-32 md:not-first:border-l md:not-first:pl-32 xl:pr-48 xl:not-first:pl-48"
              >
                {/* Icon row stands apart (32/40); title and body sit close (8) as one block. */}
                <div className="flex items-center justify-between">
                  {createElement(pageIcon(route.icon), { size: 28, strokeWidth: 1.5, className: "text-secondary", "aria-hidden": true })}
                  <span className="text-p4 font-medium tabular-nums text-neutral-6">{route.number}</span>
                </div>
                <h3 className="mt-32 text-h5 font-semibold text-white md:mt-40">{route.title}</h3>
                <p className="mt-8 max-w-[300px] text-balance text-p3 text-neutral-7">{route.body}</p>
              </Reveal>
            ))}
          </ul>

          {/* Featured route: its own band, photo beside the copy. */}
          {featured && (
            <Reveal
              as="div"
              delay={cascade(3)}
              className="grid overflow-hidden rounded-24 border border-white/10 bg-[linear-gradient(120deg,rgba(213,172,93,0.14),rgba(213,172,93,0.02)_60%)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
            >
              {featured.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={featured.image}
                    alt={featured.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="scale-[1.08] object-cover"
                  />
                </div>
              )}
              {/* Label → (24) title → (12) body → (32) link: title and body read as
                  one block; the label and link get their own room. */}
              <div className="flex flex-col justify-center p-24 sm:p-40 xl:p-64">
                <div className="flex items-center gap-12">
                  <span aria-hidden="true" className="flex size-40 items-center justify-center rounded-12 bg-secondary text-neutral-1">
                    {createElement(pageIcon(featured.icon), { size: 20, strokeWidth: 1.5 })}
                  </span>
                  <span className="text-p4 font-semibold uppercase tracking-[1px] text-secondary">
                    {featured.featuredLabel || featured.number}
                  </span>
                </div>
                <h3 className="mt-24 max-w-[440px] text-balance text-h4 font-semibold text-white">{featured.title}</h3>
                <p className="mt-12 max-w-[460px] text-p3 text-neutral-8">{featured.body}</p>
                {featured.linkLabel && featured.linkHref && (
                  <Link
                    href={featured.linkHref}
                    className="group mt-32 inline-block w-fit text-p3 font-semibold text-secondary underline decoration-secondary/50 decoration-2 underline-offset-6 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
                  >
                    {featured.linkLabel}
                    <ArrowRight size={16} className="ml-6 inline-block align-[-2px] transition-transform duration-200 group-hover:translate-x-2 motion-reduce:transition-none" />
                  </Link>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
