# Manufacturing category pages — Solar Panels + BESS

Figma nodes: Solar Panels `1:1220`, BESS `1:1345`.

## The single most important thing in this document

These two pages are **structurally identical**. Same banner, same 2x2 product card grid, same "Why choose CNX energy" block, same CTA. Only the copy, the images, and the four product cards differ.

So do NOT build two pages. Build **one reusable category page template** driven by data, and render both routes through it. The BC / HJT / TOPCon / ODM and the four BESS child pages come next, and more categories will follow, so this template pays for itself immediately.

If you build these as two hand-written pages, you will rewrite them when the third category arrives. Do not do that.

## Routes

- `app/[locale]/manufacturing/solar-panels/page.tsx`
- `app/[locale]/manufacturing/bess/page.tsx`
- `app/[locale]/manufacturing/page.tsx` — permanent redirect to `/manufacturing/solar-panels` (Manufacturing is a nav parent, not a page).

Child routes exist in the sitemap but are NOT part of this build:
`/manufacturing/solar-panels/bc`, `/hjt`, `/topcon`, `/odm-vertical-solar-modules`,
`/manufacturing/bess/residential`, `/112kwh`, `/261kwh`, `/488kwh`.
The "Learn more" buttons on the product cards must already point at these slugs so nothing needs rewiring later.

Also update the header nav "Manufacturing" dropdown to link to the two category pages, locale-aware, matching how the existing nav links work.

## Global rules (same as every other page in this project)

- Content width: wrap all content in the shared `Container` (`@/components/layout/Container`, max-w 1440). Full-bleed backgrounds and gradients go on the outer `<section>`; content goes inside `Container`. Never hardcode `px-140` — the Container owns side padding. The content column must match the homepage exactly.
- Responsive, all devices: mobile-first, no horizontal scroll at any width. Per-section behaviour is written below.
- Animation: use the existing `Reveal` component (`@/components/ui/Reveal`) with homepage timings. `variant="up"` for text and cards, `variant="scale"` for images, siblings staggered 80ms with the total stagger capped around 400ms. No new animation libraries.
- Use existing primitives: `Container`, `Heading`, `Text`, `SectionEyebrow`, `Reveal`, and the existing button component.
- i18n: all copy through `next-intl`, namespaced `manufacturing.solarPanels` and `manufacturing.bess`. Each namespace also carries a `meta` object with title and description for `generateMetadata`.
- Images: do not hotlink Figma asset URLs (they expire in about 7 days). Put images in `/public/images/manufacturing/` and reference them from the data file. Use `next/image` with correct `sizes`.
- Reuse before you build: the CTA at the bottom of both pages is close to the homepage CTA. Check the existing homepage CTA component first and reuse it with different copy if it fits.
- Claude Code rule: run only `npx tsc --noEmit`. Do NOT run `npm run build` — the dev server is running and a production build corrupts the `.next` cache.

## Design tokens

Colors: Neutral1 `#0A0D1B`, Neutral3 `#3B3D49`, Neutral10 `#E7E7E8`, White `#FFFFFF`, Secondary/gold `#D5AC5D`, Tertiary/eyebrow `#7A83CC`, Background2 `#F8F8F8`, white-5% overlay `rgba(255,255,255,0.05)`, white-17% border `rgba(255,255,255,0.17)`.

Type (Switzer): H1 64/72 semibold tracking -1.92. Section heading 52/60 medium tracking -1.04. H2 48/56 semibold tracking -0.72. H5 24/32 semibold tracking -0.24. H6 20/28 semibold tracking -0.1. Body 18/28 regular tracking -0.09. Button 18/24 semibold and 20/28 semibold. Eyebrow 16/24 medium uppercase tracking -0.08.

---

# The data model (build this first)

Create `src/lib/data/manufacturing.ts`:

```ts
export interface ProductCard {
  slug: string;          // e.g. "bc" -> /manufacturing/solar-panels/bc
  titleKey: string;      // i18n key
  descriptionKey: string;
  image: string;         // /images/manufacturing/...
  featured?: boolean;    // true renders the gold Learn more button
}

export interface CategoryFeature {
  icon: string;          // icon component name or /public svg path
  titleKey: string;
  descriptionKey: string;
}

export interface ProductCategory {
  slug: 'solar-panels' | 'bess';
  namespace: string;         // "manufacturing.solarPanels"
  bannerImage: string;
  whyChooseImage: string;
  ctaImage: string;
  products: ProductCard[];
  features: CategoryFeature[];   // the three items under the Why choose image
}

export const productCategories: Record<string, ProductCategory> = { ... }
export async function getCategory(slug: string): Promise<ProductCategory | null>
```

