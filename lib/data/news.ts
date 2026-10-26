import { Prisma, PostStatus, PostSection, type Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readCaseStudy, type CaseStudyDetails } from "@/lib/case-study";

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
  /** Events only — ISO dates and venue entered in the dashboard; null/"" otherwise. */
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventLocation: string;
  /** Case Studies only (detail pages): facts, results and quote; null otherwise. */
  caseStudy: CaseStudyDetails | null;
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
  eventStartDate: true,
  eventEndDate: true,
  eventLocation: true,
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
    eventStartDate: row.eventStartDate?.toISOString() ?? null,
    eventEndDate: row.eventEndDate?.toISOString() ?? null,
    eventLocation: row.eventLocation ?? "",
    caseStudy: null,
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
    eventStartDate: row.eventStartDate?.toISOString() ?? null,
    eventEndDate: row.eventEndDate?.toISOString() ?? null,
    eventLocation: row.eventLocation ?? "",
    caseStudy: row.section === PostSection.CASE_STUDIES ? readCaseStudy(row.caseStudy) : null,
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
  const isEvents = section === PostSection.EVENTS;
  if (picked.length > 0) return isEvents ? sortEvents(picked.map(mapListRow)) : picked.map(mapListRow);

  if (isEvents) {
    // No picks: the next upcoming events (then the most recent past ones).
    const all = await prisma.post.findMany({ where, orderBy: PUBLISHED_ORDER, select: listSelect });
    return sortEvents(all.map(mapListRow)).slice(0, HIGHLIGHT_FALLBACK_COUNT);
  }

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
    // Case studies have their own buttons; the "latest news" feeds stay news.
    where: { status: PostStatus.PUBLISHED, locale: prismaLocale, section: { not: PostSection.CASE_STUDIES } },
    orderBy: PUBLISHED_ORDER,
    take,
    select: listSelect,
  });
  return rows.map(mapListRow);
}

/** An event counts as upcoming until its end date (or start date) has passed. */
function eventEndTime(post: NewsPost): number | null {
  const iso = post.eventEndDate ?? post.eventStartDate;
  return iso ? new Date(iso).getTime() : null;
}

export function isPastEvent(post: NewsPost, now = Date.now()): boolean {
  const end = eventEndTime(post);
  // The whole end day still counts as upcoming.
  return end !== null && end + 24 * 60 * 60 * 1000 <= now;
}

function sortEvents(posts: NewsPost[]): NewsPost[] {
  const now = Date.now();
  const dated = posts.filter((p) => p.eventStartDate);
  const upcoming = dated.filter((p) => !isPastEvent(p, now)).sort((a, b) => a.eventStartDate!.localeCompare(b.eventStartDate!));
  const past = dated.filter((p) => isPastEvent(p, now)).sort((a, b) => b.eventStartDate!.localeCompare(a.eventStartDate!));
  const undated = posts.filter((p) => !p.eventStartDate);
  return [...upcoming, ...past, ...undated];
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

  if (section === PostSection.EVENTS) {
    // Events list by their own dates, not by publish date: upcoming first
    // (soonest at the top), then past events (most recent first), then any
    // event without a date. There are few enough to sort in memory.
    const all = (await prisma.post.findMany({ where, orderBy: PUBLISHED_ORDER, select: listSelect })).map(mapListRow);
    const sorted = sortEvents(all);
    return { posts: sorted.slice((safePage - 1) * perPage, safePage * perPage), total, totalPages };
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: PUBLISHED_ORDER,
    skip: (safePage - 1) * perPage,
    take: perPage,
    select: listSelect,
  });
  return { posts: rows.map(mapListRow), total, totalPages };
}

/** Other published case studies, newest first — the "More case studies" row. */
export async function getOtherCaseStudies(locale: string, excludeSlug: string, take = 3): Promise<NewsPost[]> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return [];
  const rows = await prisma.post.findMany({
    where: { status: PostStatus.PUBLISHED, locale: prismaLocale, section: PostSection.CASE_STUDIES, slug: { not: excludeSlug } },
    orderBy: PUBLISHED_ORDER,
    take,
    select: listSelect,
  });
  return rows.map(mapListRow);
}

export interface CaseStudyHighlight {
  href: string;
  title: string;
  coverImage: string;
  details: CaseStudyDetails;
}

/**
 * The case study featured on the homepage: the one whose slug is set in Pages
 * → Homepage → Client success story, else the newest published case.
 */
export async function getCaseStudyHighlight(locale: string, slug?: string): Promise<CaseStudyHighlight | null> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return null;
  const where = { status: PostStatus.PUBLISHED, locale: prismaLocale, section: PostSection.CASE_STUDIES };
  const select = { slug: true, title: true, featuredImage: true, caseStudy: true } as const;
  const row =
    (slug ? await prisma.post.findFirst({ where: { ...where, slug }, select }) : null) ??
    (await prisma.post.findFirst({ where, orderBy: PUBLISHED_ORDER, select }));
  if (!row) return null;
  return { href: `/news/${row.slug}`, title: row.title, coverImage: row.featuredImage ?? "", details: readCaseStudy(row.caseStudy) };
}

/** Path of the newest published case study ("/news/<slug>"), or null when there is none. */
export async function getLatestCaseStudyPath(locale: string): Promise<string | null> {
  const prismaLocale = toPrismaLocale(locale);
  if (!prismaLocale) return null;
  const post = await prisma.post.findFirst({
    where: { status: PostStatus.PUBLISHED, locale: prismaLocale, section: PostSection.CASE_STUDIES },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true },
  });
  return post ? `/news/${post.slug}` : null;
}

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
