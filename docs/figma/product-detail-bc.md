# Product detail page — Solar Panels > BC

Figma page node: `1:1470` ("BC Solar Panels"). Route: `app/[locale]/manufacturing/solar-panels/bc/page.tsx`.

## Read this before writing any code

### 1. This is a TEMPLATE, not a one-off page

Seven more product pages are coming with this exact structure: HJT, TOPCon, ODM Vertical Solar Modules, Residential BESS, 112kWh, 261kWh, 488kWh. Build this as a **reusable product detail template driven by a data file**, exactly like the category template. If you hand-write this page, you will rewrite it seven times.

- Data: `src/lib/data/products/` — one file per product exporting a typed `ProductDetail` object, plus `getProductDetail(category, slug)`.
- Template: `src/components/sections/product/ProductDetailPage.tsx` composing the section components.
- Route file: fetch the product, `notFound()` if missing, render the template. Nothing else.
- Every section component takes props. No hardcoded copy anywhere in a component.
- Sections a given product does not have (a product with no comparison charts, for example) are simply omitted from its data and the template skips them. Make each section optional.

### 2. Content warning — the Figma frame is mislabelled

The frame is named "BC Solar Panels" but **every single piece of copy inside it is about HJT**: the eyebrow says "HJT Solar Panels", the heading says "…with HJT", the comparison section is "Why Choose HJT Technology", the products are "G12-0BB Uranus Pro" and "Venus Pro" HJT modules. This is the HJT page content sitting in a frame named BC.

Build it as the data file says, wire it to the `bc` route as instructed, and flag it to Easin. He needs to confirm with the client whether this content belongs on `/bc` or `/hjt` before launch. Do not silently "fix" the copy to say BC.

### 3. Other copy issues to flag, not fix

Keep these verbatim in the data file, but list them in your final report so Easin can raise them with the client:

- Case study headline says `5MW HJT tracker project` but the spec list says `1.3MW System size`.
- Case study body says `ground-mounted` but the spec says `Rooftop carport mount`.
- Case study spec says `324 Vertex N NEG19RC.20 modules` — "Vertex N" is a Trina Solar product line, not CNX.
- FAQ answers 3 and 11 contain the words "template" ("The utility HJT template", "The template page uses").
- FAQ contact card bio says `Hi, I'm Emma, Customer care of Kelana  Reach out anytime.` — wrong company name, double space, missing period.
- Specs table row "Maximum system voltage" has its label duplicated as its value.
- `HJT week-light gain` is almost certainly meant to be "weak-light".
- Several spec table "Note" column cells are internal instructions to the designer ("Replace with final bill of materials", "Create separate tabs if both series are sold"). These must NOT be visible on the live site. Put them in the data file behind an `internalNote` field that the component does not render, or drop the Note column entirely and confirm with the client.

---

## Global rules

- **Content width:** wrap every section's content in the shared `Container` (`@/components/layout/Container`, max-w 1440). Full-bleed backgrounds and gradients go on the outer `<section>`; content goes inside `Container`. Never hardcode `px-140` or `w-[1320px]`. The content column must match the homepage and every other page exactly.
- **Responsive, all devices:** mobile-first, no horizontal scroll at 360 / 768 / 1024 / 1440 / 1920. Every section below has explicit mobile behaviour. Tables and charts get their own `overflow-x-auto` wrapper so the page body never scrolls sideways.
- **Animation:** use the existing `Reveal` component (`@/components/ui/Reveal`) with homepage timings. See the animation section below for exactly what gets which variant.
- Use existing primitives: `Container`, `Heading`, `Text`, `SectionEyebrow`, `Reveal`, existing button and accordion components.
- **Reuse before building:** Awards, Case study, FAQ, and the bottom CTA already exist on the homepage. Check those components first and reuse them with different props. Only build new if the existing one genuinely cannot take this content.
- i18n: all copy through `next-intl` under `products.solarPanels.bc`. Long spec tables and FAQ arrays live in the data file, not in the message JSON — keep i18n for UI chrome (button labels, column headers, section eyebrows).
- Images: never hotlink Figma asset URLs (they expire in about 7 days). Put images in `/public/images/products/bc/`. Use `next/image` with correct `sizes`.
- **No chart library.** Every chart on this page is simple static bars. Build them with divs and CSS. Adding Recharts or Chart.js for this is 40KB of JavaScript for something CSS does in 20 lines.
- Claude Code rule: run only `npx tsc --noEmit`. Do NOT run `npm run build` — the dev server is running and a production build corrupts the `.next` cache.

## Animation rules (apply consistently, this is a long page)

The page is tall, so animation discipline matters more here than anywhere else. Over-animating a 19,000px page makes it feel slow and cheap.

- Every top-level section header (eyebrow + heading + intro) gets `Reveal variant="up"`, eyebrow 0ms, heading 80ms, intro 160ms.
- Card grids, list items, spec rows, chart bars, and step columns stagger by index: `delay = base + min(index * 80, 400)`.
- All images and photo blocks get `Reveal variant="scale"`.
- Table rows: animate the table container as one `Reveal up`, NOT row by row. A 12-row table animating row by row looks like a loading bug.
- Chart bars: animate their height from 0 to final on first scroll into view, 500ms ease-out, staggered 80ms per bar. Use a CSS transition on `height` triggered by the same intersection observer pattern `Reveal` already uses; do not add a new library.
- Statistics counters in the hero: keep them static text. Do not add count-up animation, it fights with the hero CTA for attention.
- Everything respects `prefers-reduced-motion` — `Reveal` already does; the chart bar transition must check it too.

## Design tokens

Colors: Neutral1 `#0A0D1B`, Neutral2 `#232532`, Neutral3 `#3B3D49`, Neutral4 `#54565F`, Neutral6 `#84868D`, Neutral8 `#B6B6BB`, Neutral9 `#CECFD1`, Neutral10 `#E7E7E8`, Neutral11 `#F3F3F4`, White `#FFFFFF`, Secondary/gold `#D5AC5D`, Tertiary/eyebrow `#7A83CC`, Background2 `#F8F8F8`.