Each route file is then tiny: fetch its category, pass it to the shared template. Use `notFound()` if the category is missing.

Build the template at `src/components/sections/manufacturing/CategoryPage.tsx` (a server component) composed of the four section components below, each in its own file under the same folder.

---

# Section 1 — Banner

Identical structure to the News banner and the Why Choose CNX banner. If one of those already exists as a reusable `PageBanner` component, REUSE it and pass eyebrow, heading, and image as props. If not, build it here as a reusable `PageBanner` because at least four pages now need it.

- Full-width `<section>`, `relative`, `overflow-hidden`, base bg `#0A0D1B`. Height 548px desktop (the transparent global header, 88px, overlays the top). Mobile: min-height around 380 to 420px.
- Background photo anchored right, `object-cover`. Solar Panels uses an aerial solar farm in hills; BESS uses a factory interior photo.
- Two overlays over the photo:
  1. `linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80.364%)`
  2. Top strip 167px: `linear-gradient(to top, rgba(10,13,27,0) 0%, rgba(10,13,27,0.64) 96.876%)`
- Content in `Container`, bottom-left aligned, desktop padding top 140 / bottom 120, text block max-width 855px, gap 12:
  - Eyebrow: 16px icon + label, `#7A83CC`, 16/24 medium uppercase, gap 8.
    - Solar Panels: `SOLAR PANELS`
    - BESS: `BESS`
  - H1: 64/72 semibold white, tracking -1.92. Responsive: about 32 to 36px mobile, 44px md, 64px xl.
    - Solar Panels: `High-Performance solar panels for your every project`
    - BESS: `Intelligent battery energy storage for every project`
- Animation: `Reveal up`, eyebrow 0ms, heading 80ms.

# Section 2 — Product grid

- `<section>` bg white, padding top 80 / bottom 100 desktop. Content in `Container`.
- Grid: 2 columns desktop, gap 24 both axes. Tablet 2 columns with a shorter card; mobile 1 column.
- Card (a single link to `/manufacturing/{category}/{slug}`):
  - Container: bg `#F8F8F8`, `rounded-16`, padding 32, height 694px desktop, `overflow-hidden`, `relative`. On mobile let the height be driven by content with a fixed image area, do not keep 694px.
  - Product image: sits in the upper area, centered, roughly 363 x 418 desktop, `object-contain`. On mobile scale it down proportionally.
  - Text block at the bottom, centered, gap 20:
    - Title 24/32 semibold `#0A0D1B` tracking -0.24.
    - Description 18/28 regular `#3B3D49`, max-width around 456px, centered. Title to description gap 8.
    - Button pill, px 24 py 12, `rounded-full`, label 18/24 semibold + chevron-right 20px:
      - The FIRST card is the featured one: bg `#D5AC5D`, text `#0A0D1B`.
      - The other three: white bg, 1px border `#E7E7E8`, text `#0A0D1B`.
      - Hover on the outline variant: background shifts to `#F3F3F4`. Hover on the gold: slight darken.
  - Card hover: image scales to 1.03 over 300ms, `cursor-pointer`. The whole card is the link, so the button is decorative markup inside it (do not nest an `<a>` inside an `<a>`).
- Animation: cards staggered by index, `Reveal up`.

## Solar Panels cards

1. `bc` (featured) — **BC Solar Panels** — Maximum efficiency with sleek, busbar-free BC technology for premium performance.
2. `hjt` — **HJT Solar Panels** — Advanced HJT technology reduces degradation and maximizes lifetime energy output.
3. `topcon` — **TOPCon Solar Panels** — TOPCon technology combines efficiency, reliability, and value for commercial and utility-scale applications.
4. `odm-vertical-solar-modules` — **ODM / Private Label Solar Modules** — Launch premium solar products faster with customized OEM and ODM manufacturing.

## BESS cards

1. `residential` (featured) — **Residential BESS** — Compact home battery systems maximizing solar self-consumption, backup power, and energy costs.
2. `112kwh` — **112kWh Commercial BESS** — Efficient energy storage reducing peak demand, optimizing usage, and improving resilience.
3. `261kwh` — **261kWh Commercial BESS** — Deliver greater energy flexibility with a scalable battery solution for commercial applications.
4. `488kwh` — **488kWh Utility BESS** — High-capacity battery systems for renewable integration, grid stability, and large-scale storage.

# Section 3 — Why choose CNX energy

