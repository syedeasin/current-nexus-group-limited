# Why Choose CNX — About page build guide

Route: `app/[locale]/about/why-choose-cnx/page.tsx` (scaffold already exists).
Figma page node: `1:3324`. Section nodes are listed per section below.

## IMPORTANT — read this first (reuse over rebuild)

Every section on this page is (almost) identical in content and layout to a section that ALREADY EXISTS on the current homepage. Do NOT rebuild from scratch. For each section:

1. Find the matching existing homepage section component under `src/components/sections/home/**`.
2. If it exists and matches this spec, REUSE it (import it into this page). If it is used on more than one page, you may move it to `src/components/sections/shared/**` and update the homepage import too, but only if that is low risk.
3. Only build a section from the spec below if no matching homepage component exists or the content genuinely differs.

The per-section Figma spec is included as a fallback and as a checklist to verify the existing component still matches the design.

## Global rules (apply to every section)

- Content width: wrap each section's content in the shared `Container` (`@/components/layout/Container`, max-w 1440) so width matches the homepage exactly. Full-bleed backgrounds/gradients go on the outer `<section>`; the inner content goes inside `Container`. This keeps the content column identical across the whole site.
- Responsive (all devices): mobile-first. Multi-column grids collapse to 1 column on mobile and 2 on tablet where it reads well, full columns on desktop (lg/xl). Headings scale down on small screens. The page must never scroll horizontally.
- Animation (must be consistent site-wide): use the existing `Reveal` component (`@/components/ui/Reveal`). Defaults: `variant="up"` for text/cards, `variant="scale"` for images. Stagger sibling items with delay steps of about 80ms (cap the total stagger around 400ms). Match the homepage timing exactly. `Reveal` already respects `prefers-reduced-motion`; do not add other animation libraries.
- Use existing UI primitives: `Heading`, `Text`, `SectionEyebrow`, `Container`, `Reveal`, and the shared button component. Prefer design tokens over raw hex where a token exists.
- i18n: all copy through `next-intl`. Reused sections keep their existing home namespace. New copy for this page goes under `about.whyChooseCnx`.
- Images: reuse the existing `/public` homepage images for the shared sections (same photos). Figma asset URLs expire in ~7 days, so never hotlink them; export any genuinely new image from Figma into `/public/images/about/` (or reuse the home image).
- Claude Code rule: after edits run only `npx tsc --noEmit`. Do NOT run `npm run build` — the dev server is running and a production build corrupts the `.next` cache.

## Design tokens (from Figma, for reference)

Colors: Neutral1 `#0A0D1B`, Neutral3 `#3B3D49`, Neutral4 `#54565F`, Neutral9 `#CECFD1`, Neutral10 `#E7E7E8`, Neutral11 `#F3F3F4`, White `#FFFFFF`, Secondary/gold `#D5AC5D`, Tertiary/eyebrow `#7A83CC`, Background2 `#F8F8F8`.

Type (Switzer): H1 64/72 semibold, tracking -3. H2 48/56 semibold, tracking -1.5. H5 24/32 semibold, tracking -1. H6 20/28 semibold, tracking -0.5. Paragraph1 18/28 regular, tracking -0.5. Paragraph-lg 20/32 regular, tracking -0.5. Eyebrow/Badge 16/24 medium uppercase, tracking -0.08.

Section vertical padding: 100px desktop (`py-100`), scale down to `py-64` md and `py-48` mobile, matching the homepage sections.

---

## Section order (top to bottom)

1. Hero
2. Our Competitive Advantage (6 cards)
3. Beyond Products (5 steps + image)
4. Global Confidence (stats + globe)
5. Awards (3 cards)
6. Case Study (image overlay card)
7. CTA
(Footer is the global layout footer — already present, do not add.)

---

## 1. Hero — node 47:2864

Reuse: mirrors the homepage hero ("Your trusted partner for smarter energy solutions"). Reuse the homepage hero component/pattern, especially its transparent-header overlay handling. Build from spec only if the homepage hero differs.

Spec:
- Full-width `<section>`, base background `#0A0D1B`, `position: relative`, `overflow: hidden`, min-height ~660px on desktop (the global transparent header overlays the top). On mobile use a comfortable min-height and stack naturally.
- Background image: aerial private house with solar panels, anchored right (covers roughly the right 80% on desktop). Overlays:
  - Left-to-right darkening gradient so the left text stays readable: `linear-gradient(270deg, rgba(10,13,27,0.2) 0%, rgba(10,13,27,0.8) 50%, rgba(10,13,27,0.9) 65%, #0A0D1B 80%)`.
  - A subtle top gradient (`rgba(10,13,27,0)` to `rgba(10,13,27,0.64)`) for header legibility.
