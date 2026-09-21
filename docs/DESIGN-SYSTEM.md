# Design System

The homepage is the reference implementation. Every value below is measured from
the Figma homepage frame (`CNX Website — Dev`, node `29:2469`, drawn at 1600px)
and lives as a token in `app/globals.css`. New pages inherit the system by using
the shared components — they should not re-derive spacing, type or colour.

**Rule: never hardcode a design value in a component.** If a value is missing
from this document, add the token here first, then use it.

---

## 1. Container

One content column for the whole site: **1320px on desktop**, centred, with the
same gutters everywhere. Nothing else may declare a page width.

```tsx
<Container>…</Container>          // components/layout/Container.tsx
```

The geometry is two custom properties and two classes in `app/globals.css`:

```css
--container-max: 1320px;
--gutter: 20px;              /* 64px from 768px up */

.cnx-container        { max-width: calc(var(--container-max) + var(--gutter) * 2);
                        margin-inline: auto; padding-inline: var(--gutter); }
.cnx-container-inset  { padding-inline: max(var(--gutter),
                        calc((100% - var(--container-max)) / 2)); }
```

`max-width` includes the gutters, so the inner column lands on exactly 1320px
once the viewport is wide enough, and stays fluid with the same gutters below
that.

| Viewport | Gutter | Content width |
|---|---|---|
| >= 1448 | 64 | 1320 (capped) |
| 768–1447 | 64 | 640–1320 |
| < 768 | 20 | fluid |

### Everything is on it

The header row, the mega-menu panel, the mobile bar, the search overlay, every
section, the news grid and the footer all use `.cnx-container`. The header used
to sit on its own `max-w-1600 px-40/px-80` grid, which is why it read as wider
than the page; it no longer does. If you find yourself typing `max-w-1600`,
`max-w-1460` or `xl:px-140`, you are re-introducing the bug this section exists
to prevent.

A `max-w-*` on a *paragraph* is a different thing entirely — that is a reading
measure, not a page width, and is fine.

### Full-bleed

A section's **background** may be full width; its **content** goes in the
container. Backgrounds, hero imagery, decorative graphics and a horizontal
track are all legitimately edge-to-edge.

Full-bleed rails that must still *start* on the content edge — the news carousel
track, the hero's edge arrow rail — use `.cnx-container-inset`
(or `.cnx-container-inset-l` for left only) instead of re-deriving the padding.
It reproduces `.cnx-container`'s edge exactly, from the same two properties, and
uses `%` rather than `vw` so a visible scrollbar cannot knock it out of
alignment.

Carousels that bleed past the right gutter cancel it with
`mr-[calc(var(--gutter)*-1)]`, which tracks the token at every breakpoint.

**Trap:** when an inset element is itself a `scroll-snap-type` container, the
snap port's start edge is its *border* box, not its padding box — the browser
scrolls the first card flush to the viewport edge on load and the inset vanishes
without a trace. Both inset classes therefore carry a matching
`scroll-padding-inline`. It is inert on non-scroll elements, so the pair always
travels together.

## 2. Spacing

Tailwind's spacing base is `1px`, so `p-24` is literally 24px. Use the raw
number, never a `4`-based scale step.

### Section padding (desktop / xl)

| Section | Top | Bottom |
|---|---|---|
| Trusted Logos | 60 | 80 |
| About CNX | 80 | 80 |
| Energy Ecosystem | 80 | 80 |
| Premium Solutions | 80 | 100 |
| Application Scenes | 100 | 80 |
| Client Testimonials | 100 | 100 |
| Why Choose CNX | 100 | 100 |
| Awards | 80 | 100 |
| Latest News | 100 | 80 |
| FAQ | 80 | 100 |
| CTA band | 60 | 120 |

The alternation is intentional: a section that ends on a dense row gets 100px of
air, one that ends on a caption gets 80. Below `xl` these compress to
`py-48` (mobile) and `py-64` (md) unless a section is listed otherwise.

### Recurring gaps

| Purpose | Value |
|---|---|
| Eyebrow → heading | 12 |
| Heading → supporting paragraph | 16 |
| Header block → content | 48 |
| Text block → CTA | 40 |
| Card image → card caption | 24 |
| Caption title → caption body | 12 |
| Product card image → title | 20 (`pt-20`) |
| Card grid gutter | 16 (4-up) / 24 (3-up) |
| Two-column split | 80 (About) / 120 (Why Choose) / 100 (FAQ) |

## 3. Typography

Switzer variable, loaded through `next/font/local`. The scale ramps at three
tiers — base, `>= 48rem`, `>= 80rem` — so a single class name (`text-h2`) is
responsive on its own. **Never add a responsive font-size to a component.**

Letter-spacing in Figma is a *percentage of the font size*, so each tier carries
its own px value: H2 is -1.5%, H6/P1–P3/btn-sm/badge are -0.5%, P4 is 0, and
everything else is -1%.

| Token | Base | >= 768 | >= 1280 |
|---|---|---|---|
| `text-h1` | 36/44 | 48/56 | 64/72 |
| `text-h2` | 32/40 | 40/48 | 48/56 |
| `text-h3` | 28/36 | 32/40 | 40/48 |
| `text-h4` | 24/32 | 28/36 | 32/40 |
| `text-h5` | 20/28 | 24/32 | — |
| `text-h6` | 18/26 | 20/28 | — |
| `text-p1` | 20/32 | 22/34 | 24/36 |
| `text-p2` | 18/28 | 20/32 | — |
| `text-p3` | 16/24 | 18/28 | — |
| `text-p4` | 14/20 | 16/24 | — |
| `text-btn-lg` | 20/24 | — | — |
| `text-btn-sm` | 18/24 | — | — |
| `text-badge` | 16/24 | — | — |

