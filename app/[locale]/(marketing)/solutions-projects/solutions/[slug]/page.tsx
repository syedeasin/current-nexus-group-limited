import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionMenuGroup } from "@prisma/client";
import SolutionsProjectTemplate from "@/components/solutions-projects/SolutionsProjectTemplate";
import { getPublishedSolutionPage } from "@/lib/data/solutions-projects";

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, SolutionMenuGroup.SOLUTIONS);
  if (!page) return {};
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  };
}

export default async function SolutionsSlugPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, SolutionMenuGroup.SOLUTIONS);
  if (!page) notFound();

  return <SolutionsProjectTemplate content={page.content} />;
}
