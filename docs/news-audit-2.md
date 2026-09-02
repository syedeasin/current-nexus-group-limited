# News route pre-flight — Phase E1, CHECKPOINT E1-0

Full detail dump for E1 section 1. Terminal report is the summary; this is the evidence.

---

## 1. `lib/data/news.ts` — full current contract

### Types

```ts
export type NewsBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "listLead"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string };

export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;        // plain string, e.g. "Industry Insight"
  coverImage: string;      // non-null path, e.g. "/images/news/news-solar-modules.webp"
  publishedAt: string;     // ISO date string "2026-07-30"
  readingMinutes: number;
  isHighlight: boolean;
  content: NewsBlock[];
}
```

### Exported functions (exact signatures)

| Function | Signature | Returns | Used by |
|---|---|---|---|
| `getHighlightPosts` | `() => Promise<NewsPost[]>` | posts where `isHighlight === true` | `components/sections/news/Highlights.tsx` |
| `getPosts` | `(page: number, perPage: number) => Promise<{ posts: NewsPost[]; total: number; totalPages: number }>` | paginated slice | `components/sections/news/AllNews.tsx` |
| `getPostBySlug` | `(slug: string) => Promise<NewsPost \| null>` | single post or null | detail `page.tsx` (component + `generateMetadata`) |
| `getAdjacentPosts` | `(slug: string) => Promise<{ prev: NewsPost \| null; next: NewsPost \| null }>` | neighbours by array order | detail `page.tsx` → `PostNav` |
| `getAllSlugs` | `() => Promise<string[]>` | slug strings only, **no locale** | detail `generateStaticParams` |

Notes:
- **None take a `locale` argument.** All five must gain one for E1.
- `getPosts` is **paginated** (`PER_PAGE = 6` in `AllNews.tsx`) and the page has a working `<Pagination>`. Section 7 says keep pagination if already present — it is. Keep a paginated list function.
- Spec section 2 names `getPublishedPosts` / `getPublishedSlugs` / `getPostBySlug` / `getAdjacentPosts`. Real code also has `getHighlightPosts` and a paginated `getPosts`. Decision needed at E1-1: keep existing names (minimal page churn) vs adopt spec names (touch every import). Recommend keep existing names, rewrite bodies.
- `getAllSlugs` returns `string[]`; `generateStaticParams` currently maps to `{ slug }` only. Section 4 wants `{ locale, slug }` pairs → signature changes to `string[]` → `{ locale: string; slug: string }[]`.

### Reserved slugs (from file header comment)

`re-analysis`, `knowledge-database`, `events` are reserved for static routes under `/news/` (no page files exist yet — they currently 404). A DB post must never use these slugs. Not enforced anywhere today; worth a guard in `getPostBySlug` or seed validation later (out of scope E1, flag only).

---

## 2. The pages

### List — `app/[locale]/(marketing)/news/page.tsx`

- Server component. Awaits `searchParams: Promise<{ page?: string }>`, computes `page`.
- Renders `<Banner />` (static), `<Highlights />`, `<AllNews page={page} />`.
- **`generateMetadata()`** — static, synchronous, no params. Returns `{ title: "News room", description: "...${siteConfig.name}..." }`. Section 4 "list page metadata" — this already satisfies it; minimal/no change.
- Does not call any data function directly — delegates to `Highlights` and `AllNews`.

Data flows through two child server components:

**`components/sections/news/Highlights.tsx`**
- `await getHighlightPosts()`.
- Reads per post: `post.slug` (key), `post.readingMinutes` (→ `t("minRead", { count })`), passes whole `post` to `<HighlightCard>`.

**`components/sections/news/AllNews.tsx`**
- `await getPosts(page, PER_PAGE)` → `{ posts, totalPages }`.
- Reads per post: `post.slug` (key), `post.coverImage`, `post.title`, `post.publishedAt`, `post.readingMinutes`.
- Builds `href={`/news/${post.slug}`}` (raw template string, not `postPublicPath`).
- Renders `<Pagination currentPage totalPages basePath="/news" ...>`.

