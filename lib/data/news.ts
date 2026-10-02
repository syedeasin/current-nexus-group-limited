import { Prisma, PostStatus, PostSection, type Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Public news data access. Every news component and the [slug] route read
 * posts only through the functions below, never Prisma directly, so the
 * query layer stays swappable and every public query enforces the same
 * two invariants:
 *
 *  - Only PUBLISHED posts are ever returned. A draft/pending/archived post
 *    404s on the public site even if its slug is known.
 *  - Every list/detail query is locale-scoped. The route segment gives a
 *    lowercase locale ("en" | "fr"); it is mapped to the Prisma `Locale`
 *    enum ("EN" | "FR") here. An unknown locale yields empty results.
 *
 * `content` is a sanitised HTML string (written by the dashboard editor in
 * Phase D2B). The old NewsBlock[] renderer has been retired — see
 * app/[locale]/(marketing)/news/[slug]/page.tsx.
 *
 * Every list query is also scoped to one News Room section (News, RE
 * Analysis, Knowledge Database, Events — lib/news-sections.ts). The reserved
 * slugs "re-analysis", "knowledge-database" and "events" belong to those
 * section index routes; lib/validation/post.ts rejects them for posts.
 */
export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Category name, or "" when the post has no category. */
  category: string;
  /** Featured image path, or null when none is set. */
  coverImage: string | null;
  coverImageAlt: string;
  /** ISO date string. Falls back to createdAt when publishedAt is null. */
  publishedAt: string;
  /** ISO date string — used for JSON-LD dateModified. */
  updatedAt: string;
  readingMinutes: number;
  /** Which News Room listing the post belongs to. */
  section: PostSection;
  /** Editor-picked for its section's Highlights carousel. */
  isHighlight: boolean;
  /** Sanitised HTML. Empty string for list items (content is not fetched for lists). */
  content: string;
  /** Author display name. "" for list items (not fetched for lists). */
  authorName: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
}

/** Upper bound on the Highlights carousel. */
const HIGHLIGHT_LIMIT = 9;
/** When no post in a section is picked as a highlight, show this many of the latest instead. */
const HIGHLIGHT_FALLBACK_COUNT = 4;

const PUBLISHED_ORDER = [
  { publishedAt: "desc" as const },
  { createdAt: "desc" as const },
];

function toPrismaLocale(locale: string): Locale | null {
  const upper = locale.toUpperCase();
  return upper === "EN" || upper === "FR" ? (upper as Locale) : null;
}

const listSelect = {
  slug: true,
  title: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  readingTime: true,
  section: true,
  isHighlight: true,
  category: { select: { name: true } },
} satisfies Prisma.PostSelect;

const detailInclude = {
  category: { select: { name: true } },
  author: { select: { name: true } },
} satisfies Prisma.PostInclude;

type ListRow = Prisma.PostGetPayload<{ select: typeof listSelect }>;
type DetailRow = Prisma.PostGetPayload<{ include: typeof detailInclude }>;

function mapListRow(row: ListRow): NewsPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category?.name ?? "",
    coverImage: row.featuredImage ?? null,
    coverImageAlt: row.featuredImageAlt ?? "",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    readingMinutes: row.readingTime,
    section: row.section,
    isHighlight: row.isHighlight,
    content: "",
    authorName: "",
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    ogImage: null,
    noIndex: false,
  };
}

function mapDetailRow(row: DetailRow): NewsPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category?.name ?? "",
    coverImage: row.featuredImage ?? null,
    coverImageAlt: row.featuredImageAlt ?? "",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    readingMinutes: row.readingTime,
    section: row.section,
    isHighlight: row.isHighlight,
    content: row.content,
    authorName: row.author.name,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
  };
}

/**
 * Posts for a section's Highlights carousel: the ones an editor ticked
 * "Show in Highlights" on (Dashboard → Posts → edit), newest first. If none
 * are ticked yet the carousel falls back to the latest few, so it is never
 * empty on a section that has posts.
 */
