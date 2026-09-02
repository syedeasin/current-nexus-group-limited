# News route audit — Phase D2-B, CHECKPOINT D2B-3

Question: does `app/[locale]/(marketing)/news/[slug]/page.tsx` pull `Post.content`
from the database, or is it still static from the original build?

## Finding: static. Not DB-driven.

- Data source: `lib/data/news.ts` — a hardcoded `NewsPost[]` array (Phase 1 dummy
  data per `docs/figma/news-and-news-details.md`). `getPostBySlug`, `getAllSlugs`,
  `getAdjacentPosts` all read this in-memory array, never Prisma.
- Content shape is **not** an HTML string. Each post's `content` is a
  `NewsBlock[]` — a discriminated union (`heading` / `paragraph` / `listLead` /
  `list` / `image`) rendered by `ArticleBody` as `blocks`, structurally
  unrelated to the Tiptap HTML string the dashboard's `Post.content` column
  now stores.
- No `dangerouslySetInnerHTML` of post body content on this route (the
  `dangerouslySetInnerHTML` present is JSON-LD structured data, unrelated).
- The file itself already documents the intent: "Every component reads posts
  only through the functions below, never this array directly, so Phase 2
  only has to rewrite the function bodies to query Supabase."

## Implication for D2B-5

Per spec, this route is not touched this phase — no rewiring of its data
source. The `.prose-content` CSS class (D2B-5) and D2B-3's server-side
sanitisation are prepared and ready for whenever this route is reconnected to
`Post.content`, but there is currently nothing on the public site rendering
that column, so there's no live HTML-injection surface here yet — the
sanitiser boundary matters once this route is rewired to Prisma, not before.

Connecting `/news/[slug]` to the database is out of scope for this phase
(per section 9, "Connecting the public news page to the database as its data
source") and is its own later phase.