**`components/ui/BlogCard.tsx`** (card used by `AllNews`)
- Props: `href, image, imageSizes, title, date (ISO string), readTime, headingLevel?, className?`.
- `date` doc-comment: "ISO date (UTC) — rendered through the fixed-locale formatter" → `formatDate(date)`.
- Image: `next/image` `<Image fill>` with `alt=""` `aria-hidden` (decorative — alt text NOT consumed here).

**`components/sections/news/HighlightCard.tsx`**
- Props: `post: NewsPost`, `readingMinutesLabel: string`.
- Reads: `post.slug` (href + aria-label via title), `post.title`, `post.coverImage`, `post.publishedAt` (→ `formatDate`).
- Image decorative (`alt=""` `aria-hidden`).
- `href={`/news/${post.slug}`}` via `Link` from `@/i18n/navigation`.

**`NewsCarousel.tsx`** — layout/interaction shell only, no post-field reads.

### Detail — `app/[locale]/(marketing)/news/[slug]/page.tsx`

- **`generateStaticParams()`** — `await getAllSlugs()` → `slugs.map((slug) => ({ slug }))`. No `locale`. No `dynamicParams` export.
- **`generateMetadata({ params })`** — `params: Promise<{ locale: string; slug: string }>`, awaited.
  - `await getPostBySlug(slug)` (no locale). If null → `{ title: "Post not found" }`.
  - `path = getPathname({ href: `/news/${slug}`, locale })`; `url = `${siteConfig.url}${path}``.
  - `coverUrl = `${siteConfig.url}${post.coverImage}``.
  - Returns `title: post.title`, `description: post.excerpt`, `alternates.canonical: url`, `openGraph { type:"article", title, description, url, images:[{url:coverUrl}], publishedTime: post.publishedAt }`, `twitter { card:"summary_large_image", title, description, images:[coverUrl] }`.
  - **No** `metaTitle` / `metaDescription` / `canonicalUrl` / `ogImage` / `noIndex` / `robots` fallback logic — section 4 adds all of it.
- **Page component** — `params: Promise<{ locale, slug }>`, awaited.
  - `await getPostBySlug(slug)`; `notFound()` if null.
  - `Promise.all([ getAdjacentPosts(slug), getTranslations("news") ])`.
  - `path = getPathname({ href: `/news/${slug}`, locale })`; `postUrl = siteConfig.url + path`.
  - **JSON-LD** (`dangerouslySetInnerHTML` on a `<script type="application/ld+json">`): `@type:"Article"`, `headline: post.title`, `image: [siteConfig.url + post.coverImage]`, `datePublished`/`dateModified: post.publishedAt`, `author: [{ @type:"Organization", name: siteConfig.name }]`. Section 5 wants real author name + `publishedAt`.
  - Renders `<DetailsHero post postUrl />`, then `<ArticleBody blocks={post.content} />`, then `<PostNav prev next previousLabel nextLabel />`.

**`components/sections/news/DetailsHero.tsx`**
- Props `post: NewsPost`, `postUrl: string`.
- Reads: `post.coverImage` (`<Image fill priority>`, `alt=""` decorative), `post.category` (rendered as text), `post.publishedAt` (→ `formatDate`), `post.title` (heading + `ShareLinks` title).

**`components/sections/news/ArticleBody.tsx`**
- Props `blocks: NewsBlock[]`.
- `groupBlocks` pairs `listLead`+`list`; `renderBlock` switches on `block.type` → `Heading` / `Text` / `<ul>` / `next/image`.
- **This is the block renderer to retire** (section 3). Replace call site with sanitised-HTML `<div className="prose-content" dangerouslySetInnerHTML>`.

**`components/sections/news/PostNav.tsx`**
- Props `prev: NewsPost | null`, `next: NewsPost | null`, `previousLabel`, `nextLabel`.
- Reads only `prev.slug` / `next.slug` for `href={`/news/${slug}`}`. Renders nothing if both null.
- **The design DOES use prev/next.** `getAdjacentPosts` must be implemented, not skipped.

### `generateStaticParams` / `dynamicParams` status

