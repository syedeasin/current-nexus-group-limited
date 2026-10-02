import NewsIndexPage, { newsSectionMetadata, pageFromSearchParams } from "@/components/sections/news/NewsIndexPage";

export function generateMetadata() {
  return newsSectionMetadata("EVENTS");
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <NewsIndexPage section="EVENTS" page={await pageFromSearchParams(searchParams)} />;
}
