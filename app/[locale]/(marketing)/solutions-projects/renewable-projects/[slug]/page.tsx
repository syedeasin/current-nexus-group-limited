import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionMenuGroup } from "@prisma/client";
import SolutionsProjectTemplate from "@/components/solutions-projects/SolutionsProjectTemplate";
import { getPublishedSolutionPage } from "@/lib/data/solutions-projects";
import { buildSolutionMetadata, NOT_FOUND_METADATA } from "@/lib/solutions-projects/metadata";

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, SolutionMenuGroup.RENEWABLE_PROJECTS);
  if (!page) return NOT_FOUND_METADATA;
  return buildSolutionMetadata(page, SolutionMenuGroup.RENEWABLE_PROJECTS, locale);
}

export default async function RenewableProjectsSlugPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, SolutionMenuGroup.RENEWABLE_PROJECTS);
  if (!page) notFound();

  return <SolutionsProjectTemplate content={page.content} />;
}
