# Client Testimonials spec

Homepage section 7, below Application Scenes.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8619`
- Frame: 1600 x 940

Read `docs/figma/home/_animation.md` first. Then read `2283:8619` with `get_design_context` and `get_metadata` and pull every exact number from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Structure

```
Section, light background
└── Container size="section"
    ├── Header, centred
    │   ├── eyebrow   CLIENT SUCCESS STORY
    │   └── h2        one line
    └── Story card, one large rounded card
        ├── background photograph, full bleed inside the card
        ├── dark scrim
        ├── top left     client logo, then client name, then location
        └── bottom       quote on the left, View Case Study button on the right
```

## Header

- Eyebrow: `CLIENT SUCCESS STORY`, using `SectionEyebrow`.
- Heading, `h2`, one line: `Trusted by industrial clients`
- Centred.

## Story card

- One rounded card filling the container width. Pull the radius, height and internal padding from Figma.
- Background photograph fills the card with `object-cover` inside `overflow-hidden`.
- A dark scrim sits over the photo so the white text is readable. **Pull the scrim's real fill or gradient stops from Figma.** Do not invent a flat black overlay. That mistake already cost a day on the Hero.
- Top-left block:
  - Client logo mark plus the wordmark `Lux&Enecore`.
  - `Client name: xyz`
  - `Location: abc city, usa`
- Bottom block:
  - The quote on the left, four lines in Figma. Reserve the height so the card does not resize between stories.
  - `View Case Study` button on the right, filled with the secondary gold token, with a chevron. Use the `Button` primitive. Links to `/projects` for now.
- Mark up the quote as `<blockquote>` with a `<cite>` for the client name. Not a plain div.

## Content

Only one story exists in Figma, but the data model must support several because this will become dynamic.

- Build `lib/data/testimonials.ts` as a typed array and render the first entry.
- Do **not** build carousel controls. Figma shows none, so do not invent arrows or dots.
- Structure the component so adding a second story later is a data change, not a rewrite.

Copy:

- client: `Lux&Enecore`
- clientName label: `Client name: xyz`
- location label: `Location: abc city, usa`
- quote: `"A 5MW solar farm in Italy, commissioned in 2025, uses high-bifaciality HJT solar panels from China with a locally made tracking system. Lux & Enecore was highly satisfied with our products, which delivered much higher performance than standard N-type products."`
- cta: `View Case Study`

Note: the wordmark is `Lux&Enecore` in the logo but `Lux & Enecore` inside the quote. Reproduce both exactly as designed and flag the inconsistency in your report.

All copy into `messages/en.json` under `home.testimonials`, same keys into `zh.json` with English placeholders.

## Images

Files already exist at `public/images/home`. Do not download from Figma and do not generate anything. The client logo mark may be an SVG in Figma; if so download it, never hand-write an SVG path. Convert the photo to WebP, keep it under 250KB, report the size. `next/image` with a correct `sizes` attribute, no `priority`.

## Responsive

- **1440 and 1280**: as designed.
- **1024**: card keeps its layout, internal padding tightens, quote may run to five lines.
- **768**: the quote and the button stop sitting side by side. Quote first, button below it, left aligned. Card height grows with content rather than staying fixed.
- **480 and below**: internal padding drops further, the button goes full width, the quote steps down one type token if it runs past six lines. The top-left client block stays at the top.
- At every width the photograph must still read as a photograph. If the card gets tall and narrow the crop will lose the solar farm, so set `object-position` deliberately and say what you chose.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Header revealed first.
- The card revealed as one unit: fade plus 24px rise, with the photograph doing the 1.04 to 1 scale inside its `overflow-hidden` frame.
- Inside the card, stagger the client block, then the quote, then the button, 80ms apart, starting 200ms after the card itself.
- No parallax on the photograph. It looks cheap at this scale and hurts performance.

## Files

- `components/sections/home/ClientTestimonials.tsx` — Server Component. No client component is needed unless a carousel is added later.
- `lib/data/testimonials.ts` — typed array

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no clipped quote, no text sitting off the photograph.
- Quote and client text pass WCAG 2.1 AA against the brightest region of the photograph with the real scrim. Report the measured ratios.
- The card is a `blockquote` with a `cite`, not a div.
- Heading order correct: this is an `h2`.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