Weights: headings are semibold (600). The **hero H1 is the one bold (700)** on
the page — that is a deliberate single accent, applied at the call site, not in
`Heading`.

Component mapping:

- `<Heading level size>` — level is semantics, size is appearance. Never let a
  visual choice change the document outline.
- `<Text size>` — paragraphs. `p2` is the default body size.
- `<SectionEyebrow>` — the pinging dot + uppercase `text-badge` label in
  `text-tertiary`. Every section header starts with one.

## 4. Colour

| Token | Value | Used for |
|---|---|---|
| `primary` | `#1B2B69` | brand navy (badges, links) |
| `secondary` | `#D5AC5D` | the single accent — CTAs, active states, focus |
| `tertiary` | `#7A83CC` | section eyebrows only |
| `surface-1` | `#EAEDF8` | stat dividers, badge fills |
| `surface-2` | `#F8F8F8` | the light section background |
| `neutral-1` | `#0A0D1B` | body text, dark section background |
| `neutral-3` | `#3B3D49` | secondary copy on light |
| `neutral-4` | `#54565F` | metadata (dates, inactive tabs) |
| `neutral-9` | `#CECFD1` | secondary copy on dark |
| `neutral-10` | `#E7E7E8` | hairlines, card borders, progress tracks |

Section backgrounds alternate to give the page rhythm:
`hero (photo) → surface-2 → surface-2 → photo → neutral-1 → surface-2 →
surface-2 → neutral-1 → white → white → white → photo`.

On dark surfaces, glass panels are `bg-white/5` with a `border-white/17`
hairline and a `backdrop-blur-[10.45px]`.

## 5. Radius

| Token | Used for |
|---|---|
| `rounded-8` | FAQ question cards, brand rail pills |
| `rounded-12` | **all card images** and the contact card |
| `rounded-16` | large panels — testimonial photo, brand panel, award cards |
| `rounded-full` | buttons, progress tracks, avatars, pagination |

Card images are 12px everywhere; only full panels go to 16.

## 6. Buttons

`components/ui/Button.tsx` is the only place button geometry is defined.

| Size | Height | Padding | Text | Icon |
|---|---|---|---|---|
| `xl` | 60 | `px-32` | `text-btn-lg` (20) | 20 |
| `lg` | 48 | `px-24` | `text-btn-sm` (18) | 20 |
| `sm` | 40 | `px-20` | `text-btn-sm` (18) | 20 |

Import `BUTTON_ICON_SIZE` rather than typing a number — the design uses a 20px
icon at every button size.

| Variant | Appearance |
|---|---|
| `primary` | `bg-secondary`, dark label — the page's main action |
| `secondary` | glass pill for dark sections (white 5% / white 17% / blur) |
| `outline` | secondary border, fills on hover |
| `ghost` | text only |

Interaction is uniform and deliberately quiet: colour shift on hover, a 2%
squeeze on press (`active:scale-[0.98]`), and a 2px `secondary` **outline** —
not a ring — on keyboard focus so it stays visible on light and dark alike.

## 7. Cards

Three card shapes share one hover language (`lib/motion/interactions.ts`):

| Card | Image | Notes |
|---|---|---|
| `ProductCard` | `318×396` (ecosystem) / `280×332` (brands) | 1.5px border overlay, centred caption |
| `SceneCard` | `424×300` | arrow-up-right badge appears on hover |
| `BlogCard` | `424×300` | date + read time, title tints to `secondary` |

All three: 12px image radius, 4px lift on hover/focus, 4% image push-in, and a
`focus-visible` outline offset clear of the artwork.

## 8. Carousel

`components/ui/Carousel.tsx` backs every horizontal row. Cards are sized in
percentages so the row reflows with the container:

```
w-[85vw] min-[481px]:w-[64%] lg:w-[36%] xl:w-[32.1%]      // card
gap-[12px] min-[481px]:gap-[16px] lg:gap-[20px] xl:gap-[1.82%]  // gutter
```

At 1320 that resolves to exactly 424px cards with 24px gutters.

Two progress treatments, both driven by the same scroll state:

- `progressVariant="bar"` — one full-width track plus prev/next buttons
  (Application Scenes).
- `progressVariant="segments"` — one 2px rule per card, aligned to the card
  columns (Latest News). These are part of the card design, so they render even
  when nothing overflows.

## 9. Breakpoints

| Name | Width | What changes |
|---|---|---|
| — | < 481 | single column, 85vw carousel cards |
| `min-[481px]` | 481 | 2-up grids, side-by-side buttons |
| `md` | 768 | 64px gutters (the desktop value), second type tier |
| `lg` | 1024 | 3-up grids, two-column splits, desktop hero |
| `xl` | 1280 | third type tier, **desktop header** |
| `min-[1400px]` | 1400 | header widens to its 80px design gutter |
| — | 1448 | container reaches its 1320 cap |

The desktop navigation needs ~1150px of row for the logo, six mega-menu labels
and the action cluster. Below `xl` it does not fit, so the compact bar with the
drawer owns everything under 1280 — that boundary is why `xl`, not `lg`, is the
header switch. `useHeaderScroll` reads the same 1280 query for its 56/88px
header height.

## 10. Accessibility

- `Heading` separates level from size; the homepage is one `h1` (hero) followed
  by twelve section `h2`s.
- Every section carries an `aria-label` matching its visible heading.
- Decorative images are `alt=""` + `aria-hidden`; only content photos get real
  alt text.
- Focus is always visible: a 2px `secondary` outline, offset from the element.
- Tabs implement the ARIA tabs pattern with roving `tabIndex` and arrow keys;
  accordions use `aria-expanded` / `aria-controls`.
- Interactive targets are >= 44px.
- Reduced motion is honoured globally (see `docs/ANIMATION-SYSTEM.md`).
