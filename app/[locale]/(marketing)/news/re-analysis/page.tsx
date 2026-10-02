import NewsIndexPage, { newsSectionMetadata, pageFromSearchParams } from "@/components/sections/news/NewsIndexPage";

export function generateMetadata() {
  return newsSectionMetadata("RE_ANALYSIS");
}

export default async function ReAnalysisPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsIndexPage section="RE_ANALYSIS" page={await pageFromSearchParams(searchParams)} />;
}
