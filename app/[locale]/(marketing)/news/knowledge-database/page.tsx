import NewsIndexPage, { newsSectionMetadata, pageFromSearchParams } from "@/components/sections/news/NewsIndexPage";

export function generateMetadata() {
  return newsSectionMetadata("KNOWLEDGE_DATABASE");
}

export default async function KnowledgeDatabasePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsIndexPage section="KNOWLEDGE_DATABASE" page={await pageFromSearchParams(searchParams)} />;
}