- `generateStaticParams` present, returns `{ slug }` (locale filled implicitly by Next from the `[locale]` segment).
- No `export const dynamicParams`. Next 16 default is `dynamicParams = true` already, but section 4 wants it explicit.

---

## 3. Fields the pages actually read from a post — the contract

| Field | Type expected by page | Read in |
|---|---|---|
| `slug` | string | every list card, PostNav, params, static params |
| `title` | string | HighlightCard, BlogCard, DetailsHero, generateMetadata, JSON-LD |
| `excerpt` | string | generateMetadata (description, OG, twitter) |
| `category` | string (name) | DetailsHero (text) |
| `coverImage` | string, **non-null** | HighlightCard, BlogCard, DetailsHero, generateMetadata (`coverUrl`), JSON-LD (`image`) |
| `publishedAt` | string (ISO) | HighlightCard, BlogCard, DetailsHero (all via `formatDate`), generateMetadata (`publishedTime`), JSON-LD (`datePublished`/`dateModified`) |
| `readingMinutes` | number | Highlights, AllNews (`t("minRead", { count })`) |
| `isHighlight` | boolean | `getHighlightPosts` filter |
| `content` | `NewsBlock[]` | ArticleBody |

Not read anywhere today: author (any form), featured-image alt, tags, viewCount, SEO fields.
`formatDate(isoDate: string)` — takes a **string**, `new Date(isoDate)`. A `Date` from Prisma must be converted (`.toISOString()`), or `formatDate` widened to accept `Date`.

---

## 4. Gap analysis — page contract vs Prisma `Post`

### 4a. Fields the page needs that `Post` lacks or exposes differently

| Page field | Prisma reality | Resolution |
|---|---|---|
| `category: string` | `categoryId String?` + `Category` relation; name is `Category.name` (Category is itself locale-scoped) | `include: { category: true }`, map `category?.name ?? ""` (or hide the chip when null). Category nullable → fallback needed. |
| `coverImage: string` (non-null) | `featuredImage String? @db.VarChar(500)` — **nullable** | Fallback placeholder path when null (functionality-first), OR conditionally render image. Must pick one at E1-1. Static demo used `/images/news/*.webp`; pick a neutral placeholder that exists in `public/`. |
| cover image **alt** | `featuredImageAlt String?` exists but components hardcode `alt=""` `aria-hidden` | Section 5 says "featured image with its alt text". Minor component change (drop `aria-hidden`, pass `featuredImageAlt ?? ""`). Flag: changes 3 components slightly — allowed as "adapt at boundary" is impossible for alt. |
| `publishedAt: string` | `publishedAt DateTime?` — **nullable** | Map to ISO string in `lib/data/news.ts`; fallback to `createdAt` when null (spec section 2 rule). |
| `readingMinutes: number` | `readingTime Int @default(0)` | Rename in mapping. If `0`, `t("minRead", {count:0})` renders "0 min read" — cosmetic, not an error. Flag. |
| `excerpt: string` | `excerpt String?` — nullable | generateMetadata fallback chain (section 4): `metaDescription ?? excerpt ?? content-text-slice`. For card display, `excerpt ?? ""`. |
| `isHighlight: boolean` | **No column.** Nothing in `Post` marks a highlight. | Options: (a) drop `<Highlights>` carousel this phase, (b) derive = most recent N published, (c) add `Post.isHighlight` — **schema change, must flag first, spec forbids without approval**. Decision needed at E1-1. Recommend (b) or (a). |
| `content: NewsBlock[]` | `content String @default("")` — sanitised HTML | Core adaptation (section 3): render via `.prose-content` + `dangerouslySetInnerHTML`, re-sanitise with `sanitizePostHtml`. Retire `ArticleBody`/`NewsBlock`. |
| JSON-LD / OG author name | `authorId String` (required) + `User` relation; `User.name` required, `User.avatarUrl` nullable | `include: { author: true }`, use `author.name`. Avatar not needed (JSON-LD only wants name). |

### 4b. Fields `Post` has that the page currently ignores