Same on both pages. Build it once as `WhyChooseCategory` and pass the image plus the three features.

- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container`, gap 48.
- Header centered, max-width 702px, gap 12:
  - Eyebrow: 16px icon + `WHY CHOOSE CNX ENERGY`, `#7A83CC`, 16/24 medium uppercase.
  - Heading: `Your manufacturing partner for long-term success` — 52/60 medium `#0A0D1B`, tracking -1.04, centered. Responsive: about 28px mobile, 36px md, 52px xl.
- Below the header, a column with gap 48:
  - Wide image: full Container width, height 500px desktop, `rounded-16`, `object-cover` (manufacturing line photo). On mobile use an aspect ratio (about 1320/500) instead of a fixed height.
  - Three-feature row: `flex`, gap 48, with a thin full-height vertical divider `#E7E7E8` between items. Each item: 24px icon + text, gap 20, icon aligned to the top (`pt-2`).
    - Feature text: title 20/28 semibold `#0A0D1B`, body 18/28 regular `#3B3D49`, gap 8.
  - Features (both pages use the same three, per the design):
    1. **Advanced HJT technology** — Higher efficiency and greater energy generation through solar innovation.
    2. **Lower LCOE. Higher ROI.** — Reduce lifetime energy costs while maximizing long-term project returns.
    3. **Global supply capability** — Reliable manufacturing and worldwide delivery for projects of every scale.
  - Note for the client review: feature 1 mentions HJT specifically, which reads oddly on the BESS page. Keep it as designed for now, but flag it and make it data-driven so a BESS-specific line can be swapped in without touching the component.
- Responsive: three features become one column on mobile and two on tablet; replace the vertical dividers with horizontal ones (or drop them) when stacked.
- Animation: `Reveal up` on the header, `variant="scale"` on the image, features staggered.

# Section 4 — CTA

Check the homepage CTA component first — this is the same pattern with different copy and a different background photo. Reuse it if the props allow.

- Full-width `<section>`, bg `#0A0D1B`, `relative`, `overflow-hidden`, height 740px desktop. Factory photo anchored bottom, `object-cover`.
- Gradient over the photo: `linear-gradient(to bottom, rgba(10,13,27,0) 15.444%, rgba(10,13,27,0.86) 72.236%, #0A0D1B 100%)`.
- Centered content in `Container`, max-width 846px, gap 32:
  - Heading: `Your next energy project starts with the right manufacturing partner` — 48/56 semibold white, tracking -0.72, centered. Responsive down to about 26 to 28px mobile.
  - Buttons row, gap 16, centered:
    - Primary: `Request a quote` — bg `#D5AC5D`, text `#0A0D1B` 20/28 semibold, px 28 py 16, `rounded-full`, subtle backdrop blur.
    - Secondary: `Explore our solutions` — bg `rgba(255,255,255,0.05)`, border 1px `rgba(255,255,255,0.17)`, white text, same padding and radius.
- Responsive: buttons stack full-width on mobile; heading scales down; section height becomes content-driven with generous vertical padding.
- Animation: `Reveal up` staggered (heading, then buttons).

---

# Build order for Claude Code

1. Read the homepage sections first to match conventions (Container, Reveal, Heading, Text, SectionEyebrow, i18n, `next/image` usage). Note whether a reusable `PageBanner` and a reusable CTA already exist.
2. Create `src/lib/data/manufacturing.ts` with the types, both categories, and `getCategory`.
3. Build the section components under `src/components/sections/manufacturing/`: `PageBanner` (or reuse), `ProductGrid`, `ProductCard`, `WhyChooseCategory`, `CategoryCta` (or reuse the homepage CTA).
4. Build `CategoryPage.tsx` composing the four sections from a `ProductCategory`.
5. Create the two routes plus the `/manufacturing` redirect, each with `generateMetadata` from its i18n `meta` keys.
6. Add the i18n namespaces `manufacturing.solarPanels` and `manufacturing.bess`.
7. Wire the header nav "Manufacturing" dropdown to the two category pages, and point every "Learn more" button at its child slug (those pages do not exist yet, which is expected).
8. Verify: both pages render from the same template, content width matches the homepage, no horizontal scroll at 360 / 768 / 1024 / 1440 / 1920, animations match homepage timing.
9. Run only `npx tsc --noEmit`. Do NOT run `npm run build`.

## Reminder for the starter kit

`PageBanner`, `ProductCard`, and the generic category template pattern have no client-specific names, colors, or data in them once the content is passed as props. After these pages are working, copy the generic versions into `F:\easin-next-starter`.
