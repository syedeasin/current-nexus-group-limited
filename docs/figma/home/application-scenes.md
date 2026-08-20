# Application Scenes spec

Homepage section 6, below Premium Solutions.

- Figma file key: `i33LdfVXDnYGB5cfVqiqF1`
- Section node: `2283:8551`
- Frame: 1600 x 896

Read `docs/figma/home/_animation.md` first. Then read `2283:8551` with `get_design_context` and `get_metadata` and pull every exact number from Figma. This spec defines structure, behaviour, content and responsive rules. Where a number is not stated here, take it from Figma. Where this file and Figma disagree, Figma wins and you tell me.

## Structure

```
Section, light background
└── Container size="section"
    ├── Header, centred
    │   ├── eyebrow   SCENE OF APPLICATIONS
    │   └── h2        two lines
    └── Carousel
        ├── track      cards, horizontally scrollable, peeking on the right
        └── controls   progress bar on the left, prev and next on the right
```

## Header

- Eyebrow: `SCENE OF APPLICATIONS`, using `SectionEyebrow`.
- Heading, `h2`, two lines:
  `Built for reliable performance`
  `and economic efficiency.`
- Centred. Use `text-balance` and confirm it produces the same two lines.

## Carousel

This is the important part. In Figma the fourth card is **deliberately cut off at the right edge of the frame**, so the user can see there is more. Reproduce that peek exactly, it is not a rendering artefact.

- Cards sit in a horizontal row, equal width, with an even gap. Pull the card width and gap from Figma.
- The track scrolls horizontally. Use native `overflow-x: auto` with `scroll-snap-type: x mandatory` and `scroll-snap-align: start` on each card, plus `scroll-behavior: smooth`. Do not build a transform-based carousel, native scrolling gives free touch, trackpad and keyboard support.
- Hide the scrollbar visually but keep the element scrollable.
- The track must bleed past the container on the right so the next card peeks. The left edge stays aligned to the container.

### Card

- Photograph on top, rounded, fixed aspect ratio. Pull the radius and ratio from Figma.
- Title below the image.
- Two-line description below the title.
- Reserve two lines for the description so cards in a row never end at different heights.
- On hover, a circular arrow button fades in over the centre of the image, exactly as the second card shows in Figma. That is a hover state, not a separate card type. The button also appears on keyboard focus.
- The whole card is a single link. Mark the image `aria-hidden` and keep one accessible name per card.
- All cards link to `/solutions` for now. They must be clickable today.

### Controls row

Below the cards.

- **Left**: a thin full-width progress track with a filled segment showing scroll position. The filled width is `scrollLeft / (scrollWidth - clientWidth)` mapped across the track, updated on scroll. Give it `role="presentation"`, the buttons carry the real controls.
- **Right**: two circular buttons. Previous is outlined, next is filled with the secondary gold token, matching Figma.
- Buttons scroll the track by exactly one card plus one gap, using `scrollBy` with smooth behaviour. Do not manage an index in state, read the scroll position instead. That keeps the buttons and touch scrolling in sync.
- Disable previous at the start and next at the end. Disabled state is visually muted and `aria-disabled`.
- `aria-label` of `Previous` and `Next`. Visible focus ring using `ring-secondary`.

## Content

Four cards:

1. `Residential solar` — `Reduce energy costs while improving efficiency across modern commercial facilities.`
2. `Commercial buildings` — `Lower operating costs and enhance business efficiency with reliable energy solutions.`
3. `Utility-Scale solar` — `Built for high-performance, large-scale modern renewable energy projects worldwide.`
4. `Virtual power plant` — description is cut off in Figma. Read the full text from the node. If it is genuinely truncated in the design, write a sentence in the same voice and length as the other three, and flag it to me.

Note: card 1 is titled `Residential solar` but its description talks about commercial facilities. That is a copy error in Figma. Reproduce it as designed and flag it in your report. Do not silently fix it.

All copy into `messages/en.json` under `home.applicationScenes`, same keys into `zh.json` with English placeholders.

## Images

Files already exist at `public/images/home`. Do not download from Figma and do not generate anything. List the folder and map what is there. Convert to WebP, keep each under 200KB, report the sizes. `next/image` with a correct `sizes` attribute, no `priority`.

## Responsive

- **1440 and 1280**: three full cards plus a peek, matching Figma.
- **1024**: two and a half cards visible.
- **768**: one and a half cards visible. Header steps down through the tokens.
- **480 and below**: one card plus a small peek, roughly 85% of the viewport width so the next card is clearly hinted.
- The controls row stays visible at every width. At 480 and below, if the progress track and buttons crowd, put the track on its own line above the buttons and say so.
- No horizontal overflow at 320. The scrolling track must not create a page-level scrollbar.

## Animation

Follow `_animation.md`. Specific to this section:

- Header revealed first, then the cards staggered 80ms apart.
- The progress bar fill transitions over 150ms `ease-out` as the user scrolls, so it glides rather than snapping.
- The hover arrow button fades and scales from 0.9 to 1 over 200ms.

## Files

- `components/sections/home/ApplicationScenes.tsx` — Server Component
- `components/sections/home/application-scenes/SceneCarousel.tsx` — `"use client"`, the smallest possible leaf
- `components/ui/SceneCard.tsx` — reuse `ProductCard` if the shape genuinely fits, otherwise build this and tell me why it could not be reused
- `lib/data/applicationScenes.ts` — typed array

## Checks before you report done

- 1440, 1280, 1024, 768, 480, 375, 320: no horizontal overflow, no distorted photo, no ragged card heights.
- The right-edge peek is present at every width.
- Touch swipe, trackpad scroll and the arrow buttons all keep the progress bar in sync.
- Buttons disable correctly at both ends.
- Every card is clickable across its whole area, and a screen reader hears one name per card.
- Reduced motion: no smooth scrolling, no hover arrow animation.
- No console errors, no hydration warnings.

List anything in Figma that was ambiguous and state the decision you made, rather than stopping to ask.

Run only `npx tsc --noEmit` to type-check. Do NOT run `npm run build` — my dev server is running and a production build corrupts the .next cache.