export async function getHighlightPosts(
  locale: string,
  section: PostSection = PostSection.NEWS
): Promise<NewsPost[]> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return [];

  const where = { status: PostStatus.PUBLISHED, locale: prismaLocale, section };
  const picked = await prisma.post.findMany({
    where: { ...where, isHighlight: true },
    orderBy: PUBLISHED_ORDER,
    take: HIGHLIGHT_LIMIT,
    select: listSelect,
  });
  if (picked.length > 0) return picked.map(mapListRow);

  const latest = await prisma.post.findMany({
    where,
    orderBy: PUBLISHED_ORDER,
    take: HIGHLIGHT_FALLBACK_COUNT,
    select: listSelect,
  });
  return latest.map(mapListRow);
}

/** Latest published posts across every section — the homepage "Latest news" carousel. */
export async function getLatestPosts(locale: string, take: number): Promise<NewsPost[]> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return [];

  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, locale: prismaLocale },
    orderBy: PUBLISHED_ORDER,
    take,
    select: listSelect,
  });
  return rows.map(mapListRow);
}

/** Paginated published-post list for a section index. */
export async function getPosts(
  locale: string,
  page: number,
  perPage: number,
  section: PostSection = PostSection.NEWS
): Promise<{ posts: NewsPost[]; total: number; totalPages: number }> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return { posts: [], total: 0, totalPages: 1 };

  const where = { status: PostStatus.PUBLISHED, locale: prismaLocale, section };
  const total = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const rows = await prisma.post.findMany({
    where,
    orderBy: PUBLISHED_ORDER,
    skip: (safePage - 1) * perPage,
    take: perPage,
    select: listSelect,
  });
  return { posts: rows.map(mapListRow), total, totalPages };
}

/** Full published post for the detail page. Returns null so the page can notFound(). */
export async function getPostBySlug(
  slug: string,
  locale: string
): Promise<NewsPost | null> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return null;

  const row = await prisma.post.findFirst({
    where: { slug, locale: prismaLocale, status: PostStatus.PUBLISHED },
    include: detailInclude,
  });
  return row ? mapDetailRow(row) : null;
}

/**
 * Previous (newer) and next (older) published post in the same locale and
 * News Room section, ordered by publishedAt, for the prev/next navigation on
 * the detail page.
 */
export async function getAdjacentPosts(
  slug: string,
  locale: string
): Promise<{ prev: NewsPost | null; next: NewsPost | null }> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return { prev: null, next: null };

  const current = await prisma.post.findFirst({
    where: { slug, locale: prismaLocale, status: PostStatus.PUBLISHED },
    select: { publishedAt: true, createdAt: true, section: true },
  });
  if (!current) return { prev: null, next: null };

  const pivot = current.publishedAt ?? current.createdAt;
  const base = {
    status: PostStatus.PUBLISHED,
    locale: prismaLocale,
    section: current.section,
    slug: { not: slug },
  };

  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { ...base, publishedAt: { gt: pivot } },
      orderBy: { publishedAt: "asc" },
      select: listSelect,
    }),
    prisma.post.findFirst({
      where: { ...base, publishedAt: { lt: pivot } },
      orderBy: { publishedAt: "desc" },
      select: listSelect,
    }),
  ]);

  return {
    prev: prev ? mapListRow(prev) : null,
    next: next ? mapListRow(next) : null,
  };
}

/**
 * Every published post as a { locale, slug } pair, for generateStaticParams
 * on the [locale]/news/[slug] route. `locale` is lowercased to match the
 * route segment.
 */
export async function getAllSlugs(): Promise<{ locale: string; slug: string }[]> {
  try {
    const rows = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      select: { slug: true, locale: true },
    });
    return rows.map((row) => ({ locale: row.locale.toLowerCase(), slug: row.slug }));
  } catch (error) {
    // Only used for generateStaticParams at build time — a DB outage here
    // shouldn't fail the entire `next build`. Falling back to no pre-rendered
    // slugs just means every /news/[slug] request renders on-demand instead
    // of being statically generated; the runtime queries in this file are
    // NOT wrapped this way and still throw/404 normally.
    console.error("getAllSlugs: DB unreachable, skipping static params for /news/[slug]", error);
    return [];
  }
}
