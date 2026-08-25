# News (blog) + News Details — build guide

Figma nodes: list page `54:43278`, details page `54:43401`.
Phase 1 (this document's build target): STATIC design, real markup, dummy data from a local file.
Phase 2 (later): swap the data source to a database. Read the "Phase 2" section at the bottom before writing any data code, because a few small decisions in Phase 1 decide whether Phase 2 is a 30 minute job or a rewrite.

## Routes

- List page: `app/[locale]/news/page.tsx`
- Details page: `app/[locale]/news/[slug]/page.tsx`

If the header nav already links "News room" somewhere else, use that existing path instead and keep it consistent everywhere (nav, footer "Newsroom" link, card links).

## Global rules (same as every other page)

- Content width: wrap all content in the shared `Container` (`@/components/layout/Container`, max-w 1440). Full-bleed backgrounds go on the outer `<section>`; content goes inside `Container`. Never hardcode `px-140` — the Container owns side padding. Content column must match the homepage exactly.
- Responsive, all devices: mobile-first. The page must never scroll horizontally. Specific breakpoint behaviour is written per section below.
- Animation: use the existing `Reveal` component (`@/components/ui/Reveal`) with the same timings as the homepage. `variant="up"` for text and cards, `variant="scale"` for images, stagger siblings by 80ms with the total stagger capped around 400ms. No new animation libraries.
- Use existing primitives: `Container`, `Heading`, `Text`, `SectionEyebrow`, `Reveal`, existing button component. Prefer design tokens over raw hex where a token exists.
- i18n: static UI labels ("Highlights news", "All News", "Share on social:", "Previous Post", "Next Post", "min read") go through `next-intl` under a `news` namespace. Article content itself does NOT go in i18n — it is data (see Phase 2).
- Images: do not hotlink Figma asset URLs (they expire in about 7 days). Put placeholder images in `/public/images/news/` and reference them from the dummy data file. Use `next/image` with correct `sizes`.
- Claude Code rule: run only `npx tsc --noEmit`. Do NOT run `npm run build` — the dev server is running and a production build corrupts the `.next` cache.

## Design tokens used on these pages

Colors: Neutral1 `#0A0D1B`, Neutral3 `#3B3D49`, Neutral4 `#54565F`, Neutral9 `#CECFD1`, Neutral10 `#E7E7E8`, `#6C6E76` (inactive pagination), White `#FFFFFF`, Secondary/gold `#D5AC5D`, Tertiary/eyebrow `#7A83CC`, Background2 `#F8F8F8`.

Type (Switzer): H1 64/72 semibold tracking -1.92. H2 48/56 semibold tracking -0.72. Article H2 32/40 semibold tracking -0.32. H5 24/32 semibold tracking -0.24. H6 20/28 semibold tracking -0.1. Body-lg 20/32 regular tracking -0.1. Meta 20/32 medium and 18/28 medium. Eyebrow 16/24 medium uppercase tracking -0.08.

Section padding: `py-100` desktop, scaling down to `py-64` md and `py-48` mobile, matching other pages.

---

# PAGE 1 — News list (`54:43278`)

Sections top to bottom: Banner, Highlights news, All News. Footer is the global layout footer, do not add one.

## 1.1 Banner

- Full-width `<section>`, `relative`, `overflow-hidden`, base bg `#0A0D1B`. Total height 548px desktop (the transparent global header, 88px, overlays the top). On mobile use a sensible min-height, roughly 380 to 420px, and let the text breathe.
- Background photo: solar field, anchored right, `object-cover`, covering roughly the right 87% on desktop.
- Two overlays stacked over the photo:
  1. Left darkening gradient: `linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80.364%)`.
  2. Top gradient for header legibility, 167px tall: `linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 96.876%)`.
- Content inside `Container`, bottom-left aligned (`justify-end`), desktop padding top 140 / bottom 120, text block max-width 718px, gap 12:
  - Eyebrow: 16px icon + `News room`, color `#7A83CC`, 16/24 medium uppercase, gap 8.
  - H1: `Discover the latest news & industry insights` — 64/72 semibold white, tracking -1.92. Responsive: about 32 to 36px mobile, 44px md, 64px xl.
- Animation: `Reveal up`, eyebrow 0ms, heading 80ms.

## 1.2 Highlights news

- `<section>` bg white, `py-100`. Content in `Container`.
- Header row, `justify-between`, `items-center`:
  - Left: `Highlights news` — 48/56 semibold `#0A0D1B`. Responsive: ~28px mobile, ~36px md, 48px xl.
  - Right: two round nav buttons, gap 8, each `p-12` `rounded-full`, icon 24.
    - Previous: transparent bg, border 1.5px `#E7E7E8`, arrow-left icon dark.
    - Next: bg `#0A0D1B`, arrow-right icon white.
    - Disabled state: reduce opacity and set `cursor-not-allowed` when there is nothing to scroll in that direction.
- Header to cards gap 48.
- Cards row: a horizontal SCROLLER, not a static grid. Cards `gap-24`, each card 648px wide on desktop, and the row overflows the container so the next card peeks in from the right (matches the design). Implement with a `flex` row inside an `overflow-x-auto` wrapper using `scroll-snap-type: x mandatory` and `scroll-snap-align: start` on each card; hide the native scrollbar. The two nav buttons call `scrollBy` with the card width plus gap, smooth behaviour. Must also be swipeable by touch on mobile.
  - Because the row must visually bleed past the Container's right edge on desktop, keep the section's `Container` for the header and let the scroller start at the Container's left padding and run to the viewport edge. Simplest safe approach: put the scroller in a full-width wrapper with left padding equal to the Container's side padding, and a right padding of 0.
- Highlight card (client-side link to `/news/[slug]`):
  - Image: 648 x 364 desktop, `rounded-12`, `object-cover`. On mobile the card should be about 85vw wide with the image keeping the same aspect ratio (16:9-ish, 648/364).
  - Content, gap 12:
    - Metadata row, gap 12, `items-center`: date `July 30, 2026` 20/32 medium `#54565F`, then a 14px tall vertical 1px divider `#E7E7E8`, then `7 min read` same style.
    - Title: 24/32 semibold `#0A0D1B`, tracking -0.24, right padding 40, clamp to 2 lines.
  - Divider under the card: 2px full-width `#E7E7E8`.
  - Card to divider gap 32.
  - Hover: subtle image zoom (scale 1.03, 300ms) and title color shift to the gold `#D5AC5D`. Whole card is one link, `cursor-pointer`.
- Animation: `Reveal up` on the header, cards staggered.

## 1.3 All News

- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container`, items centered, gap 48.
- Title: `All News` — 48/56 semibold `#0A0D1B`, left-aligned, full width.
- Grid: 3 columns desktop, 2 columns tablet, 1 column mobile. Column gap 24, row gap 40. Card width 424px at desktop (let the grid decide; do not hardcode widths).
- News card (link to `/news/[slug]`), gap 24:
  - Image: 424 x 300, `rounded-12`, `object-cover`. Keep the aspect ratio on all breakpoints.
  - Content, gap 12:
    - Metadata row, gap 12: date 18/28 medium `#54565F`, 14px vertical divider, `7 min read` same style.
    - Title: 20/28 semibold `#0A0D1B`, tracking -0.1, right padding 32, clamp to 2 lines.
  - Hover: same treatment as the highlight card.
- Pagination, centered, gap 8, below the grid:
  - Previous / next buttons: 40x40, `rounded-full`, `p-12`, chevron icon 24. Disabled state at the ends: reduced opacity, not clickable.
  - Page numbers: 40x40 each, `rounded-full`, 20/32 medium, centered. Active page color `#D5AC5D`; inactive `#6C6E76`. Hover on inactive: darken toward `#0A0D1B`.
  - Phase 1 behaviour: pagination should actually work against the dummy array — slice the posts client-side (or read a `?page=` search param, which is better because it is shareable and survives refresh). Prefer the `?page=` search param approach; it also carries straight into Phase 2.
  - Accessibility: wrap it in `<nav aria-label="Pagination">`, mark the current page with `aria-current="page"`.
- Animation: `Reveal up` on the title, cards staggered by index.

---

# PAGE 2 — News details (`54:43401`)

Route `app/[locale]/news/[slug]/page.tsx`. Sections: Hero, Article body, Prev/Next nav. Global footer only.

## 2.1 Hero

- Full-width `<section>`, `relative`, height 572px desktop (plus the header sitting above it; on this page the header has a WHITE background, not transparent — check how the layout handles per-page header variants and follow the existing pattern). On mobile allow the height to grow with the title, minimum around 420px.
- Background: the post's cover image, `object-cover`, full width.
- Overlay: `linear-gradient(to bottom, rgba(10,13,27,0) 0%, rgba(10,13,27,0.41) 76.958%, rgba(10,13,27,0.58) 100%)` with a light backdrop blur (about 11px) so the bottom text stays readable.
- Content in `Container`, anchored to the bottom (about 340px from the top on desktop), laid out `flex` `justify-between` `items-end`:
  - Left, `Blog Text`, max-width 900px, gap 8:
    - Metadata row, gap 12: category `Industry Insight` 20/32 medium `#CECFD1`, a 12px vertical divider, date `June 12, 2026` same style.
    - Title (h1): 48/56 semibold white, tracking -0.72. Responsive: about 28px mobile, 36px md, 48px xl.
  - Right, `Social Sharing`, width 161px, gap 20:
    - Label `Share on social:` 20/28 semibold white.
    - Icon row, gap 20, four 24px icons: Facebook, Instagram, X, LinkedIn. Each is a real share link opening in a new tab (`target="_blank" rel="noopener noreferrer"`) built from the current post URL and title; each needs an `aria-label` such as "Share on LinkedIn".
- Mobile: the share block moves below the title (stack the two blocks, gap 24) and the icons stay in a row.
- Animation: `Reveal up` on metadata, title, share block, staggered 80ms.

## 2.2 Article body

- `<section>` bg white, padding top 80 / bottom 100 desktop. Content in `Container`.
- Column: single article column, max-width 820px, centered within the Container. Between blocks the vertical rhythm is 60px; inside a block 20px; inside a bullet list 12px.
- Block styles (this is the reusable article typography, build it as ONE styled wrapper so all posts render consistently):
  - Section heading (h2): 32/40 semibold `#0A0D1B`, tracking -0.32.
  - Paragraph: 20/32 regular `#3B3D49`, tracking -0.1.
  - Lead-in line before a list (for example `Key performance advantages include:`): 20/32 medium `#0A0D1B`.
  - Bullet list: gap 12 between items, each item 20/32 regular `#3B3D49` with a small round bullet marker in `#CECFD1`. Bullet to text gap 12.
  - Inline image: full column width (820px), height about 460px, `rounded-16`, `object-cover`.
  - Links inside body text: gold `#D5AC5D`, underline on hover.
- Responsive: font sizes step down on mobile (heading about 24px, body about 17 to 18px), image height becomes an aspect ratio instead of a fixed height, and the column takes the full Container width.
- Implementation note that matters for Phase 2: do NOT hardcode this article as JSX paragraphs. Build a small `ArticleBody` renderer that takes the post's content and outputs these styles. In Phase 1, feed it either (a) an array of typed blocks (`{ type: 'heading' | 'paragraph' | 'list' | 'image', ... }`) or (b) an HTML/markdown string rendered through a `prose`-style wrapper with the exact classes above. Option (a) is cleaner and matches most headless CMS output; pick it unless the project already has a markdown pipeline.
- Animation: `Reveal up` on each top-level block, small stagger. Keep it subtle so long-form reading is not distracting; images use `variant="scale"`.

## 2.3 Previous / Next navigation

- Sits at the end of the article column, gap 32 from the last block.
- A 1px full-width divider `#E7E7E8` on top, then a row `justify-between`:
  - Left: arrow-left icon 20px + `Previous Post`, 18/24 semibold `#0A0D1B`, gap 4.
  - Right: `Next Post` + arrow-right icon 20px, same style.
- Each is a link to the neighbouring post's slug. If a neighbour does not exist, hide that side (do not render a dead link) and keep the other side in place.
- Mobile: keep them on one row but allow the labels to shrink; if space is tight, show only the arrow plus a short label.
- Animation: `Reveal up`.

## 2.4 SEO for the details page

- `generateMetadata` reads the post and sets title, description, canonical, and Open Graph / Twitter card values including the cover image.
- Add Article JSON-LD (`@type: "Article"`) with headline, image, datePublished, dateModified, and author, following the same pattern the homepage FAQ section uses for its JSON-LD.

---

# Phase 1 data layer — the part that decides how painful Phase 2 is

Read this carefully. The design work is easy; this bit is what saves the rewrite.

Create `src/lib/data/news.ts` containing:

1. The TYPES (these are the contract, and they should not change in Phase 2):

```ts
export type NewsBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'listLead'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string };

export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;        // e.g. "Industry Insight"
  coverImage: string;
  publishedAt: string;     // ISO date string
  readingMinutes: number;
  isHighlight: boolean;    // shows in the Highlights carousel
  content: NewsBlock[];
}
```

2. A dummy array of about 12 posts using the copy from the Figma design (titles from the list page; the HJT article's full body is in the details design).

3. An ASYNC data access layer — every component reads posts only through these functions, never from the array directly:

```ts
export async function getHighlightPosts(): Promise<NewsPost[]>
export async function getPosts(page: number, perPage: number): Promise<{ posts: NewsPost[]; total: number; totalPages: number }>
export async function getPostBySlug(slug: string): Promise<NewsPost | null>
export async function getAdjacentPosts(slug: string): Promise<{ prev: NewsPost | null; next: NewsPost | null }>
export async function getAllSlugs(): Promise<string[]>   // for generateStaticParams
```

They are `async` even though they read a local array in Phase 1. That is deliberate: in Phase 2 only the insides of these five functions change, and not a single component gets touched.

Also: in the details route, call `notFound()` when `getPostBySlug` returns null.

---

# Phase 2 — making it dynamic (read before Phase 1, build after)

Do not build any of this yet. This section exists so Phase 1 is built in the right shape and so the plan is clear.

## What "dynamic blog" actually means

Three moving parts:

1. **Storage** — where the posts live (a database table).
2. **Admin** — a screen where the client writes and publishes posts.
3. **Read path** — the public pages fetching posts from storage instead of a file.

The project already uses Supabase, so it covers storage, auth, and file storage for images in one service. Use it rather than adding a second system.

## The database shape

One table, `posts`:

- `id` uuid primary key, default `gen_random_uuid()`
- `slug` text unique not null
- `title` text not null
- `excerpt` text
- `category` text
- `cover_image` text (public URL of the file in Supabase Storage)
- `content` jsonb (the `NewsBlock[]` array — same shape as Phase 1, which is why the types must not change)
- `reading_minutes` int
- `is_highlight` boolean default false
- `status` text default `'draft'` (`'draft'` or `'published'`)
- `published_at` timestamptz
- `created_at` / `updated_at` timestamptz default `now()`

Index on `slug`, and on `(status, published_at desc)` for the listing query.

Row Level Security: turn RLS on. Public read policy limited to `status = 'published'`. Insert / update / delete allowed only for authenticated admin users. This is the part people forget and then leak drafts.

Images: a Supabase Storage bucket called `news`, public read. The admin uploads a file, gets back a public URL, and that URL is what goes into `cover_image` or into an `image` block.

## The read path

Rewrite only the five functions in `src/lib/data/news.ts` to query Supabase with the server-side client. Everything else stays.

- List page: `getPosts(page, perPage)` runs a `select` with `.eq('status','published').order('published_at', { ascending: false }).range(from, to)` and a count for the total.
- Details page: `getPostBySlug` runs `.eq('slug', slug).eq('status','published').single()`.
- `generateStaticParams` uses `getAllSlugs` so published posts are pre-rendered.
- Caching: use ISR with a revalidate window (for example 60 seconds) so new posts appear without a redeploy, and revalidate the affected paths from the admin after a publish.

## The admin

Per the project's work order, admin and auth come last, after the data model is settled. When you get there:

- A protected route group (for example `/admin`), guarded by Supabase Auth. Only the client's account can log in; no public sign-up.
- Screens: list of posts with status, create/edit form, delete with confirmation.
- The editor writes the `content` blocks. Simplest workable version: a repeatable block editor with a type dropdown (heading, paragraph, list lead, list, image) matching the `NewsBlock` union. Do not reach for a heavy rich text editor first; the block editor maps one-to-one to what the page renders, so nothing gets lost in translation.
- After save/publish, trigger revalidation of `/news` and `/news/[slug]`.

## Order of work

1. Phase 1: static design with the dummy data file and the async data layer. (This document.)
2. Create the Supabase table, RLS policies, and storage bucket. Seed it with the dummy posts.
3. Swap the five data functions to Supabase. The public site is now dynamic, still with no admin.
4. Build the admin (auth first, then CRUD, then image upload).

Doing it in that order means the site is never broken, and at every step there is something working to show the client.

---

# Build order for Claude Code

1. Read the existing homepage sections to match conventions (Container, Reveal, Heading, Text, SectionEyebrow, i18n usage, image handling).
2. Create `src/lib/data/news.ts` with the types, the dummy posts, and the five async functions exactly as specified.
3. Build the shared card components under `src/components/sections/news/` (`HighlightCard`, `NewsCard`, `NewsCarousel`, `Pagination`, `ArticleBody`, `ShareLinks`, `PostNav`).
4. Build the list page: Banner, Highlights, All News.
5. Build the details page: Hero, ArticleBody, PostNav, plus `generateMetadata`, `generateStaticParams`, Article JSON-LD, and `notFound()` handling.
6. Add the `news` i18n namespace for static UI labels only.
7. Verify: content width matches the homepage, no horizontal scroll at 360px / 768px / 1024px / 1440px / 1920px, the carousel is swipeable and its buttons work, pagination works via `?page=`, all animations match homepage timing.
8. Run only `npx tsc --noEmit`. Do NOT run `npm run build`.
