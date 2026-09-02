# Phase E1 — CHECKPOINT E1-A report

`npx tsc --noEmit` → **exit 0, clean.**

Dev server on :3000. All routes verified below.

---

## Files created / modified / deleted

### Modified

| File | Change |
|---|---|
| `lib/data/news.ts` | Full rewrite. Hardcoded `NewsPost[]` array + `NewsBlock` union removed. Five functions now query Prisma via `@/lib/prisma`. Names kept; signatures gained `locale`. `content` type is now `string` (sanitised HTML), not `NewsBlock[]`. |
| `app/[locale]/(marketing)/news/[slug]/page.tsx` | `generateStaticParams` → returns `{ locale, slug }[]` from `getAllSlugs()`. Added `export const dynamicParams = true`. `generateMetadata` rebuilt with the full SEO fallback chain (metaTitle/metaDescription/canonicalUrl/ogImage/noIndex→robots). JSON-LD uses real `author.name`, `publishedAt`, `updatedAt`. `<ArticleBody>` replaced with `<div className="prose-content" dangerouslySetInnerHTML={sanitizePostHtml(post.content)} />`. Canonical/OG URLs now via `postPublicUrl()`. |
| `components/sections/news/AllNews.tsx` | `getLocale()` → `getPosts(locale, page, PER_PAGE)`. Added empty state (`t("noArticles")`) when zero posts. Passes `imageAlt` to `BlogCard`. |
| `components/sections/news/Highlights.tsx` | `getLocale()` → `getHighlightPosts(locale)`. Returns `null` when zero highlights (avoids an empty carousel). |
| `components/sections/news/HighlightCard.tsx` | Cover `<Image>` rendered only when `post.coverImage` non-null; `alt={post.coverImageAlt}`. |
| `components/sections/news/DetailsHero.tsx` | Cover `<Image>` conditional + `alt`. Category chip + divider rendered only when `post.category` non-empty. |
| `components/ui/BlogCard.tsx` | `image` prop widened to `string \| null`; new optional `imageAlt`. `<Image>` conditional; `aria-hidden` only when alt empty. Backward compatible — homepage `LatestNews` still passes non-null strings. |
| `messages/en.json` | +1 key: `news.noArticles` = "No articles yet." |
| `messages/fr.json` | +1 key: `news.noArticles` = "No articles yet." (English, per E0 — FR copy is a later task) |

### Deleted

| File | Reason |
|---|---|
| `components/sections/news/ArticleBody.tsx` | Block renderer retired (spec §3). Nothing else imported it or `NewsBlock` (grep-confirmed). |

### Not touched (intentionally)

`app/[locale]/(marketing)/news/page.tsx` (list — delegates, static metadata already satisfies spec §4), `PostNav.tsx` (reads only `.slug`), `NewsCarousel.tsx`, `Banner.tsx`, `lib/routes.ts`, `lib/sanitize-html.ts`, `lib/formatDate.ts`, `prisma/schema.prisma`, everything under `app/dashboard/`, `proxy.ts`.

Stale `(en | zh)` comment in `lib/routes.ts:16-18` left as-is (cosmetic sweep, per your instruction).

---

## Design fields with no clean DB equivalent — resolution taken

