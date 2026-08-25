import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import BlogCard from "@/components/ui/BlogCard";
import Pagination from "@/components/sections/news/Pagination";
import { getPosts } from "@/lib/data/news";

export const PER_PAGE = 6;

const CARD_BASE_DELAY_MS = 80;
const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

interface AllNewsProps {
  page: number;
}

export default async function AllNews({ page }: AllNewsProps) {
  const t = await getTranslations("news");
  const { posts, totalPages } = await getPosts(page, PER_PAGE);
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return (
    <section aria-label={t("allNewsHeading")} className="w-full bg-surface-2 py-48 md:py-64 xl:py-100">
      <Container className="flex flex-col items-center gap-48">
        <Reveal as="div" className="w-full">
          <Heading level={2} size="h2">
            {t("allNewsHeading")}
          </Heading>
        </Reveal>

        <div className="grid w-full grid-cols-1 gap-x-24 gap-y-40 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => {
            const delay = CARD_BASE_DELAY_MS + Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal key={post.slug} as="div" delay={delay}>
                <BlogCard
                  href={`/news/${post.slug}`}
                  image={post.coverImage}
                  title={post.title}
                  date={post.publishedAt}
                  readTime={t("minRead", { count: post.readingMinutes })}
                  imageSizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </Reveal>
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/news"
          ariaLabel={t("paginationLabel")}
          previousLabel={t("previousPage")}
          nextLabel={t("nextPage")}
        />
      </Container>
    </section>
  );
}