Will be **used** by E1 section 4/5: `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `noIndex`, `publishedAt` (already), `author.name`, `updatedAt` (→ JSON-LD `dateModified`).

Still ignored after E1 (fine): `focusKeyword`, `viewCount`, `tags`/`PostTag`, `translationKey`, `id`, `status` (used only as query filter), `locale` (used only as query filter).

### 4c. Locale enum mismatch — the biggest structural gap

- `prisma/schema.prisma`: `enum Locale { EN FR }`.
- `i18n/routing.ts`: `locales: ["en", "zh"]`, `defaultLocale: "en"`.
- The route segment `[locale]` only ever resolves `en` or `zh`. **There is no `fr` route and no `zh` value in the Prisma enum.**
- Consequences:
  - Public queries must map route locale → Prisma enum: `"en"` → `EN`. `"zh"` has **no** Prisma `Locale` member → `/zh/news` can only ever be empty (or needs a `ZH` enum value — schema change, flag only).
  - Verification table item 9 (`/fr/news` shows FR only) **cannot pass as written** — `/fr/news` 404s at the routing layer before any query runs. Report as a known gap; FR content is unreachable until `routing.locales` gains `"fr"`.
  - Seed data is all `Locale.EN`, so `/en/news` is the only path with content. That is expected for E1.

---

## 5. `lib/routes.ts` — `postPublicPath` vs the actual route

```ts
export function postPublicPath(locale: string, slug: string): string {
  const normalized = locale.toLowerCase();
  if (isRouteLocale(normalized)) {                       // normalized ∈ {"en","zh"}
    return getPathname({ href: `/news/${slug}`, locale: normalized });
  }
  return `/${normalized}/news/${slug}`;                  // fallback for anything else
}
export function postPublicUrl(locale, slug) {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "") + postPublicPath(locale, slug);
}
```

- Route file: `app/[locale]/(marketing)/news/[slug]/page.tsx` → resolves to `/{locale}/news/{slug}`.
- For `locale = "en"`: `getPathname({ href: "/news/${slug}", locale: "en" })` → `/en/news/{slug}`. **Matches exactly.** ✔
- For `locale = "zh"`: → `/zh/news/{slug}`. Shape matches the route, but no seed content.
- For `locale = "fr"` (the Prisma enum value): `isRouteLocale("fr")` is **false** → falls to `/fr/news/{slug}` — a path that **404s** (no `fr` in `routing.locales`). The function's own doc-comment already flags this ("Post.locale (EN | FR) is not the same set as i18n/routing.ts (en | zh) ... that path will 404 until routing supports it").
- The current detail page builds its URL with `getPathname(...)` directly, **not** `postPublicPath`. E1 section 4 says canonical/OG url should use `postPublicUrl(locale, slug)` from `lib/routes.ts` → switch to it.
- URL base mismatch to note: `postPublicUrl` uses `process.env.NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` in `.env`); the current page uses `siteConfig.url` (`https://www.currentnexus.com`). E1 section 4 explicitly wants `postPublicUrl` → canonical/OG will switch to the env value. Confirm that is intended (it is dev-correct; prod sets the env var).

---

## 6. Summary of decisions required at E1-1 (before writing code)

1. **Keep existing function names** (`getHighlightPosts`, `getPosts`, `getPostBySlug`, `getAdjacentPosts`, `getAllSlugs`) and rewrite bodies, vs rename to spec's names. → recommend keep.
2. **`isHighlight` has no DB column.** Drop the Highlights carousel, derive it (recent N), or flag a schema add. → recommend derive (most recent 4 published) or drop.
3. **`featuredImage` nullable** — placeholder path vs conditional render. → pick a placeholder in `public/`.
4. **`readingTime = 0`** rendering "0 min read" — accept or suppress when 0.
5. **Locale mapping** route→enum: `en → EN`; `zh` unsupported in enum, `fr` unsupported in routing. Verification item 9 will not pass as written — report.
6. **Canonical/OG base URL** moves from `siteConfig.url` to `NEXT_PUBLIC_SITE_URL` via `postPublicUrl`. Confirm.
7. Small unavoidable component edits: cover-image `alt` (3 components), `formatDate` accepting `Date` or mapping to string, `ArticleBody` call site replaced. Everything else adapts inside `lib/data/news.ts`.