Chart-only colors (not in the token set, add them as `chart-perc`, `chart-topcon`, `chart-hjt`, `chart-bc`): PERC `#A5B3BE`, TOPCon `#5387BB`, HJT `#00AAB8`, BC `#1C3C55`.

Type (Switzer): H2 48/56 semibold ls -0.72. H4 32/40 semibold ls -0.32. H5 24/32 semibold ls -0.24. H6 20/28 semibold ls -0.1. Body-lg 20/32 regular ls -0.1. Body 18/28 regular ls -0.09. Body-md 18/28 medium ls -0.09. Small 16/24 regular ls -0.08. Eyebrow 16/24 medium uppercase ls -0.08. Button-lg 20/24 semibold ls -0.2. Button-sm 18/24 semibold ls -0.09.

**Font note:** the Awards section uses Stack Sans Headline and TASA Orbiter in Figma while everything else uses Switzer. That is a Figma inconsistency. Use the existing homepage Awards component's fonts and ignore the mismatch.

---

# Section 1 — Hero (node 1:1472)

Dark hero with product shot, stats row, and two CTAs. **On this page the global header is the LIGHT/solid variant** (white background), not the transparent one, because the hero has its own dark scrim. Check how `Navbar` handles per-page variants and add this route to the solid list alongside `/news/.+`.

- `<section>` `relative`, `overflow-hidden`, height about 796px desktop. Layer stack bottom to top:
  1. Wide plant photo, `object-cover`, full bleed.
  2. Scrim: `rgba(10,13,27,0.9)` with `backdrop-filter: blur(19.6px)`.
  3. Product shot: the module image, 486 x 560, positioned right of centre (about `left: calc(50% + 417px)` at 1600px). On smaller screens move it behind the text at lower opacity, or hide it below `lg` — do not let it collide with the copy.
  4. Gradient: `linear-gradient(180.53deg, rgba(10,13,27,0) 0.91%, rgba(10,13,27,0.9) 75.27%, #0A0D1B 94.69%)` with `backdrop-filter: blur(10px)`.
- Content in `Container`, padding 100px vertical, column gap 160px between the copy block and the stats row.
- Copy block, max-width 680px, gap 40:
  - Eyebrow: icon 16px + `HJT Solar Panels` (uppercase), `#7A83CC`, 16/24 medium.
  - H1: `Redefining the yield boundaries of ODM projects with HJT` — 48/56 semibold white, ls -0.72. Responsive: ~30px mobile, ~38px md, 48px xl.
  - Body: `Build private-label PV projects with CNX high-bifaciality heterojunction modules, engineered for 765W+ output, low operating-temperature loss, and long-term power stability.` — 20/32 regular `#CECFD1`, max-width 638px.
  - Buttons row, gap 12:
    - Primary: file icon 20px + `Request datasheet` — bg `#D5AC5D`, text `#0A0D1B` 20/24 semibold, px 32 py 18, `rounded-full`.
    - Secondary: phone icon 20px + `Talk to specialist` — transparent, border 1.5px `#84868D`, white text, same padding and radius.
- Stats row: 5 blocks, `justify-between`, separated by 1.5px vertical dividers stretching the full row height. Each block gap 8: value 32/40 semibold white, label 18/28 regular `#CECFD1`.

| Value | Label |
| --- | --- |
| BNPI-845W | Bifacial double-glass HJT module |
| 24.63%+ | Maximum Efficiency |
| 95% | Up to Bifaciality |
| 15 year | Process Warranty |
| 30 year | Power Linearity Warranty |

- Responsive: stats become a 2-column grid on mobile and 3-column on tablet, with horizontal dividers instead of vertical ones (or none). Buttons stack full-width on mobile.
- Animation: eyebrow / heading / body / buttons staggered `up`; stats row staggered by index; product shot `scale`.

# Section 2 — Product introduction (node 1:1522)

- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container`.
- One white card, `rounded-16`, `overflow-hidden`, flex row, `items-stretch`:
  - Left: factory photo column, `flex-1` (about 568px at desktop), `object-cover`, full card height.
  - Right: text column, fixed 752px, padding 64, gap 24.
    - Eyebrow: `Product Introduction`.
    - H2: `What is HJT Technology?` — 48/56 semibold `#0A0D1B`.
    - Two paragraphs, 20/32 regular `#3B3D49`, gap 16:
      1. `CNX HJT solar modules combine crystalline silicon with advanced amorphous silicon passivation to reduce recombination loss and maximize real-world energy yield. Designed for ODM partners, they deliver high power density, strong bifacial performance, low temperature loss, and reliable factory-controlled quality.`
      2. `Ideal for utility-scale, C&I rooftops, trackers, carports, and high-reflectance sites, CNX HJT modules improve project performance while simplifying procurement with one-stop manufacturing, certification support, packaging customization, and global shipping.`
- Responsive: stacks to image-on-top below `lg`; card padding drops to 32 on tablet, 24 on mobile.
- Animation: image `scale`, text block `up` staggered.

# Section 3 — Competitive advantage, 6 cards (node 1:1540)

This is the same 6-card grid as the homepage "Everything you need from one reliable partner". **Reuse that component** and pass this content.

- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container`, gap 48.
- Header centred, max-width 616px, gap 8: eyebrow `Our Competitive Advantage`, H2 `Everything you need from one reliable partner` (48/56 semibold, centred).
- Grid 3 x 2, gap 24. Card: white, border 1.5px `#E7E7E8`, `rounded-16`, padding 32, gap 24. Icon 40px. Title 20/28 semibold `#0A0D1B`. Body 18/28 regular `#3B3D49`, title-to-body gap 12.
- Responsive: 1 col mobile, 2 col tablet, 3 col desktop.