- Content inside `Container`, left-aligned, vertically centered, text block max-width ~771px:
  - Eyebrow: icon + `WHY CHOOSE CNX`, Tertiary `#7A83CC`, 16px medium uppercase, gap 8.
  - H1: `Your trusted partner for smarter energy solutions` — 64/72 semibold, tracking -3, white. Responsive: ~36–40px mobile, ~48px md, 64px xl.
  - Subtext: `CNX delivers innovative solar, energy storage, and trusted global renewable solutions.` — 20/32 regular, Neutral9 `#CECFD1`.
  - Gaps: eyebrow→heading block 12; heading→subtext 16; text block→button 40.
  - Button (gold pill): text `Explore Products` 20 semibold `#0A0D1B` + chevron-right icon, bg `#D5AC5D`, px 32 py 18, radius 100. Links to the products page.
- Animation: `Reveal variant="up"` staggered — eyebrow 0ms, heading 80ms, subtext 160ms, button 240ms.

## 2. Our Competitive Advantage — node 47:13274

Reuse: identical to the homepage "Everything you need from one reliable partner" 6-card grid. Reuse that component.

Spec:
- `<section>` bg `#F8F8F8`, `py-100` (responsive down). Content in `Container`.
- Header centered: eyebrow `OUR COMPETITIVE ADVANTAGE` (`#7A83CC`, 16 medium uppercase) + H2 `Everything you need from one reliable partner` (48/56 semibold `#0A0D1B`, centered, max-width ~616px). Eyebrow→heading gap 8. Header→grid gap 48.
- Grid: 3 columns x 2 rows, gap 24. Responsive: 1 col mobile, 2 col tablet, 3 col desktop.
- Card: bg white, border 1.5px `#E7E7E8`, radius 16, padding 32, flex col gap 24. Icon 40px. Title H6 20/28 semibold `#0A0D1B`. Body Paragraph1 18/28 regular `#3B3D49`. Title→body gap 12.
- Cards (title — body):
  1. Advanced Technologies — Industry-leading HJT, TOPCon, and Back Contact innovations for higher efficiency and long-term performance.
  2. Integrated Manufacturing — End-to-end production of cells, modules, and BESS with strict quality control and dependable supply.
  3. OEM & ODM Solutions — Custom products and flexible private-label manufacturing designed specifically for your unique business needs.
  4. Proven Quality — We provide complete traceability, rigorous testing, and international certifications for every product we offer.
  5. Global Supply Network — Reliable logistics and consistent manufacturing support projects worldwide with efficiency and effectiveness.
  6. Technical Partnership — We provide reliable engineering support, prompt communication, and excellent after-sales service throughout your project.
- Animation: `Reveal up` on header, then cards staggered by index (80ms step, cap 400ms).

## 3. Beyond Products — node 47:13343

Reuse: identical to the homepage "More than a manufacturer, a long-term business partner" section. Reuse that component.

Spec:
- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container` (do not hardcode `px-140`; the Container handles side padding).
- Header left: eyebrow `BEYOND PRODUCTS` + H2 `More than a manufacturer, a long-term business partner` (48/56 semibold, max-width ~656px). Eyebrow→heading gap 8. Header→card gap 48.
- White card: bg white, radius 20, padding 48. Inside, two columns gap 60, items-center:
  - Left: list of 5 steps.
    - Step row: icon box (bg `#F8F8F8`, border `#F3F3F4`, radius 8, padding 14, icon 24) + text. Title H6 20/28 semibold `#0A0D1B` (`01. Consultation & Planning` etc.), body 18/28 regular Neutral4 `#54565F`. Icon→text gap 12, title→body gap 4.
    - Divider between steps: 2px full-width `#F3F3F4`. One divider shows a gold progress segment (`#D5AC5D`, ~199px from left) under the active step (step 3 in the design).
  - Right: image, masked/rounded, roughly square (~534px), object-cover.
- Steps (title — body):
  1. 01. Consultation & Planning — Understand your project goals and recommend the right solution.
  2. 02. Product Selection & Customization — Select the ideal products with flexible OEM & ODM customization.
  3. 03. Precision Manufacturing — Manufacture high-quality solar and storage solutions.
  4. 04. Quality & Global Delivery — Rigorous testing and reliable logistics ensure every product performs.
  5. 05. Long-Term Support — Responsive technical assistance and dependable after-sales support.
- Responsive: on mobile/tablet the image stacks below the steps list; list goes full width.
- Animation: `Reveal up` header; step rows staggered; image `variant="scale"`.

## 4. Global Confidence — node 47:33259

Reuse: identical to the homepage "Instead of long marketing paragraphs, use measurable proof" stats section. Reuse that component. (The Figma node was too large to return full code; rely on the existing homepage component and this checklist.)

