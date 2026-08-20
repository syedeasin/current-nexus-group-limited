# CTA Band spec

Homepage section 12, the last one, sitting directly above the existing Footer.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Background image group: `4013:10007`

## Read this before anything else

`4013:10007` is **only the background image group**, 1600 x 740. It contains an image placeholder, the factory photograph, and a second placeholder on top which is almost certainly the scrim.

The heading and the button are **not** in that node. They live in its parent.

So: call `get_metadata` on `4013:10007`, walk up to its parent, and read the full CTA band from there. Report the parent node id you used so I can record it. Pull all copy and all geometry from that parent. Do not build from the background node alone.

Read `docs/figma/home/_animation.md` first.

## Structure

```
Section, full bleed
├── background   factory interior photograph
├── scrim        dark, heaviest at the bottom where it meets the Footer
└── Container size="section"
    ├── h2       the closing pitch
    └── Button   primary CTA
```

## Rules

- **Do not touch `components/layout/Footer.tsx`.** This band sits above it and nothing else changes.
- Check in Figma whether the band sits flush against the Footer or overlaps it. If there is a negative offset, reproduce it exactly. The Footer already has its own background wordmark, so an overlap must not collide with that. Report what you found.
- Photograph full bleed with `object-cover` inside `overflow-hidden`.
- The scrim is the second placeholder rectangle in the group. Pull its real fill or gradient stops from Figma. Do not invent a flat black overlay.
- The bottom of the band fades into the Footer's dark background. Confirm whether that fade is part of the scrim or a separate gradient, and reproduce it so there is no visible seam between this section and the Footer.

## Content

Take the exact heading and button label from the parent node. Do not guess them and do not write your own.

Put them in `messages/en.json` under `home.cta`, and the same keys into `zh.json` with English placeholders. The button links to `/contact` for now.

Use the `Button` primitive at the large size. Do not hand-roll it.

## Images

The photograph already exists at `public/images/home`. Do not download from Figma and do not generate anything. Convert to WebP, keep it under 300KB, report the size. `next/image` with a correct `sizes` attribute, no `priority`, this is the bottom of the page.

## Responsive

- **1440 and 1280**: as designed.
- **1024 and 768**: heading steps down through the tokens, vertical padding shrinks, band height reduces so it does not become a tall empty photograph.
- **480 and below**: heading steps down again, button goes full width.
- The photograph must keep its subject at every width. A narrow viewport will crop the factory line badly, so set `object-position` deliberately and say what you chose.
- The seam with the Footer must be invisible at every width. Check it specifically at 375.
- No horizontal overflow at 320.

## Animation

Follow `_animation.md`. Specific to this section:

- Heading revealed first, then the button, 80ms apart.
- The photograph does the 1.04 to 1 scale on first reveal, inside `overflow-hidden`.
- No parallax. This sits at the bottom of a long page and parallax here costs scroll performance for no benefit.

## Files

- `components/sections/shared/CtaBand.tsx` — Server Component. It lives in `shared`, not `home`, because other pages will reuse it. Take a `heading`, `ctaLabel`, `ctaHref` and `image` as props with sensible defaults, so a future page can pass its own.

`CtaBand` is generic once it takes props. Tell me whether it belongs in `F:\easin-next-starter`.

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no clipped heading, no visible seam against the Footer.
- The heading and button pass WCAG 2.1 AA against the brightest part of the photograph with the real scrim. Report the measured ratio.
- The Footer wordmark is not covered or clipped by this band.
- Heading order correct: this is an `h2`.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
