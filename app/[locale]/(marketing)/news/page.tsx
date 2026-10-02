import NewsIndexPage, { newsSectionMetadata, pageFromSearchParams } from "@/components/sections/news/NewsIndexPage";

export function generateMetadata() {
  return newsSectionMetadata("NEWS");
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsIndexPage section="NEWS" page={await pageFromSearchParams(searchParams)} />;
}
