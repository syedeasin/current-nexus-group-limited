import NewsIndexPage, { newsSectionMetadata, pageFromSearchParams } from "@/components/sections/news/NewsIndexPage";

export function generateMetadata() {
  return newsSectionMetadata("CASE_STUDIES");
}

export default async function CaseStudiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsIndexPage section="CASE_STUDIES" page={await pageFromSearchParams(searchParams)} />;
}
