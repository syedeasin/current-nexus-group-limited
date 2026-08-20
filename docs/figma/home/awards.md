# Awards spec

Homepage section 9, below Why Choose CNX.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8732`
- Frame: 1600 x 900

Read `docs/figma/home/_animation.md` first. Then read `2283:8732` with `get_design_context` and `get_metadata` and pull every exact number from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Structure

```
Section, full-bleed photographic background
├── background   aerial photo, fading from a pale sky at the top to greenery at the bottom
└── Container size="section"
    ├── Header, centred
    │   ├── eyebrow   INDUSTRY RECOGNITION
    │   └── h2        two lines
    └── Award row     five white cards
```

## Background

The background photograph is the tricky part. In Figma the top of the image is very pale and washes almost to white behind the heading, then it deepens into green foliage lower down.

- Reproduce the photograph full bleed with `object-cover`.
- Check whether Figma applies an overlay or a gradient on top of it. If it does, pull the real stops. Do not invent a flat overlay.
- The heading is dark text on the pale upper area. Confirm the contrast passes and report the ratio. If the photograph alone does not carry it, add a soft white gradient scrim behind the header block only, not across the whole image.

## Header

- Eyebrow: `INDUSTRY RECOGNITION`, using `SectionEyebrow`.
- Heading, `h2`, two lines:
  `Recognized for excellence in`
  `manufacturing & innovation`
- Centred. Use `text-balance` and confirm it produces the same two lines.

## Award row

Five white cards in a row. Pull the card width, gap, radius and internal padding from Figma.

Each card:

- A badge image at the top, centred. The badges are different heights and shapes, so lock a fixed box height and centre the badge inside it, otherwise the row will look ragged.
- A two-line caption below, centred.
- Reserve two lines of caption height so all five cards end at the same height.
- Cards are **not** links. Figma shows no hover state and no arrow. Do not add one.

Caption text is the same on all five in Figma: `Leading Renewable Energy Manufacturer Award`

That is almost certainly placeholder. Build the data as a typed array with a per-card caption so the client can give each award its real name, add a `TODO` comment, and report it to me.

All copy into `messages/en.json` under `home.awards`, same keys into `zh.json` with English placeholders.

## Images

Badge files already exist at `public/images/home`. Do not download from Figma and do not generate anything.

- List the folder and map the five badges.
- Badges are meaningful, so each gets a real `alt` describing the award, not an empty one.
- Badges must never distort. Set the height and let the width follow, or use `object-contain` inside a fixed box.
- Convert the background photo to WebP, keep it under 300KB, and the badges under 60KB each. Report the sizes.
- `next/image` with a correct `sizes` attribute, no `priority`.

## Responsive

- **1440 and 1280**: five across as designed.
- **1024**: four across, the fifth wraps to a second row and the row stays centred.
- **768**: three across, then two wrapping, centred.
- **480**: two across.
- **375 and 320**: two across still works because the cards are narrow. Verify the two-line caption does not become four lines. If it does, drop to one across.
- The background photograph must keep its subject at every width. A tall narrow viewport will crop it badly, so set `object-position` deliberately and say what you chose.
- Header vertical padding shrinks with the breakpoints.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Header revealed first.
- Award cards staggered 80ms apart, capped at 400ms total, so five cards finish quickly.
- Cards fade and rise 24px, no scale. These are flat white cards, a scale looks wrong on them.
- The background photograph does not animate. No parallax.

## Files

- `components/sections/home/Awards.tsx` — Server Component. No client component should be needed.
- `lib/data/awards.ts` — typed array

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no distorted badge, no ragged card heights, no broken wrap.
- The heading passes WCAG 2.1 AA against the palest and the busiest part of the photograph behind it. Report the ratios.
- Every badge has a meaningful `alt`.
- The wrapped rows stay centred, they do not left-align and leave a gap.
- Heading order correct: this is an `h2`.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
