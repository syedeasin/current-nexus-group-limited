import type { Metadata } from "next";
import Banner from "@/components/sections/news/Banner";
import Highlights from "@/components/sections/news/Highlights";
import AllNews from "@/components/sections/news/AllNews";
import { siteConfig } from "@/site.config";

export function generateMetadata(): Metadata {
  return {
    title: "News room",
    description: `Latest news and industry insights from ${siteConfig.name}.`,
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <main>
      <Banner />
      <Highlights />
      <AllNews page={page} />
    </main>
  );
}