| Icon | Title | Body |
| --- | --- | --- |
| layer | Bifacial Double-glass design | Enhanced product weather ability with high mechanical load capacity front and rear. |
| cloud-sun-rain | Low-light performance | Reliable power generation in all weather, even during low light. |
| chart-increase | High Bifaciality | Bifaciality approaching 95%, achieving significantly higher rear-side gain. |
| apartment | Wide Installation scenarios | Large-scale power plants, commercial rooftops, and vertical installations. |
| menu-square | Multi-Cut technology | Ultra-high power output, resulting in lower BOS and LCOE costs per installed watt. |
| snow | Low Temperature coefficient | Less degradation at high temperatures, ensuring stable output. |

# Section 4 — Engineering details, tabbed spec panel (node 1:1605)

Dark section with an image and a tabbed spec table.

- `<section>` bg `#0A0D1B`, `py-100`. Content in `Container`, gap 48.
- Header centred, max-width 636px: eyebrow `ENGINEERING DETAILS`, H2 `Built for strength, efficiency and long-term reliability` (48/56 semibold white, centred).
- Body row, gap 60: left image 500 x 588 `rounded-16` `object-cover`; right column 760px, gap 24.
- **Tabs** (real interactive component, single-select):
  - Track: bg `rgba(255,255,255,0.05)`, border 1px `#232532`, `rounded-full`, padding 4.
  - Tab: padding 8 vertical / 24 horizontal, `rounded-full`.
  - Active: bg white, label 18/28 medium `#0A0D1B`.
  - Inactive: transparent, label 18/28 regular `#B6B6BB`.
  - Tabs: `Mechanical Parameters` (default active) and `Temperature Coefficient`.
  - Accessibility: real `role="tablist"` / `role="tab"` / `role="tabpanel"`, arrow-key navigation, `aria-selected`.
  - The Temperature Coefficient panel content is not in the Figma file. Render it from the data file with an empty-state row saying content is pending, and flag it. Do not invent values for a technical datasheet.
- **Spec table:** bg `rgba(255,255,255,0.05)`, border 1px `#232532`, `rounded-12`. Row: padding 18 vertical / 20 horizontal, gap 48, bottom border 1px `#232532`, last row no border. Label cell fixed 164px, 18/28 regular `#CECFD1`. Value cell flex-1, 18/28 medium white.

Mechanical Parameters rows:

| Label | Value |
| --- | --- |
| Type and Size(mm): | HJT Solar cell & 210x52.5 |
| No.of cells(pcs): | 276 (12x23) |
| Dimension(mm): | 2384x1303x33 |
| Glass(mm): | 2.0mm |
| Output Cable(mm): | 4mm2,length can be customized/UV resistant |
| Weight(kg): | 38.4 |
| No.of Diodes(u.): | 3 |
| Frame: | Anodized aluminum alloy frame / steel frame |

- Responsive: stacks to image-on-top below `lg`. On mobile the label cell goes full width above the value (stacked rows) rather than a cramped two-column split. Tabs scroll horizontally if they overflow.
- Animation: image `scale`, header `up`, table container as one `up`. Tab switching cross-fades the panel over 150ms.

# Section 5 — Manufacturing reliability (node 1:1651)

- `<section>` white, padding 120 vertical. Content in `Container`, gap 48.
- Header, max-width 810px, gap 12: eyebrow `Manufacturing excellence`, H2 `Built in CNX controlled manufacturing for trusted ODM reliability` (48/56 semibold `#0A0D1B`).
- Body row, `justify-between`: left column 620px gap 48, right image 620 x 560 `rounded-16` `object-cover`.
- Left column: intro paragraph 20/32 regular `#3B3D49`: `CNX integrates cell, module, and BESS production across its factory network, providing ODM partners with complete visibility into quality, capacity, compliance, and logistics. Every product follows a fully traceable workflow from material inspection to export.`
- Then a list, gap 16, with a 1px `#E7E7E8` divider above the first item, between every pair, and below the last (7 dividers total). Each item: 8px gold `#D5AC5D` dot + label 20/32 medium `#3B3D49`, gap 12.
  1. 6 Wholly-owned smart factories
  2. 100% In-house traceability
  3. Cell → Module → BESS Full-chain integration
  4. Module-level barcode traceability
  5. In-house PID/LeTID/mechanical load testing
  6. Export to 50+ countries
- Responsive: stacks below `lg`, image below the list on mobile.
- Animation: header `up`, list items staggered, image `scale`.

# Section 6 — Manufacturing workflow, 5 steps (node 1:1701)

A horizontally scrolling step track inside a white card.

- `<section>` bg `#F8F8F8`, `py-100`. Content in `Container`, gap 48.
- Header row, `items-end`, `justify-between`: left block 482px with eyebrow `Manufacturing Workflow` and H2 `From raw materials to certified quality`; right paragraph 479px, 20/32 regular `#3B3D49`: `Every CNX module follows a fully traceable production process, ensuring consistent quality, reliable performance, and export-ready delivery.`
- Steps card: white, border 1px `#E7E7E8`, `rounded-20`, padding 60, `overflow-hidden`.
  - Track: flex row, gap 24, each step column 408px. Five columns overflow the card deliberately (about 2.9 visible) — this is a **horizontal scroller**. Implement with `overflow-x-auto`, `scroll-snap-type: x mandatory`, snap-align start on each column, hidden scrollbar, and swipe support. Add prev/next buttons matching the Related products carousel style so it is operable by mouse and keyboard, not just touch.
  - Right-edge fade overlay: absolutely positioned, width 126px, `linear-gradient(to right, rgba(255,255,255,0) 0%, #FFFFFF 100%)`, `pointer-events: none`.
  - Step column: gap 100. Meta row gap 24: step label 16/24 regular `#3B3D49` (fixed 56px) + connector line (4x4 gold `#D5AC5D` end caps with a 1.5px rule between) + 40px `solar-panel-02` icon.
  - Text block: padding-right 48, gap 12. Title 24/32 semibold `#3B3D49`. Body 20/32 regular `#3B3D49`.

