import { getTranslations } from "next-intl/server";
import Reveal from "@/components/ui/Reveal";
import NewsCarousel from "@/components/sections/news/NewsCarousel";
import HighlightCard from "@/components/sections/news/HighlightCard";
import { getHighlightPosts } from "@/lib/data/news";

const CARD_BASE_DELAY_MS = 160;
const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default async function Highlights() {
  const t = await getTranslations("news");
  const posts = await getHighlightPosts();

  return (
    <section aria-label={t("highlightsHeading")} className="w-full bg-white py-48 md:py-64 xl:py-100">
      <NewsCarousel
        heading={t("highlightsHeading")}
        previousLabel={t("previousHighlight")}
        nextLabel={t("nextHighlight")}
      >
        {posts.map((post, index) => {
          const delay = CARD_BASE_DELAY_MS + Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
          return (
            <Reveal
              key={post.slug}
              as="div"
              delay={delay}
              className="w-[85vw] shrink-0 [scroll-snap-align:start] min-[600px]:w-[64%] lg:w-648"
            >
              <HighlightCard post={post} readingMinutesLabel={t("minRead", { count: post.readingMinutes })} />
            </Reveal>
          );
        })}
      </NewsCarousel>
    </section>
  );
}
