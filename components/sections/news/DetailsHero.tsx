import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import ShareLinks from "@/components/sections/news/ShareLinks";
import { formatDate } from "@/lib/formatDate";
import { HERO_HEADER_OFFSET } from "@/src/layout/headerOffset";
import { cn } from "@/lib/utils";
import type { NewsPost } from "@/lib/data/news";

interface DetailsHeroProps {
  post: NewsPost;
  postUrl: string;
}

export default async function DetailsHero({ post, postUrl }: DetailsHeroProps) {
  const t = await getTranslations("news");

  return (
    <section
      data-hero-sentinel
      className={cn(
        "relative flex min-h-[420px] w-full flex-col justify-end overflow-hidden bg-neutral-1 xl:h-572",
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
        className="absolute inset-0 backdrop-blur-[11px]"
        style={{
          background: "linear-gradient(to bottom, rgba(10,13,27,0) 0%, rgba(10,13,27,0.41) 76.958%, rgba(10,13,27,0.58) 100%)",
        }}
      />

      <Container className="relative z-10 flex flex-col gap-24 py-48 md:py-64 xl:flex-row xl:items-end xl:justify-between xl:gap-40 xl:py-80">
        <div className="flex max-w-900 flex-col gap-8">
          <Reveal as="div" delay={0}>
            <div className="flex items-center gap-12 text-p1 font-medium text-neutral-9">
              {post.category && (
                <>
                  <span>{post.category}</span>
                  <span aria-hidden="true" className="h-12 w-px bg-white/40" />
                </>
              )}
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={1} size="h2" className="text-balance text-white">
              {post.title}
            </Heading>
          </Reveal>
        </div>

        <Reveal as="div" delay={160} className="w-full xl:w-161">
          <ShareLinks
            url={postUrl}
            title={post.title}
            label={t("shareLabel")}
            ariaLabelFor={(network) => t("shareAriaLabel", { network })}
          />
        </Reveal>
      </Container>
    </section>
  );
}