| Label | Title | Body |
| --- | --- | --- |
| Step 01 | Incoming material inspection | Glass, cells, EVA/POE, frame, junction box, labels, packaging |
| Step 02 | Cell cutting and stringing | Half-cut HJT cells, string alignment, soldering quality |
| Step 03 | Layup & lamination | Glass-glass stack, encapsulant control, lamination profile |
| Step 04 | EL & IV testing | Microcrack screening, power binning, electrical performance verification |
| Step 05 | Final QA & packaging | Visual check, barcode traceability, pallet protection, shipment documents |

- Responsive: card padding drops to 32 tablet / 24 mobile; step column width becomes about 80vw on mobile so one step fills the screen with the next peeking.
- Animation: header `up`, step columns staggered.

# Section 7 — Awards (node 1:1801)

Identical to the homepage Awards section. **Reuse it.**

- `<section>` white with a faint factory photo behind, masked, veiled by `linear-gradient(to bottom, #F8F8F8 0%, rgba(248,248,248,0.9) 35.182%, rgba(255,255,255,0) 80.871%)`. `py-100`.
- Header centred, max-width 690px, gap 20: eyebrow `Industry Recognition`, heading `Recognized for excellence in manufacturing & innovation` (52/60, ls -1.04, centred).
- Three cards, gap 16, centred. Card: white, `rounded-16`, padding 24, gap 32, width about 251px. Logo 140px. Caption `Leading Renewable Energy Manufacturer Award` 16/24 semibold `#131314`, centred.
- Logos: IEC, TÜV Rheinland Certified, CQC.
- Responsive: 1 col mobile, 3 col desktop.

# Section 8 — Technical specifications, two tables (node 1:1830)

- `<section>` bg `#0A0D1B`, `py-100`. Content in `Container`, gap 48.
- Header centred: eyebrow `Detailed Specifications`, H2 `Technical specifications at a glance` (48/56 semibold white, centred).
- Two tables stacked, gap 40. Both: border 2px `#232532`, `rounded-12`, `overflow-hidden`.
- Header row: bg `#232532`, cell height 64, padding 6 vertical / 24 horizontal, cell divider 1.5px `#3B3D49`, text 20/28 semibold white.
- Body row: bg `rgba(255,255,255,0.05)`, bottom border 1px `#232532`. Cell padding 20 vertical / 32 horizontal, cell divider 1.5px `#232532`. First-column label 20/28 semibold white; other cells 18/28 regular `#CECFD1`.

## Table A — Specification / Template value / Note

Columns: 360px fixed | flex-1 | 360px fixed.

**Important:** the "Note" column contains internal instructions to the designer, not customer-facing copy. Put those strings in the data file as `internalNote` and do NOT render the column, or render it only if the client confirms. Flag this in your report.

| Specification item | Template value | Note (internal) |
| --- | --- | --- |
| Cell technology | N-type HJT, half-cut cells | Replace with final bill of materials. |
| Power range | 730-765W for Lians G12-0BB Uranus Pro Module; 530-565W for Lians G12-0BB Venus Pro Module | Create separate tabs if both series are sold. |
| Module efficiency | Up to 24.6% | Use exact module value after testing. |
| Bifaciality | Up to 95% typical template value | Show as datasheet value, not universal claim. |
| Temperature coefficient Pmax | Down to -0.24%/C template value | Replace with certified datasheet value. |
| First-year degradation | <=1.0% | Warranty claim must match warranty PDF. |
| Annual degradation years 2-30 | <=0.32% | Warranty claim must match warranty PDF. |
| Product warranty | 15-year product quality assurance | Confirm commercial policy. |
| Power warranty | 30-year power output linear warranty | Link warranty document. |
| Operating temperature | -40° C to +85° C | Standard PV module range. |
| Maximum system voltage | (label duplicated as value in Figma — needs the real value) | Project-level design compatibility. |
| Frame and glass | Anodized aluminum alloy frame / steel frame; 2.0mm Aluminum alloy/composite material frame; 2.0mm+1.6mm | ODM option. |

## Table B — Electrical parameters

Columns: Model 270px fixed, then 7 flex-1 columns.

| Model | Pmax W | Vmp V | Imp A | Voc V | Isc A | Max voltage | Fuse |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G12-0BB Uranus Pro | 765 | 46.75 | 16.37 | 52.62 | 17.23 | 1500V | 30A |
| G12-0BB Venus Pro | 565 | 34.61 | 16.33 | 38.96 | 17.20 | 1500V | 35A |

- Responsive: both tables get an `overflow-x-auto` wrapper with the first column sticky (`position: sticky; left: 0`) so the row label stays visible while scrolling. Reduce cell padding to 12/16 on mobile. Never let the page body scroll horizontally.
- Animation: header `up`, each table container as one `up`. No per-row animation.

# Section 9 — Why Choose HJT, charts + comparison table (node 1:1985)

- `<section>` white, padding top 100 / bottom 80. Content in `Container`, gap 48.
- Header centred, max-width 660px, gap 8: eyebrow `HJT vs TOPCon / PERC / BC Comparison`, H2 `Why Choose HJT Technology` (48/56 semibold `#0A0D1B`, centred).
- Charts row: 3 cards, gap 24, each `flex-1`. Card: bg `#F8F8F8`, border 1.5px `#E7E7E8`, `rounded-16`, padding 24 vertical, gap 24. Title 24/32 semibold `#0A0D1B`, centred.
- Chart: 4 vertical bars, equal width, gap about 12, bottom-aligned in a 240px plot area. Bar `rounded-8`, padding 8, value label inside at the top, 18/28 medium white, centred. Category label below the bar, 16/24 regular `#0A0D1B`, centred. Faint horizontal gridlines behind.
- Series colors: PERC `#A5B3BE`, TOPCon `#5387BB`, HJT `#00AAB8`, BC `#1C3C55`.
- Bar heights are illustrative in Figma, not to scale. Compute them proportionally from the values instead so the charts are honest, and cap the tallest at the plot height.