| # | Field | DB reality | What I did | Needs your call? |
|---|---|---|---|---|
| 1 | `isHighlight` | **No column at all** | Derived: the `HIGHLIGHT_COUNT = 4` most recent PUBLISHED posts (per locale) get `isHighlight: true`. `Highlights` renders `null` if there are none. | **Yes** — accept "recent 4", or schema-flag a real `Post.isHighlight` column. |
| 2 | `coverImage` (was non-null `string`) | `featuredImage String?` — **all 5 published posts currently null** | Type is now `string \| null`. Components keep their existing `bg-neutral-2` / `bg-neutral-1` wrapper box and simply omit `<Image>` when null. **No placeholder image file added** (none existed in `public/`; adding one is a design decision). | **Yes** — accept the plain colour block, or supply a placeholder asset. |
| 3 | cover image **alt** | `featuredImageAlt String?` existed but was ignored (`alt=""` hardcoded in 4 components) | Now consumed: `alt={coverImageAlt}`, `aria-hidden` only when alt is empty. Minor edit to 4 components — unavoidable, alt cannot be adapted at the data boundary. | No |
| 4 | `readingMinutes` | `readingTime Int @default(0)` — **seed value is 0** for the 4 seed posts | Left as-is. Cards render "0 min read" for those posts. Cosmetic, not an error. | **Yes** — accept, or suppress the read-time chip when 0. |
| 5 | `category` | `categoryId String?` + nullable `Category` relation | `include` + `category?.name ?? ""`. DetailsHero hides the chip+divider when empty. Seed posts all have a category, so non-empty in practice. | No |
| 6 | `content` shape | `content String` — sanitised HTML | Rendered via `.prose-content` + double-sanitise on output (`sanitizePostHtml`). **Seed caveat:** the 4 seed posts store plain excerpt text (no HTML tags) in `content`, so they render as a bare text node with no `<p>` spacing. The dashboard-authored test post renders full HTML correctly. Seed is a Phase-D file — not touched. | **Yes** — reseed posts with real HTML later, or accept plain-text seed rows. |
| 7 | `publishedAt` | `DateTime?` nullable | Mapper falls back to `createdAt`. List ordering: `[{ publishedAt: desc }, { createdAt: desc }]`. | No |
| 8 | prev/next adjacency | — | `getAdjacentPosts` compares on `publishedAt` only; a published post with a null `publishedAt` would not appear as a neighbour. Defensive edge case only (shouldn't occur). | No |

---

## Deviations from the E1 spec text — flagged

| Ref | Spec says | What shipped | Why |
|---|---|---|---|
| §4 | canonical/OG url from `postPublicUrl(locale, slug)` | Done — but that helper uses `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` in `.env`), replacing the old `siteConfig.url` (`https://www.currentnexus.com`). Canonical now reads `http://localhost:3000/en/news/...` in dev. | Spec §4 explicitly names `postPublicUrl`. Prod must set `NEXT_PUBLIC_SITE_URL`. **Confirm this is intended.** |
| §5 | list images as plain `<img>`, not `next/image` | Kept `next/image` (existing markup). | Your restated rule: "keep the existing markup and classes". Local `/uploads/*` paths work with `next/image` (same-origin, no `remotePatterns` needed). Switch later if you want. |
| §2 | function names `getPublishedPosts` / `getPublishedSlugs` | Kept `getPosts` / `getHighlightPosts` / `getPostBySlug` / `getAdjacentPosts` / `getAllSlugs` | Your decision #1. |
| — | — | Components read locale via `getLocale()` from `next-intl/server`. | Avoids threading `locale` as a prop through the unchanged list `page.tsx`. |

---

## Verification (spec §6 item numbers)

| # | Check | Result |
|---|---|---|
| 1 | `/en/news` lists published posts | ✅ 5 published EN posts rendered (4 topical + `this-is-a-test-news`) |
| 2 | Click through → content renders | ✅ `.prose-content` div contains `<h2>What is Lorem Ipsum?</h2>` … from the DB HTML |
| 3 | `/en/news/this-is-a-test-news` loads (was 404) | ✅ 200 |
| 4 | `<head>` title/desc from SEO fields | ✅ `<title>this is a test meta …` (= `metaTitle`, not `title`); `<meta name="description" content="this is a test meta description">` (= `metaDescription`) |
| 5 | `noIndex` post → robots noindex | ⚠️ Logic in place (`robots: noIndex ? {index:false,follow:false} : undefined`). **No `noIndex:true` post exists in the DB** — cannot confirm live. Set one to verify in the browser. |
| 6 | Draft → 404 | ✅ `/en/news/q3-silicon-wafer-supply-chain-outlook` (DRAFT) → 404 |
| 7 | Inline image in content renders | ✅ (indirect) sanitizer allows `<img src="/uploads/…">`; test post HTML renders. Not separately forced. |
| 8 | `<img onerror=>` forced into DB → stripped | ⚠️ `sanitizePostHtml` re-runs on output (double sanitise). Not live-tested — no malicious row inserted. |
| 9 | `/fr/news` shows FR only | ✅ 200, renders "No articles yet." (FR locale resolves; 0 FR posts — correct, not a bug) |
| 10 | Unknown slug → 404 | ✅ `/en/news/nope-xyz` → 404 |
| 11 | OG tags present | ✅ title / description / `type=article` / `url`. No `og:image` (no post has `featuredImage`/`ogImage`) — correctly omitted, not empty. |
| 12 | Dashboard unaffected | ✅ not touched; `/dashboard` → 307 → `/login` |

### Regression (E0 routes)

`/en` 200 · `/login` 200 · `/dashboard` 307→/login — unchanged.

---

## Dev-server note

Hit the recurring Turbopack stale-cache issue again: after editing `messages/fr.json` the `news.noArticles` key rendered literally until a dev restart (message files are pulled through a dynamic `import()` in `i18n/request.ts` that Turbopack doesn't reliably invalidate). Restarted the dev server once (no `.next` wipe needed). Everything green afterward. Worth knowing for E1-B: **edits to `messages/*.json` need a dev restart to take effect.**