Spec:
- `<section>` light background (white), `py-100`. Content in `Container` (inner ~1320).
- Header left: eyebrow `GLOBAL CONFIDENCE` + H2 `Instead of long marketing paragraphs, use measurable proof` (48/56 semibold, left aligned).
- Two columns:
  - Left: dotted-globe graphic with an overlay card near the bottom — title `Certified to International Standards` (semibold) + body `CNX products are made to meet global quality, safety, and performance standards, ensuring reliability for residential, commercial, and utility applications.`
  - Right: 6 stat rows, thin divider between each. Each row = large value + label:
    - 06 — Smart Manufacturing Facilities
    - GW+ — Annual Production Capacity
    - 20+ — Countries Served
    - 100% — Production Traceability
    - 25-YR — Performance Warranty
    - ISO+ — International Certifications
- Responsive: stack columns on mobile (globe/card above, stats below).
- Animation: `Reveal up` header; stat rows staggered; globe `variant="scale"` or fade.

## 5. Awards — node 47:43181

Reuse: identical to the homepage "Recognized for excellence in manufacturing & innovation" awards section. Reuse that component.

Spec:
- `<section>` base bg `#F8F8F8`→white with a faint factory photo behind, masked and fading from `#F8F8F8` (top) to transparent — decorative, low contrast.
- Header centered: eyebrow `INDUSTRY RECOGNITION` + heading `Recognized for excellence in manufacturing & innovation` (52/60 semibold, tracking -1.04, centered, max-width ~690px). Eyebrow→heading gap 20.
- Cards row: 3 award cards centered, gap 16. Card: bg white, radius 16, padding 24, flex col items-center gap 32, width ~251px. Logo/image 140px. Caption `Leading Renewable Energy Manufacturer Award` 16/24 semibold centered `#131314`.
- Responsive: 1 col mobile, 3 col desktop, cards centered.
- Animation: `Reveal up` header; cards staggered.

## 6. Case Study — node 47:43210

Reuse: identical to the homepage "Real world HJT project success stories" section. Reuse that component.

Spec:
- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container` (inner ~1320).
- Header centered: eyebrow `CLIENT SUCCESS STORY` + H2 `Real world HJT project success stories` (48/56 semibold, centered).
- Feature image card: full-width, ~600px tall, radius 16, object-cover photo, dark bottom gradient overlay (`rgba(10,13,27,0)` → `rgba(10,13,27,0.9)`). Content overlaid at the bottom (padding ~60px sides):
  - Left text block (max ~704px): title H5 24/32 semibold white `5MW HJT tracker project designed for higher yield` + body 18/28 regular Neutral9 `#CECFD1`: `A European ground-mounted solar project used high-bifaciality HJT modules with local tracker systems to improve power generation and efficiency compared with previous standard N-type module layouts. CNX supported module selection, export coordination, technical documents, and after-sales communication.`
  - A vertical divider line.
  - Right spec list (max ~319px), 3 rows with icons (solar-panel, settings, sun), 18/28 medium white:
    - 324 Vertex N NEG19RC.20 modules
    - 1.3MW System size
    - Q4 2025 Rooftop carport mount
- Responsive: on mobile the overlay content stacks (title, body, then specs); drop the vertical divider; keep text readable over the image (increase overlay darkness if needed).
- Animation: image `variant="scale"`, text `up`.

## 7. CTA — node 47:43277

Reuse: identical to the homepage "Power your next project with CNX" CTA. Reuse that component.

Spec:
- Full-width `<section>`, bg `#0A0D1B`, background machine photo anchored bottom with a dark gradient (transparent top → `#0A0D1B` bottom), masked, ~740px tall.
- Centered content (max ~736px): H2 `Power your next project with CNX` (48/56 semibold white) + subtext 20/32 regular white `From sourcing top solar modules to launching private-label products, CNX offers the technology and expertise your business needs.` Heading→subtext gap 20. Content→buttons gap 32.
- Buttons row (gap 16): primary gold pill `Contact Sales` (bg `#D5AC5D`, text `#0A0D1B`) + secondary outline pill `Explore Products` (bg white 5%, border `#54565F`, white text). Both px 32 py 18, 20 semibold, radius 100.
- Responsive: buttons stack full-width on mobile; heading scales down.
- Animation: `Reveal up` staggered (heading, subtext, buttons).

---

## Build order for Claude Code

1. Confirm which of sections 2–7 already exist as homepage components and note their import paths.
2. Build section 1 (Hero) if the homepage hero cannot be reused as-is.
3. Compose `app/[locale]/about/why-choose-cnx/page.tsx`: render the sections in order inside `<main>`, each in the shared `Container`, reusing existing components where possible.
4. Add any missing i18n keys under `about.whyChooseCnx` (only for genuinely new copy).
5. Verify each section against the spec: content width matches homepage, responsive at mobile/tablet/desktop, animations consistent with the homepage.
6. Run only `npx tsc --noEmit`. Do NOT run `npm run build`.