| Chart title | PERC | TOPCon | HJT | BC |
| --- | --- | --- | --- | --- |
| Typical bifaciality (%) | 70% | 80% | 90% | 70% |
| Temperature coefficient (%/°C) | -0.35 | -0.30 | -0.24 | -0.29 |
| Annual degradation (%) | 0.45 | 0.40 | 0.25 | 0.35 |

Note for the temperature-coefficient chart: the values are negative and lower is better, so a naive height-from-value mapping inverts the meaning. Map bar height by absolute value and keep HJT visibly shortest, matching the design intent. Add a one-line caption under that chart clarifying "lower is better" — the design has no legend and a reader cannot otherwise tell.

- Comparison table: border 1px `#E7E7E8`, `rounded-12`, `overflow-hidden`. Header row bg `#F8F8F8`, cell height 64, padding 6/24, dividers 1px `#E7E7E8`, text 20/28 semibold `#0A0D1B`. Body cell padding 16/24, 18/28 regular `#3B3D49`; first column 20/28 semibold `#0A0D1B`, fixed 172px. **The HJT row is highlighted:** bg `#F8F8F8` with a 1px gold `#D5AC5D` top and bottom border.

| Technology | Positioning | Strength | Trade-off | Best-fit applications |
| --- | --- | --- | --- | --- |
| PERC | Mature P-type baseline | Lower cost, mature supply | Lower bifaciality and higher degradation than advanced N-type options | Price-sensitive projects |
| TOPCon | N-type passivated contact | Strong mainstream efficiency and broad supply | Bifaciality and temperature performance vary by product | Utility and C&I projects |
| HJT | N-type heterojunction | High bifaciality, low temperature coefficient, low degradation | Requires strong process control & cost management | High-yield utility, trackers, hot climates, reflective sites |
| BC | Back-contact architecture | High front-side efficiency and premium aesthetics | Bifaciality and cost depend on design | Premium rooftop, BIPV, high-density layouts |

- Responsive: charts go 1 col mobile, 2 col tablet, 3 col desktop. The comparison table gets `overflow-x-auto` with a sticky first column; below `md` consider rendering it as stacked cards (one card per technology with label/value pairs) — that reads far better on a phone than a 5-column scroll.
- Animation: header `up`, chart cards staggered, bars grow from 0 height on entry, table container as one `up`.

# Section 10 — Illustrative annual energy gain (node 1:2128)

- `<section>` white, padding 80 vertical. Content in `Container`, gap 48.
- Header centred, max-width 824px, gap 8: eyebrow `Energy yield & LCOE story`, H2 `Illustrative annual energy gain model` (48/56 semibold `#0A0D1B`, centred). Note the Figma string is lowercase `lcoe`; write it as `LCOE` in the data.
- Chart panel: bg `#F8F8F8`, full Container width, height 620 desktop, no radius in Figma — add `rounded-16` for consistency with every other panel on this page and note the deviation.
  - Y axis labels 110 / 88 / 66 / 44 / 22 / 0, 16/24 regular. Gridlines 1.5px `#E7E7E8`.
  - 4 bars, each about 243px wide, gap 40, bottom aligned. Bar 1 `#A5B3BE` `rounded-8`; bars 2 to 4 `#00AAB8` `rounded-4`. Value label 20/32 medium white inside the bar (top-aligned for bar 1, centred for the rest). Caption below, 16/24 regular `#0A0D1B`, centred.

| Bar | Value | Caption |
| --- | --- | --- |
| 1 | 100% | Baseline N-type project |
| 2 | +2.0% | HJT low-temp gain |
| 3 | +4.5% | HJT bifacial gain |
| 4 | +1.5% | HJT weak-light gain |

- The gain bars are tiny relative to the baseline, so their labels overflow. Place the value label **above** the bar for bars 2 to 4 instead of inside, and give the container `overflow: visible`.
- Responsive: on mobile flip to horizontal bars with the label to the right — four thin vertical bars on a 360px screen are unreadable. Keep the same colors and values.
- Animation: header `up`, bars grow from 0 staggered 80ms.

# Section 11 — Product variants (node 1:2182)

Two large product cards.

- `<section>` white, padding top 80 / bottom 100. Content in `Container`, gap 48.
- Header centred, max-width 590px, gap 12: eyebrow `Applications`, H2 `Powering every project with the right HJT solution` (48/56 semibold, centred).
- Cards stacked, gap 60, with a 1px `#E7E7E8` full-width divider between them.
- Card: bg `#F8F8F8`, border 1px `#E7E7E8`, `rounded-16`, flex row, `items-center`, `justify-between`, padding-right 60, `overflow-hidden`.
  - Left image 576 x 656, flush to the card's left edge, left corners rounded 16, `object-cover`.
  - Right text column 624px, gap 48.
    - Eyebrow pair row: two 16/24 regular `#3B3D49` labels separated by an 8px 1.5px `#CECFD1` dash.
    - Product name 32/40 semibold `#0A0D1B`.
    - Body 20/32 regular `#54565F`.
    - Spec list, gap 16, each row: label 143px 18/28 regular `#3B3D49` + value flex-1 18/28 medium `#0A0D1B`, gap 32. A 1.5px `#E7E7E8` divider after rows 1 and 2 only.
    - Button: gold `#D5AC5D` pill, download icon 20px + `Download data-sheets`, 20/24 semibold `#0A0D1B`, px 32 py 18.

