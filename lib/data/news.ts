import { Prisma, PostStatus, type Locale } from "@prisma/client";
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
 * Reserved slugs "re-analysis", "knowledge-database", "events" belong to
 * static routes under /news/ and must never be used by a post (not enforced
 * here — flagged for a later seed/validation guard).
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
  /** Derived (not a DB column): true for the most recent published posts. */
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

/** How many of the most recent published posts are treated as highlights. */
const HIGHLIGHT_COUNT = 4;

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
  category: { select: { name: true } },
} satisfies Prisma.PostSelect;

const detailInclude = {
  category: { select: { name: true } },
  author: { select: { name: true } },
} satisfies Prisma.PostInclude;

type ListRow = Prisma.PostGetPayload<{ select: typeof listSelect }>;
type DetailRow = Prisma.PostGetPayload<{ include: typeof detailInclude }>;

function mapListRow(row: ListRow, isHighlight: boolean): NewsPost {
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
    isHighlight,
    content: "",
    authorName: "",
    metaTitle: null,
    metaDescription: null,
    canonicalUrl: null,
    ogImage: null,
    noIndex: false,
  };
}

function mapDetailRow(row: DetailRow, isHighlight: boolean): NewsPost {
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
    isHighlight,
    content: row.content,
    authorName: row.author.name,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    canonicalUrl: row.canonicalUrl,
    ogImage: row.ogImage,
    noIndex: row.noIndex,
  };
}

/** Most recent published posts for the highlights carousel on the index page. */
export async function getHighlightPosts(locale: string): Promise<NewsPost[]> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return [];

  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, locale: prismaLocale },
    orderBy: PUBLISHED_ORDER,
    take: HIGHLIGHT_COUNT,
    select: listSelect,
  });
  return rows.map((row) => mapListRow(row, true));
}

/** Paginated published-post list for the news index. */
export async function getPosts(
  locale: string,
  page: number,
  perPage: number
): Promise<{ posts: NewsPost[]; total: number; totalPages: number }> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return { posts: [], total: 0, totalPages: 1 };

  const where = { status: PostStatus.PUBLISHED, locale: prismaLocale };
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
  return { posts: rows.map((row) => mapListRow(row, false)), total, totalPages };
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
  return row ? mapDetailRow(row, false) : null;
}

/**
 * Previous (newer) and next (older) published post in the same locale,
 * ordered by publishedAt, for the prev/next navigation on the detail page.
 */
export async function getAdjacentPosts(
  slug: string,
  locale: string
): Promise<{ prev: NewsPost | null; next: NewsPost | null }> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return { prev: null, next: null };

  const current = await prisma.post.findFirst({
    where: { slug, locale: prismaLocale, status: PostStatus.PUBLISHED },
    select: { publishedAt: true, createdAt: true },
  });
  if (!current) return { prev: null, next: null };

  const pivot = current.publishedAt ?? current.createdAt;
  const base = {
    status: PostStatus.PUBLISHED,
    locale: prismaLocale,
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
    prev: prev ? mapListRow(prev, false) : null,
    next: next ? mapListRow(next, false) : null,
  };
}

/**
 * Every published post as a { locale, slug } pair, for generateStaticParams
 * on the [locale]/news/[slug] route. `locale` is lowercased to match the
 * route segment.
 */
export async function getAllSlugs(): Promise<{ locale: string; slug: string }[]> {
  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED },
    select: { slug: true, locale: true },
  });
  return rows.map((row) => ({ locale: row.locale.toLowerCase(), slug: row.slug }));
}
