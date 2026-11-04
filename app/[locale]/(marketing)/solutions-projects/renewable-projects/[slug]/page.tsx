import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SolutionMenuGroup } from "@prisma/client";
import SolutionsProjectTemplate from "@/components/solutions-projects/SolutionsProjectTemplate";
import BlockPage from "@/components/sections/blocks/BlockPage";
import { solutionEntryHref } from "@/config/nav.config";
import { blockPageForSlug } from "@/lib/block-pages/config";
import { blockPageMetadata } from "@/lib/block-pages/metadata";
import { findPublishedSolutionAlias, getPublishedSolutionPage } from "@/lib/data/solutions-projects";
import { buildSolutionMetadata, NOT_FOUND_METADATA } from "@/lib/solutions-projects/metadata";

interface RouteParams {
  params: Promise<{ locale: string; slug: string }>;
}

const GROUP = SolutionMenuGroup.RENEWABLE_PROJECTS;

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, GROUP);
  if (!page) return NOT_FOUND_METADATA;
  const blocks = blockPageForSlug(GROUP, slug);
  if (blocks) return blockPageMetadata(blocks, locale, solutionEntryHref(GROUP, page.slug));
  return buildSolutionMetadata(page, GROUP, locale);
}

/**
 * A published Renewable Projects page. Pages with content-block copy (Dashboard → Pages,
 * lib/block-pages/config.ts — matched by the slug's first word) render those
 * blocks; any other published page keeps the page-builder template.
 */
export default async function RenewableProjectsSlugPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const page = await getPublishedSolutionPage(slug, locale, GROUP);
  if (!page) {
    // Menu-style address ("residential") of a page published under a longer slug.
    const alias = await findPublishedSolutionAlias(slug, locale, GROUP);
    if (alias) permanentRedirect(`/${locale}${solutionEntryHref(GROUP, alias)}`);
    notFound();
  }

  const blocks = blockPageForSlug(GROUP, slug);
  if (blocks) return <BlockPage pageKey={blocks.key} />;
  return <SolutionsProjectTemplate content={page.content} />;
}