**Card 1 — G12-0BB Uranus Pro**
- Eyebrow pair: `Flagship level` / `maximizing profits`
- Body: `Engineered for utility-scale projects, Uranus Pro delivers 730–765W output, up to 24.63% efficiency, 85%±5% bifaciality, and a -0.24%/°C temperature coefficient for maximum energy yield. Certified for 2400Pa wind and 5400Pa snow loads, it offers a 30-year linear power warranty with ≤0.25% annual degradation from year 2.`
- Scene: `Utility, Commercial & Industrial`
- Core selling point: `Ultra-high power, dual-sided gain, ultra-low attenuation`
- Visual keywords: `Scale, desert/snowy terrain, tracking stand`

**Card 2 — G12-0BB Venus Pro**
- Eyebrow pair: `Aesthetic level` / `distributed optimization`
- Body: `A full-black module purpose-built for distributed generation. Compact 1762×1303×30mm, 26kg design for load-bearing rooftops, with excellent low-light response and a power range of 530–565W matched to distributed project capacity.`
- Scene: `Residential, C&I, tourism & cultural`
- Core selling point: `Total-black aesthetics, lightweight, low-light response`
- Visual keywords: `Architecture integration, city skyline, rooftops`

- Responsive: stacks to image-on-top below `lg`, image aspect ratio preserved, padding-right becomes uniform padding. Spec rows stack label above value on mobile.
- Animation: cards staggered `up`, images `scale`, spec rows staggered within each card.

# Section 12 — Private-label ODM (node 1:2250)

- `<section>` bg `#F8F8F8`, padding top 100 / bottom 80. Content in `Container`, gap 48.
- Header row, `items-end`, `justify-between`: left 660px with eyebrow `ODM customization service` and H2 `Private-label HJT manufacturing for your market`; right paragraph 476px, 20/32 regular `#3B3D49`: `CNX supports ODM customers from module selection to certification, packaging, production, inspection, and shipment, helping launch private-label PV brands and EPC-ready solar solutions.`
- White card, `rounded-20`, padding 48. Inner row gap 60: left column 630px gap 20, right image 534 x 534 `object-cover`.
- Feature rows: each gap 12 — icon chip 52x52 (bg `#F8F8F8`, border 1px `#F3F3F4`, `rounded-8`, padding 14, icon 24px) + text stack gap 4 (title 20/28 semibold `#0A0D1B`, body 18/28 regular `#54565F`). A 2px `#F3F3F4` divider after each row.

| Icon | Title | Body |
| --- | --- | --- |
| paint-board | Branding | Private label, carton design, label layout, datasheet cover, warranty file |
| settings-02 | Product configuration | Power bin, frame color, glass, cable, connector type, pallet quantity |
| new-releases | Certification | IEC / CE / TÜV / UL pathway support according to target market |
| file-01 | Documentation | Datasheet, manual, warranty, flash report, packing list, traceability |
| agreement-02 | Commercial terms | MOQ by model and packaging; sample order before batch production |

- The 4th divider has a static gold `#D5AC5D` fill covering the left 31.6% of its width. In Figma this is decorative. Either drop it, or make it meaningful by wiring it to which feature row is hovered or in view. Prefer dropping it — a progress bar that tracks nothing is confusing.
- Service flow block below the card, gap 32: heading `Service flow` (20/28 semibold `#0A0D1B`), then a row of 6 labels separated by 20px chevron icons, each label 18/28 regular `#3B3D49`: `Demand communication`, `Technical selection`, `Sample confirmation`, `Batch production`, `QA inspection`, `Shipment`.
- CTA: gold pill, `Talk to our ODM specialist` 18/24 semibold `#0A0D1B` + chevron-right 20px, px 24 py 12.
- Responsive: card stacks below `lg`. The 6-step service flow wraps to multiple lines on tablet and becomes a vertical list with downward chevrons on mobile.
- Animation: header `up`, feature rows staggered, image `scale`, service flow steps staggered.

# Section 13 — Case study (node 1:2344)

Identical to the homepage Case study section. **Reuse it.**

- `<section>` bg `#F8F8F8`, padding top 80 / bottom 100. Content in `Container`, gap 48.
- Header centred: eyebrow `Client success story`, H2 `Real world HJT project success stories` (48/56 semibold, centred).
- Image card 1320 x 600, `rounded-16`, aerial solar farm photo `object-cover`, overlaid with `linear-gradient(to bottom, rgba(10,13,27,0) 0%, rgba(10,13,27,0.9) 61.566%)`.
- Overlay content near the bottom, 60px side gutters, `justify-between`:
  - Left text 704px, gap 12: title 24/32 semibold white `5MW HJT tracker project designed for higher yield`; body 18/28 regular `#CECFD1` (the European ground-mounted paragraph).
  - Vertical divider 108px tall, 1.5px `#3B3D49`.
  - Right spec list 319px, gap 16, each row icon 20px + text 18/28 medium white: `324 Vertex N NEG19RC.20 modules`, `1.3MW System size`, `Q4 2025 Rooftop carport mount`.
- See the copy issues list at the top — this section has three factual contradictions to raise with the client.
- Responsive: overlay content stacks on mobile, divider dropped, overlay darkened for legibility.

# Section 14 — Related products carousel (node 1:2394)

- `<section>` white, padding top 100 / bottom 80. Content in `Container`, gap 48.
- Header row, `justify-between`, `items-center`: left eyebrow `Related products` + H2 `Explore more energy solutions`; right carousel controls, gap 8.
  - Prev: transparent, border 1.5px `#E7E7E8`, padding 12, `rounded-full`, chevron-left 24px.
  - Next: bg `#D5AC5D`, padding 12, `rounded-full`, chevron-right 24px.
  - Disabled state at the ends: reduced opacity, not clickable, `aria-disabled`.
