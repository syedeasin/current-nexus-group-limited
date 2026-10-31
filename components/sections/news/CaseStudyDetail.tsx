import Image from "@/components/ui/Picture";
import { getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BlogCard from "@/components/ui/BlogCard";
import ShareLinks from "@/components/sections/news/ShareLinks";
import ProjectInquiryCard from "@/components/sections/shared/ProjectInquiryCard";
import CtaBand from "@/components/sections/shared/CtaBand";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { caseFacts, type CaseStudyDetails } from "@/lib/case-study";
import { postDateLabel } from "@/lib/formatDate";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { cascade, stagger } from "@/lib/motion/timing";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";
import type { NewsPost } from "@/lib/data/news";

interface CaseStudyDetailProps {
  post: NewsPost;
  details: CaseStudyDetails;
  postUrl: string;
  related: NewsPost[];
}

/**
 * Case Studies post page (revision 1022): a clear photo hero, the project
 * facts bar, the story (dashboard Content) beside a sticky inquiry card, the
 * results band, the client quote, more cases and the site CTA. Facts, results
 * and quote come from Dashboard → Posts → "Case study details".
 */
export default async function CaseStudyDetail({ post, details, postUrl, related }: CaseStudyDetailProps) {
  const [t, news] = await Promise.all([getTranslations("news.caseStudy"), getTranslations("news")]);
  const facts = caseFacts(details);
  const stats = details.stats.filter((stat) => stat.value && stat.label);

  return (
    <>
      {/* ── Hero: photo stays visible; only the lower part is darkened for the copy. ── */}
      <section
        data-hero-sentinel
        className={cn(
          "relative flex min-h-[560px] w-full flex-col justify-end overflow-hidden bg-neutral-1 md:min-h-[620px] xl:min-h-[700px]",
          HERO_HEADER_OFFSET
        )}
      >
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            aria-hidden={post.coverImageAlt ? undefined : true}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,13,27,1)_0%,rgba(10,13,27,1)_45%,rgba(10,13,27,0)_100%)]"
        />
        <Container className="relative z-10 flex flex-col gap-32 pt-120 pb-120 md:pb-136 xl:flex-row xl:items-end xl:justify-between xl:pb-160">
          <div className="flex max-w-[920px] flex-col gap-16">
            <Reveal as="div" delay={cascade(0)}>
              <p className="flex flex-wrap items-center gap-x-12 gap-y-4 text-p4 font-semibold uppercase tracking-[1px] text-secondary">
                <span>{t("eyebrow")}</span>
                {details.location && (
                  <>
                    <span aria-hidden="true" className="h-12 w-px bg-white/40" />
                    <span className="text-white/80">{details.location}</span>
                  </>
                )}
              </p>
            </Reveal>
            <TextReveal delay={cascade(1)}>
              <Heading level={1} size="h2" className="max-w-[900px] text-balance text-white">
                {post.title}
              </Heading>
            </TextReveal>
            {post.excerpt && (
              <Reveal as="div" delay={cascade(2)}>
                <Text size="p2" className="max-w-[620px] text-white/85">
                  {post.excerpt}
                </Text>
              </Reveal>
            )}
          </div>
          <Reveal as="div" delay={cascade(3)} className="w-full xl:w-161">
            <ShareLinks
              url={postUrl}
              title={post.title}
              label={news("shareLabel")}
              ariaLabelFor={(network) => news("shareAriaLabel", { network })}
            />
          </Reveal>
        </Container>
      </section>

      {/* ── Facts bar, overlapping the hero's foot. ── */}
      {facts.length > 0 && (
        <div className="relative z-10 w-full">
          <Container>
            <Reveal as="div" delay={cascade(1)} className="-mt-72 md:-mt-88 xl:-mt-96">
              <dl className="grid grid-cols-2 gap-x-24 gap-y-28 rounded-24 bg-white p-24 shadow-[0_24px_64px_rgba(10,13,27,0.10)] md:grid-cols-3 md:p-32 xl:grid-cols-6 xl:gap-0 xl:p-40">
                {facts.map((fact, index) => (
                  <div
                    key={fact.key}
                    className={cn("flex min-w-0 flex-col gap-6", "xl:px-24 xl:first:pl-0 xl:last:pr-0", index > 0 && "xl:border-l xl:border-neutral-10")}
                  >
                    <dt className="text-p4 text-neutral-5">{t(`facts.${fact.key}` as never)}</dt>
                    <dd className="text-pretty text-p3 font-semibold text-neutral-1">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        </div>
      )}

      {/* ── Story (dashboard Content) beside a sticky inquiry card. ── */}
      <section className="w-full bg-white pt-64 pb-64 md:pt-80 md:pb-80 xl:pt-100 xl:pb-120">
        <Container className="grid gap-48 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-64 xl:gap-96">
          <article className="min-w-0">
            <Reveal as="div" delay={cascade(0)} className="mb-24">
              <SectionEyebrow label={t("storyEyebrow")} />
            </Reveal>
            <div
              className="prose-content w-full max-w-[760px]"
              dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }}
            />
            <p className="mt-32 text-p4 text-neutral-5">{postDateLabel(post)}</p>
          </article>
          <aside className="lg:sticky lg:top-120 lg:self-start">
            <ProjectInquiryCard />
          </aside>
        </Container>
      </section>

      {/* ── Results ── */}
      {stats.length > 0 && (
        <section aria-label={t("resultsHeading")} className="w-full bg-neutral-1">
          <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
            <div className="flex flex-col gap-12">
              <SectionEyebrow label={t("resultsEyebrow")} tone="dark" />
              <Heading level={2} size="h2" className="text-balance text-white">
                {t("resultsHeading")}
              </Heading>
            </div>
            <dl className="grid grid-cols-1 border-t border-white/10 md:grid-cols-3">
              {stats.map((stat, index) => (
                <Reveal
                  key={stat.label}
                  as="div"
                  delay={stagger(index, cascade(1))}
                  className="flex flex-col gap-8 border-b border-white/10 py-28 md:border-b-0 md:py-40 md:pr-32 md:not-first:border-l md:not-first:pl-32"
                >
                  <dd className="order-1 text-[48px] font-semibold leading-none tracking-[-1.5px] text-secondary md:text-[64px]">
                    {stat.value}
                  </dd>
                  <dt className="order-2 text-p3 text-neutral-8">{stat.label}</dt>
                </Reveal>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* ── Client quote ── */}
      {details.quote && (
        <section className="w-full bg-surface-2">
          <Container className="py-64 md:py-80 xl:py-120">
            <Reveal as="div" delay={cascade(0)}>
              <figure className="mx-auto flex max-w-[880px] flex-col items-center gap-28 text-center">
                <Quote size={40} strokeWidth={1.5} aria-hidden="true" className="text-secondary" />
                <blockquote className="text-balance text-h4 font-medium text-neutral-1">“{details.quote}”</blockquote>
                {(details.quoteAuthor || details.quoteRole) && (
                  <figcaption className="flex flex-col gap-4">
                    {details.quoteAuthor && <span className="text-p3 font-semibold text-neutral-1">{details.quoteAuthor}</span>}
                    {details.quoteRole && <span className="text-p4 text-neutral-5">{details.quoteRole}</span>}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          </Container>
        </section>
      )}

      {/* ── More case studies ── */}
      {related.length > 0 && (
        <section aria-label={t("moreHeading")} className="w-full bg-white">
          <Container className="flex flex-col gap-48 py-64 md:py-80 xl:py-120">
            <div className="flex flex-col items-start justify-between gap-16 md:flex-row md:items-end">
              <Heading level={2} size="h2">
                {t("moreHeading")}
              </Heading>
              <Link
                href={t("viewAllHref")}
                className="group inline-block text-p3 font-semibold text-neutral-1 underline decoration-secondary decoration-2 underline-offset-6 hover:text-secondary"
              >
                {t("viewAll")}
                <ArrowRight size={16} className="ml-6 inline-block align-[-2px] transition-transform duration-200 group-hover:translate-x-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-24 gap-y-40 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard
                  key={item.slug}
                  href={`/news/${item.slug}`}
                  image={item.coverImage}
                  imageAlt={item.coverImageAlt}
                  title={item.title}
                  date={item.publishedAt}
                  dateLabel={postDateLabel(item)}
                  imageSizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand />
    </>
  );
}
