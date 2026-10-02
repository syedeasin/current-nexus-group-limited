import { getLocale, getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BlogCard from "@/components/ui/BlogCard";
import Carousel from "@/components/ui/Carousel";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { getLatestPosts, type NewsPost } from "@/lib/data/news";
import { cascade, stagger, CONTENT_BASE_DELAY_MS } from "@/lib/motion/timing";

const LATEST_COUNT = 6;

export default async function LatestNews() {
  const [t, tn, locale] = await Promise.all([
    getTranslations("home.latestNews"),
    getTranslations("news"),
    getLocale(),
  ]);

  // The real, latest published posts (Dashboard → News → Posts). A database
  // outage hides the section rather than failing the homepage.
  let posts: NewsPost[] = [];
  try {
    posts = await getLatestPosts(locale, LATEST_COUNT);
  } catch (error) {
    console.error("[home] latest news query failed", error);
  }
  if (posts.length === 0) return null;

  return (
    <section
      aria-label={t("heading")}
      className="w-full bg-white pt-48 pb-40 md:pt-64 md:pb-56 xl:pt-100 xl:pb-80"
    >
      <Container>
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
      </Container>

      <Container className="mt-48 flex flex-col items-center gap-24">
        <Carousel
          ariaLabel={t("heading")}
          progressDelay={stagger(posts.length, CONTENT_BASE_DELAY_MS)}
          progressVariant="segments"
          segmentCount={posts.length}
        >
          {posts.map((post, index) => (
            <Reveal
              key={post.slug}
              as="div"
              delay={stagger(index, CONTENT_BASE_DELAY_MS)}
              className="w-[85vw] shrink-0 [scroll-snap-align:start] min-[481px]:w-[64%] lg:w-[36%] xl:w-[32.1%]"
            >
              <BlogCard
                href={`/news/${post.slug}`}
                image={post.coverImage}
                imageAlt={post.coverImageAlt}
                title={post.title}
                date={post.publishedAt}
                readTime={post.readingMinutes > 0 ? tn("minRead", { count: post.readingMinutes }) : undefined}
                imageSizes="(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, (min-width: 481px) 64vw, 85vw"
              />
            </Reveal>
          ))}
        </Carousel>

        {/* Figma node 4199-9973: View All is the site's own solid/lg/secondary
            Button component, centered under the cards — not a text link above
            them (that was this section's first pass, before this reference). */}
        <Reveal as="div">
          <Button href="/news" size="lg">
            {t("viewAll")}
            <ChevronRight size={BUTTON_ICON_SIZE} />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
