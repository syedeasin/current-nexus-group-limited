import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BlogCard from "@/components/ui/BlogCard";
import Carousel from "@/components/ui/Carousel";
import { latestNews } from "@/lib/data/latestNews";

/** Header cascade is eyebrow(0), heading(80) — cards pick up 80ms after that, on first entry only. */
const CARD_REVEAL_BASE_DELAY_MS = 160;
const CARD_REVEAL_STEP_MS = 80;

export default async function LatestNews() {
  const t = await getTranslations("home.latestNews");

  return (
    <section
      aria-label={t("heading")}
      className="w-full bg-white pt-48 pb-40 md:pt-64 md:pb-56 xl:pt-100 xl:pb-80"
    >
      <Container size="section">
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-center">
              {t("heading")}
            </Heading>
          </Reveal>
        </div>
      </Container>

      <div className="mt-48 w-full">
        <Carousel ariaLabel={t("heading")} progressDelay={CARD_REVEAL_BASE_DELAY_MS + latestNews.length * CARD_REVEAL_STEP_MS}>
          {latestNews.map((post, index) => (
            <Reveal
              key={post.slug}
              as="div"
              delay={CARD_REVEAL_BASE_DELAY_MS + index * CARD_REVEAL_STEP_MS}
              className="w-[85vw] shrink-0 [scroll-snap-align:start] min-[481px]:w-[64%] lg:w-[36%] xl:w-[32.1%]"
            >
              <BlogCard
                href="/news"
                image={post.image}
                title={t(`posts.${post.slug}.title`)}
                date={post.date}
                readTime={post.readTime}
                imageSizes="(min-width: 1280px) 32vw, (min-width: 1024px) 36vw, (min-width: 481px) 64vw, 85vw"
              />
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
