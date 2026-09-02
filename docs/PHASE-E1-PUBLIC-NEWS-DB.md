# Phase E1 — Connect Public News Pages to the Database

Implementation spec for Claude Code. Work top to bottom. Stop at every **CHECKPOINT**.

Prerequisite: Phases A–D2B are complete. The dashboard can create, edit, publish and unpublish posts with rich text content and images, and `Post.content` stores sanitised HTML. The public news route is still static, reading a hardcoded array in `lib/data/news.ts`.

Goal of this phase: make published posts appear on the public site. **Functionality only, not visual polish.** The dashboard and public design are both being reworked separately, so do not spend effort on pixel-matching the current static design. A plain, correct, working page is the target. Presentation gets rebuilt later; this phase must not bake in anything that makes that rebuild harder.

---

## 0. Locked environment

| Package | Locked version |
|---|---|
| next | 16.3.0 |
| next-intl | 4.13.7 |
| prisma / @prisma/client | 6.19.3 |
| zod | 4.4.3 |

### Hard rules

1. **Do NOT run** `npm install <pkg>@latest`, `npm update`, `npm audit fix`, or `npm audit fix --force`.
2. **No new dependencies.** Everything needed exists.
3. **Do NOT run** `npm run build`.
4. Only verification command is `npx tsc --noEmit`.
5. Do not touch Phase B auth files, `proxy.ts`, or the dashboard.
6. This phase edits the public news route and `lib/data/news.ts` only. Do not redesign; do not restyle beyond what is needed to make content readable.

### Guiding principle

The original author isolated all data access behind functions in `lib/data/news.ts` specifically so the data source could be swapped without touching the pages. Honour that design: **rewrite the function bodies to query Prisma, change the page components as little as possible.** Where the page currently expects a shape the database cannot provide, adapt at the boundary (inside `lib/data/news.ts`), not by scattering changes across components.

---

## 1. Pre-flight — report, then stop

From `docs/news-audit.md` we already know the route is static and content is a `NewsBlock[]`, not HTML. Confirm the specifics before changing anything:

1. Print `lib/data/news.ts` in full: the `NewsPost` type, the `NewsBlock` union, and the exact signatures of every exported function (`getPostBySlug`, `getAllSlugs`, `getAdjacentPosts`, and any others).
2. Print the news list page (`app/[locale]/(marketing)/news/page.tsx` or equivalent) and the detail page (`app/[locale]/(marketing)/news/[slug]/page.tsx`), focusing on: which functions they call, what fields they read off each post, whether they use `generateStaticParams` and `generateMetadata`, and how `ArticleBody` consumes `content`.
3. List every field the pages actually read from a `NewsPost` (e.g. title, excerpt, coverImage, category, author, date, readingTime, content). This is the contract the database version must satisfy.
4. Compare that field list against the Prisma `Post` model and report the gaps in both directions:
   - Fields the page needs that `Post` does not have (e.g. author name, category name may be relations; a cover image alt; anything else).
   - Fields `Post` has that the page ignores.
5. Confirm `lib/routes.ts` `postPublicPath` produces exactly the path this route resolves to (`/{locale}/news/{slug}`).

**CHECKPOINT E1-0** — report all five. Do not write code. Long dumps go to `docs/news-audit-2.md`.

### How the gaps get resolved

- **Category / author:** `Post` has `categoryId` and `authorId` relations. Fetch them with `include` and map `category.name` and `author.name` into the shape the page expects.
- **Content shape mismatch (`NewsBlock[]` vs HTML string):** this is the core adaptation. See section 3.
- **A field the page needs that the model genuinely lacks** (e.g. author avatar): report it. Do not invent data. Either drop that piece of UI for now (functionality-first) or supply a safe fallback, and say which you chose. Do not add columns to the Prisma schema in this phase without flagging it first.

---

## 2. Task E1-1 — rewrite `lib/data/news.ts` to query Prisma

Replace the hardcoded array with Prisma queries. Keep the exported function names and, as far as possible, their return shapes, so the pages keep working.

### Rules for every query

- **Only `PUBLISHED` posts are ever visible publicly.** Every public query filters `status: "PUBLISHED"`. A draft, pending, or archived post must 404 on the public site even if someone knows its slug.
- **Locale-scoped.** The news pages are under `[locale]`. Each function takes the current locale and filters `locale: <EN|FR>`. An EN reader sees EN posts only.
- Order lists by `publishedAt` desc, falling back to `createdAt` for any published post with a null `publishedAt` (should not happen, but be defensive).
- Use `include` to pull `category` and `author` in one query — never an N+1 loop.
- These run in server components, so import `prisma` from `@/lib/prisma` directly. No API route.

### Functions

- `getPublishedPosts(locale)` — list for the index page. Select only what the list needs (title, slug, excerpt, featuredImage, featuredImageAlt, category name, publishedAt, readingTime). Do not fetch full `content` for the list; it is wasteful.
- `getPostBySlug(slug, locale)` — full post for the detail page, including `content`, category, author. Returns `null` if not found or not published, so the page can call `notFound()`.
- `getAllSlugs()` or `getPublishedSlugs(locale)` — for `generateStaticParams`. Return `{ locale, slug }` pairs for every published post across locales.
- `getAdjacentPosts(slug, locale)` — previous and next published post by `publishedAt`, same locale, for prev/next navigation. If the current page does not use this, skip it and report.

Map each Prisma result into whatever shape the page components already read, doing the mapping **here** so the components change minimally. If the old `NewsPost` type is a good fit, adapt the model output to it; if it carries block-specific fields that no longer apply, create a lean new type and update the (few) component prop types to match.

---

## 3. Task E1-2 — render HTML content instead of blocks

