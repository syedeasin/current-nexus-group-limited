# Latest News spec

Homepage section 10, below Awards.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8769`
- Frame: 1600 x 766

Read `docs/figma/home/_animation.md` first. Then read `2283:8769` with `get_design_context` and `get_metadata` and pull every exact number from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Structure

```
Section, white background
└── Container size="section"
    ├── Header, centred
    │   ├── eyebrow   NEWS ROOM
    │   └── h2        one line
    └── Post row      three cards, with a progress track underneath
```

## Header

- Eyebrow: `NEWS ROOM`, using `SectionEyebrow`.
- Heading, `h2`, one line: `Latest blog & news`
- Centred.

## Post cards

Three cards in a row. Pull the card width, gap, image radius and aspect ratio from Figma.

Each card:

- Photograph on top, rounded.
- Meta line below: the date, a thin vertical divider, then the read time.
- Title below the meta, two lines. Reserve two lines so the row never ends ragged.
- A thin horizontal rule under each card. Look at Figma carefully: the rule under the **middle** card is darker and shorter than the others. That is the carousel progress indicator, not a per-card border. Treat it as one track spanning the row with a filled segment, exactly like Application Scenes.

### Carousel behaviour

This section behaves the same way as Application Scenes, so reuse that work rather than writing it twice.

- Native `overflow-x: auto` with `scroll-snap-type: x mandatory` and `scroll-snap-align: start`. Hide the scrollbar visually.
- The progress track fill is derived from scroll position, not from an index in state.
- Figma shows no prev and next buttons here, unlike Application Scenes. Do not add them. On desktop, if all three cards fit, the track renders full and the row simply does not scroll.
- If `SceneCarousel` from Application Scenes can be generalised to cover both, do that and tell me what you extracted. If it cannot, say why rather than duplicating the logic silently.

### Card semantics

- The whole card is one link. Mark the image `aria-hidden` so a screen reader does not hear it twice.
- Each card links to `/news` for now. They must be clickable today.
- The date must render with a fixed locale so the server and client agree, otherwise you will get a hydration mismatch. Format it once in a helper, do not call `toLocaleDateString` with the default locale.
- Hover: image scale 1.03 plus the title colour shifting to the secondary token. 250ms.

## Content

This will come from Supabase later. Today, build placeholder data in `lib/data/latestNews.ts` with a typed `BlogPost` interface: `slug`, `title`, `excerpt`, `category`, `date`, `readTime`, `image`. Structure it so swapping in a Supabase query later touches only the data layer, never the component.

Three posts:

1. `July 30, 2026` · `7 min read` — `Why high-efficiency solar modules are transforming utility-scale projects`
2. `July 30, 2026` · `7 min read` — `How HJT solar technology delivers higher energy yield in real-world settings`
3. `July 30, 2026` · `7 min read` — `How to choose the right solar module for commercial energy projet`

Note: post 3 has a typo in Figma, `projet` instead of `project`. Reproduce it as designed and flag it in your report. Do not silently fix it.

All copy into `messages/en.json` under `home.latestNews`, same keys into `zh.json` with English placeholders. Post titles are content, so once Supabase is wired they will come from the database rather than the message file. Note that in the data file.

## Images

Files already exist at `public/images/home`. Do not download from Figma and do not generate anything. Convert to WebP, keep each under 200KB, report the sizes. `next/image` with a correct `sizes` attribute, no `priority`.

## Responsive

- **1440 and 1280**: three across as designed, no scrolling needed.
- **1024**: three across, tighter gap, or two and a half with a peek. Pick one, say which, and keep it consistent with Application Scenes.
- **768**: two across, or one and a half with a peek if that matches Application Scenes better. Consistency between the two carousels matters more than either choice on its own.
- **480 and below**: one card plus a peek, roughly 85% of the viewport width.
- The progress track stays visible whenever the row can scroll, and hides when it cannot.
- Two-line titles must not clip at any width. Verify the longest title at 320.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Header revealed first, then the cards staggered 80ms apart.
- The progress fill transitions over 150ms `ease-out` so it glides.
- Card hover exactly matches Application Scenes so the two sections feel like siblings.

## Files

- `components/sections/home/LatestNews.tsx` — Server Component
- `components/ui/BlogCard.tsx` — image, meta, title, href
- `lib/data/latestNews.ts` — typed array
- `lib/formatDate.ts` — fixed-locale date helper, if one does not already exist

`BlogCard` and the date helper are generic. Tell me whether they belong in `F:\easin-next-starter`.

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no clipped title, no ragged card heights.
- No hydration warning from the date. Check the console specifically for this.
- Every card is clickable across its whole area, and a screen reader hears one name per card.
- The carousel behaviour matches Application Scenes at the same breakpoints.
- Heading order correct: this is an `h2`, each post title is an `h3`.
- No console errors.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