- Track: flex row, gap 24, 4 cards each 648 x 694. Two visible per view at desktop. Same scroll-snap carousel pattern as the News highlights carousel — reuse that component if it is generic enough.
- Card: bg `#F8F8F8`, `rounded-16`, padding 32, `overflow-hidden`, image 363 x 418 positioned top-centre, text block at the bottom centred gap 20: title 24/32 semibold `#0A0D1B`, body 18/28 regular `#3B3D49`, then a pill button `Learn more` + chevron-right, px 24 py 12, 18/24 semibold. Card 1's button is gold; cards 2 to 4 are outline with 1.5px `#E7E7E8`.

| Title | Body |
| --- | --- |
| CNX TOPCon Solar Modules | High-efficiency N-Type TOPCon modules delivering reliable performance for utility-scale and commercial solar projects. |
| CNX BC Solar Modules | Premium back-contact solar modules combining exceptional efficiency with a sleek all-black design for modern installations. |
| CNX 488kWh C&I BESS | Commercial and industrial battery energy storage designed to optimize energy usage, reduce peak demand, and provide reliable backup power. |
| Compatible String or Hybrid Inverters | Smart hybrid and string inverters engineered for seamless integration with solar PV and battery storage systems. |

- Each card links to its product page where one exists; use the slugs from the manufacturing data file.
- Responsive: card width becomes about 85vw on mobile so one fills the screen with the next peeking; controls stay visible and the track is swipeable.
- Animation: header `up`, cards staggered.

# Section 15 — FAQ, 12 items (node 1:2454)

Same two-column FAQ as the homepage. **Reuse the existing FaqAccordion and ContactCard components**, pass this content.

- `<section>` white, padding 80 vertical. Content in `Container`.
- Left column 460px, `justify-between` full height: header at top (eyebrow `Frequently asked question`, H2 `Do you have any questions for me?`), contact card pinned at the bottom (width 360, bg `#F8F8F8`, `rounded-12`, padding 20, 48px round avatar, name `Emma Collins` 18/28 medium, role `Customer care` 16/24 regular, bio text, gold `Let's talk` pill).
- Right column 760px, 12 accordion items, gap 16. Item: bg `#F8F8F8`, border 1px `#F8F8F8`, `rounded-8`, padding 24. Question 20/28 semibold `#0A0D1B` with a 20px plus/minus indicator. Answer 18/28 regular `#3B3D49`, padding-right 48, gap 12 below the question. Single-open, item 1 open by default.

Every question is prefixed with `Q. ` in the design.

1. **Q. What is HJT solar technology?** — HJT, or heterojunction technology, combines crystalline silicon with thin amorphous silicon passivation layers to reduce recombination loss and improve module efficiency and long-term stability.
2. **Q. How is HJT different from TOPCon?** — Both are N-type technologies. HJT is known for high bifaciality, low temperature coefficient, and low degradation, while TOPCon has broad mainstream supply and strong cost competitiveness.
3. **Q. What power range does CNX offer for HJT modules?** — The utility HJT template covers 530W to 765W modules, with additional commercial rooftop formats available according to project requirements.
4. **Q. Can CNX manufacture HJT modules under my own brand?** — Yes. CNX supports ODM private-label projects, including logo, label, carton, datasheet, warranty file, and packaging customization.
5. **Q. What certifications are available?** — CNX can support common PV module certification requirements such as IEC, CE, TÜV, and UL where applicable. Final availability depends on the exact model and target market.
6. **Q. What is the typical MOQ?** — MOQ depends on the selected model, packaging design, and certification requirements. CNX can confirm MOQ after the technical selection and branding scope are defined.
7. **Q. Do HJT modules work better in hot climates?** — HJT modules typically have a low temperature coefficient, which helps reduce power loss during hot operating hours. Site-level simulation is recommended for final yield estimates.
8. **Q. Are HJT modules suitable for bifacial projects?** — Yes. HJT is often selected for bifacial applications because of its high rear-side response. The actual gain depends on albedo, mounting height, ground cover, and shading.
9. **Q. Can CNX provide flash reports and traceability data?** — Yes. CNX can provide module-level documents such as flash reports, barcode traceability records, packing lists, and QA files according to order scope.
10. **Q. Can I combine CNX HJT modules with inverters and BESS?** — Yes. CNX can support hybrid procurement by combining self-manufactured modules with inverter and BESS products for a more complete PV-plus-storage solution.
11. **Q. What warranty does CNX provide for HJT modules?** — The template page uses a 15-year product warranty and 30-year linear power warranty. Final warranty terms must match the official warranty document.
12. **Q. How do I start an ODM HJT module project?** — Share your target market, power range, certification needs, branding scope, estimated volume, and delivery schedule. CNX will recommend a model and prepare the next-step quotation package.

- Add FAQPage JSON-LD for all 12 items, matching the homepage FAQ pattern.
- Responsive: stacks below `lg`, contact card moves below the accordion.

# Section 16 — Quotation form (node 1:2595)

- `<section>` white, padding top 80 / bottom 100. Content in `Container`, gap 48.
- Header centred: eyebrow `Get in touch`, H2 `Request your ODM quotation` (48/56 semibold, centred).
- Form card: width 840, bg `#F8F8F8`, border 1px `#E7E7E8`, `rounded-16`, padding 48, gap 32.
- Field: label 18/28 regular `#0A0D1B` with a gold `*` for required; input height 60, border 1.5px `#E7E7E8`, `rounded-8`, padding 18/20, **background white** (Figma leaves it unset, which makes the field invisible against the card — set white explicitly). Text 16/24 regular `#54565F`.
- Rows of two, gap 16, each column `flex-1`:

