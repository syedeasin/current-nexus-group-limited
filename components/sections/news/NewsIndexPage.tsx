import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Banner from "@/components/sections/news/Banner";
import Highlights from "@/components/sections/news/Highlights";
import AllNews from "@/components/sections/news/AllNews";
import { NEWS_SECTIONS } from "@/lib/news-sections";
import type { PostSection } from "@prisma/client";

/**
 * One News Room index (News, RE Analysis, Knowledge Database, Events). The
 * four routes share this design exactly — banner, highlights carousel,
 * paginated grid — and differ only in which posts they list and in their
 * banner/heading copy (messages `news.sections.<key>`, editable under
 * Dashboard → Pages → News Room).
 */
export async function newsSectionMetadata(section: PostSection): Promise<Metadata> {
  const t = await getTranslations(`news.sections.${NEWS_SECTIONS[section].messageKey}.meta`);
  return { title: t("title"), description: t("description") };
}

export default function NewsIndexPage({ section, page }: { section: PostSection; page: number }) {
  const def = NEWS_SECTIONS[section];
  return (
    <>
      <Banner messageKey={def.messageKey} />
      <Highlights section={def} />
      <AllNews page={page} section={def} />
    </>
  );
}

/** `?page=` → a positive integer page number. */
export async function pageFromSearchParams(searchParams: Promise<{ page?: string }>): Promise<number> {
  const { page } = await searchParams;
  return Math.max(1, Number(page) || 1);
}