The dashboard stores `content` as a sanitised HTML string. The current `ArticleBody` renders a `NewsBlock[]`. Bridge this the simple way, per the decision to prioritise functionality:

- Render the stored HTML with `<div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />`.
- This is safe **because** the HTML was sanitised server-side on save in D2B-3. As defence in depth, sanitise again on output: call `sanitizePostHtml(post.content)` from `@/lib/sanitize-html` before rendering. Sanitising twice is cheap and means a row written before the sanitiser existed, or edited directly in the database, still cannot inject script.
- The `.prose-content` class already exists from D2B-5 and gives headings, lists, links, images and blockquotes sensible styling. Reuse it; do not write new content styles this phase.
- Retire the `NewsBlock`-based `ArticleBody` rendering path for database posts. If any static-only demo content must keep working during the transition, note it; otherwise remove the block renderer and the `NewsBlock` union once nothing references them, and report what was deleted.

Do not attempt to convert HTML into blocks, and do not preserve caption/listLead features that the editor cannot currently produce. Those are design-phase decisions the user has explicitly deferred.

---

## 4. Task E1-3 — `generateStaticParams` and `generateMetadata`

This is where the SEO work the whole CMS was built for actually ships. Do it properly.

### `generateStaticParams` (detail page)

- Return every published post's `{ locale, slug }` from `getPublishedSlugs`.
- Next 16: confirm the correct return shape for a `[locale]/news/[slug]` route and report it.
- Add `export const dynamicParams = true` so a post published after build still renders on demand rather than 404ing. Confirm this is the right flag for Next 16.

### `generateMetadata` (detail page)

Build the `Metadata` object from the post's own SEO fields, falling back exactly the way a search engine would:

- `title`: `post.metaTitle` || `post.title`
- `description`: `post.metaDescription` || `post.excerpt` || first ~155 chars of the text content
- `alternates.canonical`: `post.canonicalUrl` || `postPublicUrl(locale, slug)` from `lib/routes.ts`
- `robots`: if `post.noIndex` is true, set `index: false, follow: false`
- `openGraph`: title, description, `url` from `postPublicUrl`, `type: "article"`, `publishedTime: post.publishedAt`, and `images` from `post.ogImage` || `post.featuredImage` (with the alt text)
- `twitter`: `card: "summary_large_image"`, mirroring the OG title/description/image

If the post is not found or not published, `generateMetadata` should not throw — return minimal metadata and let the page component call `notFound()`.

### List page metadata

A static `generateMetadata` or `metadata` export is fine: a sensible title and description for the news index. Nothing per-post.

---

## 5. Task E1-4 — the pages themselves

Change as little as possible.

### List page

- Call `getPublishedPosts(locale)`.
- Render each post as a card/link to `postPublicPath(locale, slug)`.
- Show title, excerpt, category name, date (formatted with `Intl.DateTimeFormat`, no date library), reading time, and the featured image with its alt text (plain `<img>`, not `next/image`, since uploaded paths are runtime values — set width/height if available, `loading="lazy"`).
- Empty state: if there are no published posts, show a plain "No articles yet" message rather than an empty grid or an error.
- Keep the existing layout wrapper/structure; only swap the data and the loop. Do not restyle.

### Detail page

- `params` is a Promise in Next 16 — await it.
- Call `getPostBySlug(slug, locale)`; `notFound()` if null.
- Render title, category, formatted date, reading time, featured image with alt, then the sanitised HTML body via `.prose-content`.
- If `getAdjacentPosts` exists and the current design uses prev/next, wire it; otherwise skip and report.
- The JSON-LD structured-data block already present (per the audit) should be updated to use the real post fields — headline, datePublished from `publishedAt`, author name, image. Keep it; it helps SEO.

**CHECKPOINT E1-A** — run `npx tsc --noEmit`, list every file created, modified, or deleted, and report any field gaps you resolved with a fallback.

---

## 6. Verification

Run `npx tsc --noEmit`, then in the browser:

| # | Action | Expected |
|---|---|---|
| 1 | Publish a post in the dashboard, then visit `/en/news` | The post appears in the list |
| 2 | Click it | Detail page renders with the content you wrote, formatting intact |
| 3 | The test post `this-is-a-test-news` at `/en/news/this-is-a-test-news` | Now loads instead of 404 |
| 4 | View page source / inspect `<head>` | `<title>` and meta description come from the post's SEO fields |
| 5 | A post with `noIndex` set | Its `<head>` carries `robots noindex` |
| 6 | Set a post back to DRAFT, revisit its URL | 404 — drafts never show publicly |
| 7 | An inline image in the content | Renders on the public page |
| 8 | A post with an inline `<img onerror=...>` forced into the DB | The handler is stripped on output — double sanitisation held |
| 9 | `/fr/news` | Shows FR posts only (likely empty for now — that is correct, not a bug) |
| 10 | A slug that does not exist | 404, not a crash |
| 11 | Open Graph: paste the post URL into a link debugger or inspect og: tags | Title, description, and image present |
| 12 | Dashboard still works — create/edit/publish | Unaffected |

Check 6 is the important one: a draft must never be reachable publicly by guessing its slug.

---

## 7. Out of scope

- Any visual redesign of the news list or detail page (deferred by the user)
- Category and tag archive pages (`/news/category/...`)
- Pagination on the news index (add only if the current page already had it)
- Search on the public site
- RSS feed and `sitemap.xml` — valuable and next, but their own phase
- `translationKey`-based EN/FR article linking
- Connecting any other public page to the database

---

## 8. Reusable

Flag, do not copy yet:

- The `generateMetadata` pattern built from post SEO fields — highly reusable, note it for the starter kit
- The double-sanitise-on-output pattern

---

## 9. Final instruction

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
