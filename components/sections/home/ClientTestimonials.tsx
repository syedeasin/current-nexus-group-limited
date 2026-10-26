import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { cascade } from "@/lib/motion/timing";
import { getCaseStudyHighlight, type CaseStudyHighlight } from "@/lib/data/news";

const CARD_DELAY_MS = cascade(2);
/** The photo scales in first; its copy follows once that move has settled. */
const CONTENT_BASE_DELAY_MS = CARD_DELAY_MS + 200;
const CONTENT_STEP_MS = 80;

/**
 * Homepage → Client success story. Shows a real case study from News → Case
 * Studies (the slug set in Pages → Homepage, else the newest one): its quote,
 * facts and results, with "View Case Study" opening that case. The Pages copy
 * (logo, quote, client, location, capacity) fills in when no case is
 * published yet; with no case the button is left out.
 */
export default async function ClientTestimonials() {
  const t = await getTranslations("home.testimonials");
  let highlight: CaseStudyHighlight | null = null;
  try {
    highlight = await getCaseStudyHighlight(await getLocale(), t("caseSlug").trim() || undefined);
  } catch (error) {
    console.error("[testimonials] case study lookup failed", error);
  }
  const details = highlight?.details;
  const setHref = t("ctaHref").trim();
  const href = (setHref && setHref !== "/projects" ? setHref : "") || highlight?.href || "";

  const quote = details?.quote || t("quote").replace(/^"|"$/g, "");
  const author = details?.quoteAuthor ?? "";
  const role = details?.quoteRole ?? "";
  const facts = [
    { label: t("clientLabel"), value: details?.client || t("clientName") },
    { label: t("locationLabel"), value: details?.location || t("location") },
    { label: t("capacityLabel"), value: details?.capacity || t("capacity") },
  ].filter((fact) => fact.value);
  const stats = (details?.stats ?? []).filter((stat) => stat.value && stat.label);
  const photo = t("photo") || highlight?.coverImage || "";

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-center">
              {t("heading")}
            </Heading>
          </TextReveal>
        </div>

        <Reveal as="div" variant="fade" delay={CARD_DELAY_MS} className="relative w-full overflow-hidden rounded-24 bg-neutral-1">
          {photo && (
            <ImageReveal delay={CARD_DELAY_MS} className="absolute inset-0">
              <Image
                src={photo}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1280px) 1320px, 100vw"
                className="object-cover"
                style={{ objectPosition: "center 45%" }}
              />
            </ImageReveal>
          )}
          {/* Dark on the copy side (left, or bottom on phones), photo clear on the right. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,27,0.55)_0%,rgba(10,13,27,0.92)_55%)] lg:bg-[linear-gradient(90deg,rgba(10,13,27,0.95)_0%,rgba(10,13,27,0.85)_40%,rgba(10,13,27,0.35)_75%,rgba(10,13,27,0.15)_100%)]"
          />

          <div className="relative grid gap-40 p-24 min-[480px]:p-32 lg:min-h-600 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-64 lg:p-48 xl:p-64">
            {/* Story: client, quote, button — kept to a readable width. */}
            <Reveal variant="fade" delay={CONTENT_BASE_DELAY_MS} as="div" className="flex max-w-[620px] flex-col gap-32 self-stretch lg:justify-between">
              <div className="flex items-center gap-12">
                {t("logo") ? (
                  <Image src={t("logo")} alt="" aria-hidden="true" width={48} height={47} className="h-32 w-auto lg:h-40" />
                ) : null}
                <span className="text-[24px] font-semibold leading-[32px] tracking-[-0.48px] text-white lg:text-[30px] lg:leading-[40px]">
                  {t("clientWordmark")}
                </span>
              </div>

              <figure className="flex flex-col gap-20">
                <Quote size={32} strokeWidth={1.5} aria-hidden="true" className="text-secondary" />
                <blockquote className="m-0">
                  <p className="text-h6 font-medium text-white lg:text-h5">{quote}</p>
                </blockquote>
                {(author || role) && (
                  <figcaption className="flex flex-col gap-2">
                    {author && <span className="text-p3 font-semibold text-white">{author}</span>}
                    {role && <span className="text-p4 text-neutral-8">{role}</span>}
                  </figcaption>
                )}
              </figure>

              {href ? (
                <Button href={href} size="lg" className="w-full min-[481px]:w-fit">
                  {t("cta")}
                  <ChevronRight size={BUTTON_ICON_SIZE} boxed />
                </Button>
              ) : null}
            </Reveal>

            {/* Project facts and results on a glass panel. */}
            {(facts.length > 0 || stats.length > 0) && (
              <Reveal
                variant="fade"
                delay={CONTENT_BASE_DELAY_MS + CONTENT_STEP_MS}
                as="div"
                className="flex flex-col gap-24 rounded-20 border border-white/15 bg-white/8 p-24 backdrop-blur-md"
              >
                {facts.length > 0 && (
                  <dl className="flex flex-col gap-16">
                    {facts.map((fact) => (
                      <div key={fact.label} className="flex flex-col gap-2">
                        <dt className="text-p4 text-neutral-8">{fact.label}</dt>
                        <dd className="text-p3 font-semibold text-white">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {stats.length > 0 && (
                  <dl className="grid grid-cols-3 gap-12 border-t border-white/15 pt-20 lg:grid-cols-1 lg:gap-16">
                    {stats.map((stat) => (
                      <div key={stat.label} className="flex flex-col gap-4">
                        <dt className="order-2 text-p4 text-neutral-8">{stat.label}</dt>
                        <dd className="order-1 text-h5 font-semibold text-secondary lg:text-h4">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Reveal>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
