import type { Metadata } from "next";
import Container from "@/components/layout/Container";

export function generateMetadata(): Metadata {
  return {
    title: "Search",
    description: "Search CNX Energy products, solutions, and news.",
  };
}

// TODO: implement actual search
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Container className="py-40">
      <h1 className="text-h4 font-semibold text-neutral-1">Search results for: {q}</h1>
      <p className="mt-12 text-p2 text-neutral-4">Search functionality coming soon.</p>
    </Container>
  );
}
