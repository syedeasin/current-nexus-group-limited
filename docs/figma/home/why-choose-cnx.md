# Why Choose CNX spec

Homepage section 8, below Client Testimonials.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8648`
- Frame: 1600 x 840

Read `docs/figma/home/_animation.md` first. Then read `2283:8648` with `get_design_context` and `get_metadata` and pull every exact number from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Structure

```
Section, deep navy background
└── Container size="section"
    ├── Left column
    │   ├── eyebrow     WHY CHOOSE US
    │   ├── h2          two lines
    │   ├── paragraph
    │   └── photograph  rounded
    └── Right column
        └── Accordion   six items, one open at a time
```

The background is the primary navy token, not black. Confirm the exact fill from Figma and use a token, never a raw hex.

## Left column

- Eyebrow: `WHY CHOOSE US`, using `SectionEyebrow`. This sits on a dark background, so use the dark tone.
- Heading, `h2`, two lines:
  `Reasons to choose CNX`
  `Energy confidently`
- Paragraph: `Your trusted China partner for private-label PV & BESS manufacturing, Tier 1 products, and after-sales support.`
- Photograph below, rounded. Pull the radius and aspect ratio from Figma.

## Right column, the accordion

Six items. Each row is an icon, a title, and a divider line underneath. Exactly one item is expanded at a time, and its body text appears indented under the title.

In Figma the third item is the open one. That is the default state, not a special item.

Rules:

- Build it as a real accordion. Use a `<button>` as the trigger with `aria-expanded` and `aria-controls`, and the panel with `role="region"` and `aria-labelledby`.
- Only one item open at a time. Opening one closes the other.
- The first item is open on load. Confirm against Figma whether it should be item 1 or item 3, and match Figma.
- The expand animation must not use `max-height` guessing. Use `grid-template-rows` from `0fr` to `1fr` on a wrapper with `overflow-hidden`. That animates smoothly to the true content height with no jank and no guessed value.
- The icon on the left is from Figma. Download every icon, never hand-write an SVG path and never substitute a lucide icon unless the glyph is clearly identical.
- Keyboard: `Enter` and `Space` toggle. Up and down arrows move between triggers. `Home` and `End` jump to first and last.
- Visible focus ring using `ring-secondary`.

### Items

1. `Vertical Manufacturing & Quality Control`
2. `Bankable Tier-1 Brand Portfolio`
3. `EPC+F Credit Financing Support` — body: `Exclusive 2-year long-term credit financing for qualified ODM partners. Ease your project cash flow pressure and scale your pipeline without tying up working capital.`
4. `Hybrid Procurement Synergy`
5. `Technical & After sales Engineering`
6. `Global Logistics & Tariff Compliance`

Only item 3 has body copy in Figma. The other five need it and it does not exist yet.

Do **not** invent marketing copy. Add each item with an empty `body` field and a `TODO` comment in the data file listing the five that need real text, and report that list back to me. Render an item with no body as a trigger that is present but visually indicates there is nothing to expand, or simply do not make it expandable, and tell me which you chose.

All copy into `messages/en.json` under `home.whyChoose`, same keys into `zh.json` with English placeholders.

## Images

Files already exist at `public/images/home`. Icons may need downloading from Figma; if so put them in `public/icons/`. Convert the photograph to WebP, keep it under 200KB, report the size. `next/image` with a correct `sizes` attribute, no `priority`.

## Responsive

- **1440 and 1280**: two columns as designed. Pull the exact column split and gap from Figma.
- **1024**: keep two columns, tighten the gap. The accordion body text may run longer, that is fine.
- **768**: stack to one column. Order: eyebrow, heading, paragraph, accordion, then the photograph last. The accordion is the value of this section, so it must not sit below a large image on a phone. State that you made this change.
- **480 and below**: same order. The accordion row padding tightens. Icon stays but may shrink to 20px if it crowds the title.
- Long titles like `Vertical Manufacturing & Quality Control` will wrap on a phone. Make sure the icon stays top-aligned with the first line, not vertically centred against a two-line title.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Left column revealed first: eyebrow, heading, paragraph, photograph, 80ms apart.
- Accordion items revealed after, staggered 80ms, capped at 400ms total.
- Expand and collapse: 300ms on the `grid-template-rows`, plus the chevron or plus icon rotating over the same duration. Both use the shared easing.
- Under reduced motion, panels open and close instantly with no height transition.

## Files

- `components/sections/home/WhyChooseCnx.tsx` — Server Component
- `components/sections/home/why-choose-cnx/ReasonAccordion.tsx` — `"use client"`, the smallest possible leaf
- `components/ui/Accordion.tsx` — build this as a generic primitive, because the FAQ section needs the same behaviour. Get it right once here.
- `lib/data/whyChooseCnx.ts` — typed array

`Accordion` is generic. Tell me whether it belongs in `F:\easin-next-starter`.

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no clipped title, no icon misaligned against a wrapped title.
- Opening an item never shifts the page above it.
- Keyboard: arrows move between triggers, Enter and Space toggle, focus ring visible.
- All text passes WCAG 2.1 AA against the navy background. Report the measured ratios.
- Heading order correct: this is an `h2`, each accordion trigger is a `<button>` inside an `h3`.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