| # | Label | Required | Type |
| --- | --- | --- | --- |
| 1 | Full Name | Yes | text |
| 2 | Email | Yes | email |
| 3 | Company | No | text |
| 4 | Country | Yes | select (Figma draws a plain input; a country picker is correct) |
| 5 | Phone number | Yes | tel |
| 6 | Product interest | No | select, placeholder `G12-0BB Uranus Pro` |
| 7 | Target power range | No | text |
| 8 | Quantity / MW | No | text |
| 9 | Project timeline | No | text, full width |
| 10 | Message | No | textarea, full width, height 122, placeholder `Type here..` |

- Submit: full width 744, gold `#D5AC5D` pill, height 60, label `Submit inquiry` 20/24 semibold `#0A0D1B` + chevron-right 20px.
- **The design has no error, focus, success, loading, or disabled states and no privacy consent checkbox.** Build all of them:
  - Client-side validation on the required fields, error text 16/24 in a red token below the field, `aria-invalid` and `aria-describedby` wired up.
  - Visible focus ring on every field matching the site's focus style.
  - Submitting state disables the button and shows a spinner or "Sending…".
  - Success replaces the form with a confirmation message; failure shows a retry message. Never leave the user guessing.
  - Add a privacy consent checkbox with a link to the privacy policy. A B2B quote form collecting name, email, phone, and company needs it, and the client will need it for GDPR.
  - Phase 1: wire the submit to a stub handler that logs the payload. Real delivery (email or database) comes later — say so in your report.
- Responsive: card padding drops to 32 tablet / 24 mobile, two-column rows collapse to one column below `md`.
- Animation: header `up`, form card as one `up`. Do not stagger individual fields; a form that assembles itself piece by piece feels broken.

# Section 17 — Technical documents CTA (node 1:2654)

Same pattern as the homepage bottom CTA. **Reuse it** with different copy and no second button.

- Full-width `<section>` 740px tall, factory photo `object-cover`, gradient `linear-gradient(to bottom, rgba(10,13,27,0) 15.444%, rgba(10,13,27,0.86) 72.236%, #0A0D1B 100%)`. The bottom stop equals the footer color so it blends seamlessly — keep that.
- Centred content, max-width 648, gap 32: H2 `Technical Documents & Product Resources` (48/56 semibold white, centred) + gold pill button with a leading download icon and label `Download Datasheet` (20/24 semibold `#0A0D1B`, px 32 py 18).
- Responsive: heading scales down, button full-width on mobile, section height becomes content-driven.

# Section 18 — Floating action bar (node 1:2663)

A sticky bar of three CTAs. In Figma it sits just below the hero; in practice it should be **sticky at the bottom of the viewport**, appearing once the user scrolls past the hero and hiding again over the footer.

- Pill container: bg white, border 1px `#E7E7E8`, `rounded-full`, padding 6, gap 12, width 784. Add a soft shadow so it reads as floating (Figma has none, but a white pill on a white section is invisible without one).
- Three buttons, each px 32 py 18, `rounded-full`, label 20/24 semibold `#0A0D1B`:
  1. `Request Quote` — transparent, border 1.5px `#E7E7E8`. Scrolls to the quotation form.
  2. `Download Datasheet` — bg `#D5AC5D`, download icon 20px.
  3. `Talk to ODM Specialist` — transparent, border 1.5px `#E7E7E8`.
- Behaviour: `position: fixed`, centred horizontally, about 24px from the bottom. Fade in when the hero leaves the viewport; fade out when the footer enters. Respect reduced motion (snap instead of fade).
- Responsive: below `lg`, collapse to two buttons (`Download Datasheet` gold + `Request Quote` outline) full-width in a bottom bar spanning the viewport with a top border, since three 20px-label pills will never fit on a phone. Drop `Talk to ODM Specialist` there, or move it into the ODM section CTA which already has it.
- Accessibility: the bar is a `<nav aria-label>` or a plain div with clear button labels; it must not trap focus, and it must not cover the last element of the page — add bottom padding to the page equal to the bar's height when it is visible.

---

# Build order for Claude Code

Build this in two passes so it can be reviewed before the long tail.

## Pass 1 — foundation and the top half

1. Read the homepage sections and the manufacturing category template to match conventions, and note which components can be reused: Awards, Case study, FAQ accordion + contact card, bottom CTA, carousel.
2. Create the data layer: `src/lib/data/products/types.ts` with the `ProductDetail` type (every section optional), `src/lib/data/products/bc.ts` with all the content above, and `getProductDetail(category, slug)`.
3. Create `src/components/sections/product/` and build the template shell `ProductDetailPage.tsx` that renders whichever sections the data provides, in order.
4. Build sections 1 to 9 (Hero, Product introduction, Competitive advantage, Engineering details tabs, Manufacturing reliability, Workflow steps, Awards, Technical specifications, Why Choose comparison).
5. Create the route `app/[locale]/manufacturing/solar-panels/bc/page.tsx` with `generateMetadata`, and add this route to the Navbar's solid-header list.
6. Report what you built and what you reused, then stop.

## Pass 2 — the rest

7. Build sections 10 to 18 (Energy gain chart, Product variants, Private-label ODM, Case study, Related products, FAQ, Quotation form, Technical documents CTA, Floating action bar).
8. Add FAQPage JSON-LD.
9. Add i18n keys under `products.solarPanels.bc` for UI chrome.
10. Verify: content width matches the homepage everywhere, no horizontal page scroll at 360 / 768 / 1024 / 1440 / 1920, every table scrolls inside its own container with a sticky first column, tabs and accordions are keyboard operable, the floating bar shows and hides correctly and does not cover content, and animation timings match the homepage.
11. Print the list of copy issues from the top of this document that you preserved verbatim, so Easin can take them to the client.
12. Run only `npx tsc --noEmit`. Do NOT run `npm run build`.

## Starter kit note

`ProductDetailPage`, the tabbed spec panel, the scroll-snap carousel, the sticky action bar, and the CSS bar chart are all generic once content is passed as props. After this page works, copy the generic versions into `F:\easin-next-starter`.
