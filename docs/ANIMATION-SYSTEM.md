# Animation System

One motion language for the whole site. The homepage is the reference
implementation; every other page inherits it by using the same pieces:

| Piece | Where | Owns |
|---|---|---|
| Motion tokens | `app/globals.css` | duration, easing, travel distance |
| `<Reveal>` | `components/ui/Reveal.tsx` | every ordinary scroll entrance |
| `<TextReveal>` | `components/motion/TextReveal.tsx` | display headings, word by word |
| `<ImageReveal>` | `components/motion/ImageReveal.tsx` | editorial photography |
| `<Parallax>` | `components/motion/Parallax.tsx` | scroll-linked depth |
| `<HorizontalScroll>` | `components/motion/HorizontalScroll.tsx` | sticky sideways sections |
| Interaction classes | `lib/motion/interactions.ts` | card hover / press |
| Cascade helpers | `lib/motion/timing.ts` | the order things arrive in |
| Shared observer | `lib/motion/observer.ts` | one `IntersectionObserver` for all entrances |
| Shared scroll loop | `lib/motion/scroll-driver.ts` | one rAF loop for all scroll-linked motion |

`components/motion/index.ts` re-exports all of them (including `Reveal`, which
stays in `components/ui` because nearly every section already imports it there),
so a section never has to know which folder a primitive lives in.

Smooth page scrolling comes from a single Lenis instance in
`lib/motion/smooth-scroll-provider.tsx`, mounted once in the root layout.

**Rule: no component defines its own entrance timing, easing or distance.**
If a section needs a different feel, change a token or add a variant here.

---

## 1. Tokens

Defined in `app/globals.css` and consumed as `var(--...)` inside Tailwind
arbitrary values, so JS never duplicates a number.

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);  /* everything that enters or settles */
--ease-standard: ease;                        /* plain colour fades */

--dur-fast: 150ms;    /* progress-bar width */
--dur-base: 250ms;    /* hover states, card lift, tab indicator */
--dur-slow: 400ms;    /* chevron slide-ins */
--dur-image: 500ms;   /* card photo push-in */
--dur-reveal: 650ms;  /* scroll entrances */
--dur-counter: 1600ms;/* stat count-up */

--reveal-distance: 24px;  /* 16px under 768px */
--reveal-threshold: 0.15;

--ease-mask: cubic-bezier(0.16, 1, 0.3, 1);
--dur-mask: 900ms;        /* one heading word rising into place; 720ms on phones */
--mask-stagger: 70ms;     /* gap between words; 45ms on phones */
--mask-travel: 110%;      /* how far below its line a word starts */

--dur-image-reveal: 1000ms;   /* clip-path uncover; 800ms on phones */
--image-reveal-scale: 1.06;   /* photo start scale, eases back to 1 */
```

Phones get their own values, not merely smaller ones: a cascade tuned for a
1440px headline reads as sluggish when the same words wrap onto five lines.

The pairing that carries most of the "premium" feel: a card lifts on
`--dur-base` so the pointer feels answered at once, while the photo inside eases
for `--dur-image` — twice as long. Fast acknowledgement, slow settle.

## 2. Scroll entrances

`<Reveal>` is the only entrance primitive. It arms before first paint (so there
is no flash of visible content), watches one `IntersectionObserver` at threshold
`0.15` with a `-10%` bottom root-margin, animates once, then unobserves.

```tsx
<Reveal delay={cascade(1)}>
  <Heading level={2} size="h2">{title}</Heading>
</Reveal>
```

| Variant | Motion | Use for |
|---|---|---|
| `up` (default) | opacity 0->1, translateY `--reveal-distance`->0 | headings, copy, cards, rows |
| `scale` | opacity 0->1, scale 1.04->1 | photographs — they settle rather than slide |
| `fade` | opacity only | overlays and controls that must not move |

Only `opacity` and `transform` are ever animated. Never height, width, top,
box-shadow or filter.

Mobile travel is handled in CSS (`--reveal-distance` drops to 16px under 768px),
not with a JS breakpoint check — one less matchMedia subscription per element.

## 2b. Display headings

`<TextReveal>` is the site's loudest motion and the one that carries the
"expensive" read: every word starts below its own line, masked by that line, and
rises into place `--mask-stagger` behind the one before it.

```tsx
<TextReveal delay={cascade(1)}>
  <Heading level={2} size="h2">{title}</Heading>
</TextReveal>
```

It wraps rather than taking a `text` prop, so the heading keeps its own tag,
size classes and any rich formatting - only bare text nodes are split, into
inline-block **words**, which leaves native line wrapping intact. There are no
measured line breaks to go stale on resize and no layout shift.

**Reserved for display typography**: hero H1s and major section H2s. Running it
on body copy is exactly what makes a site read as "animated" rather than as
considered. Paragraphs, cards, stats and controls use `<Reveal>`.

The per-word delay is the one number mirrored in JS rather than read from CSS -
`transition-delay` cannot be `calc(index * var(--mask-stagger))`. The mirror is
gated on the same 768px breakpoint, one `matchMedia` subscription per heading.

## 2c. Photography

`<ImageReveal>` uncovers a photograph rather than fading it: the frame's
`clip-path` opens from one edge while the picture inside eases back from
`--image-reveal-scale` to 1. The over-scale is what stops it reading as a wipe -
the image is already alive when the mask clears it.

```tsx
<ImageReveal className="relative aspect-[630/476] overflow-hidden rounded-16">
  <Image src={...} alt={...} fill className="object-cover" />
</ImageReveal>
```

Use it for editorial photography that carries a section. Cards in a grid stay on
`<Reveal variant="scale">` - twelve simultaneous clip-path animations is noise,
and a card's photo is not the thing being introduced.

The mask sits on its own inner layer because `clip-path: inset()` clips to a
plain rectangle and would square off the wrapper's border-radius.

## 2d. Scroll-linked motion

Both scroll-linked primitives subscribe to `lib/motion/scroll-driver.ts`: one
rAF loop, shared, running only while something is subscribed. Subscribers write
transforms straight to the DOM and never call `setState`, so a scroll causes
zero React re-renders. They read Lenis's *eased* scroll value - `window.scrollY`
jumps in wheel-sized steps while Lenis interpolates between them, and anything
driven by it visibly stutters.

`<Parallax distance={PARALLAX_DISTANCE_PX}>` drifts an element against the page
as it crosses the viewport. Desktop pointer only (`min-width: 1024px` and
`pointer: fine`) - parallax on touch stutters on mid-range Android and is the
single most common reason a site of this style feels worse on a phone than a
static one would. The element must be scaled past its frame or the drift exposes
an edge. Live on the Energy Ecosystem backdrop.

`<HorizontalScroll>` pins a section and moves a row of cards sideways as the
page scrolls down. **Infrastructure - no section uses it yet.** It exists so
that when a section is designated horizontal it gets the same behaviour as every
other one rather than a bespoke implementation. Do not apply it to a section
that has not been asked for.

Its wrapper height is *measured* (sticky height plus exactly the distance the
track has to cover), progress comes from the wrapper's own `rect.top` rather
than accumulated wheel deltas - nothing is hijacked, and a scrollbar drag or an
anchor jump behaves normally - and the track eases toward its target instead of
snapping, which is what makes the sideways travel feel like the same gesture as
the page scroll. Below `lg`, and under reduced motion, none of it runs: the
track becomes an ordinary swipeable overflow row.

## 3. Cascade and stagger

Order is the part CSS cannot express, so it lives in `lib/motion/timing.ts`.
One step is **80ms**.

```
eyebrow      cascade(0)   0ms
heading      cascade(1)   80ms
body / CTA   cascade(2)   160ms
content      stagger(i, CONTENT_BASE_DELAY_MS)
```

`stagger(index, base)` caps at 5 items — beyond that every later card shares the
last delay, so a long grid never leaves its tail visibly waiting.

The hero runs its own cascade (`HERO_HEADING_DELAY_MS` / `HERO_BODY_DELAY_MS` /
`HERO_CTA_DELAY_MS`). Its H1 uses `<TextReveal>`, whose mask is still running
~900ms after it starts; on the 80ms cascade the supporting copy and CTA would
land mid-headline and the whole entrance would read as one indistinct clump.

Import the helpers; do not write `160 + index * 80` in a section. Sections used
to each declare their own `CARD_REVEAL_STEP_MS`, which is exactly how a page
drifts into feeling like twelve separate builds.

## 4. Hover and press

From `lib/motion/interactions.ts`:

| Constant | Motion |
|---|---|
| `CARD_LIFT` | translateY -4px, `--dur-base` |
| `CARD_IMAGE_ZOOM` | scale 1.04, `--dur-image`, GPU-only |
| `CARD_TITLE_TINT` | colour -> `secondary`, `--dur-base` |
| `LINK_CHEVRON` | slide in from -4px + fade, `--dur-slow` |

Buttons: colour shift on hover, `active:scale-[0.98]` on press, both on
`--dur-base`. Nothing moves more than 4px on hover — restraint is the point.

Every hover effect is mirrored on `focus-visible`, so keyboard users get the
same feedback.

## 5. Smooth scrolling

Lenis runs once, from the root layout:

- duration 1.15s, expo-out easing
- `smoothWheel: true` — eased wheel and trackpad
- `syncTouch: false` — touch scrolling stays native. Applying inertia to touch
  is the single most common way a site feels *worse* on a phone.
- Under `prefers-reduced-motion`, Lenis is never constructed.

`lib/motion/lenis-instance.ts` exposes the instance so scroll-linked code reads
Lenis's *eased* value rather than `window.scrollY`, which would jitter.

### Carousels and the global scroll engine

Lenis sets `scroll-behavior: auto !important` on `html.lenis`. That silently
kills `scrollBy({ behavior: "smooth" })` — native smooth scrolls collapse into
instant jumps. `Carousel` therefore drives horizontal movement with its own rAF
tween (750ms, expo-out `1 - 2^(-10t)`) so an arrow click reads like the page
scroll.

While a JS-driven scroll is in flight — arrow tween or pointer drag —
`scroll-snap-type` is switched off and restored only once the track has settled
on a card start, so the browser never fights the animation. Drag release eases
onto the nearest card rather than letting snap teleport there. Wheel, touch and
pointer input all cancel an in-flight tween, and `overscroll-behavior-x:
contain` stops a horizontal fling triggering browser back-navigation.

## 6. Section-specific exceptions

These differ from the shared language on purpose. Anything else that differs is
a bug.

| Where | Motion | Why |
|---|---|---|
| Hero slides | 1200ms crossfade + Ken Burns zoom to 1.07 over the 6s autoplay | a slideshow transition, not a scroll reveal |
| Logo ticker | linear marquee at 20px/sec (`SPEED_PX_PER_SEC`), 0.65->1 opacity on hover, paused on hover/focus | continuous motion needs linear easing |
| Section eyebrow | 2.4s ping, holding invisible after the pulse | reads as a slow radar ping, not a strobe |
| Tab panels | 250ms in / 200ms out crossfade, panels stay mounted | avoids height jump and image reload |
| Accordions | 300ms `grid-template-rows` 0fr->1fr | the one place a size is animated; there is no transform equivalent |
| Stat count-up | 1600ms ease-out cubic, once | `threshold: 0` so a fast mobile fling cannot skip it |

## 7. Reduced motion

Three layers, in order:

1. `<Reveal>` renders content at its end state and attaches no observer.
2. `SmoothScrollProvider` never constructs Lenis; the page scrolls natively.
3. A global guard in `globals.css` clamps every remaining transition and
   animation to `0.01ms`, catching inline styles Tailwind variants cannot reach.

Component-level `motion-reduce:` variants back all three up.

## 8. Performance rules

- Animate `transform` and `opacity` only.
- **One** `IntersectionObserver` for the whole page (`lib/motion/observer.ts`).
  Elements register, fire once, and unregister themselves. A long page renders
  well over a hundred entrances; that used to be a hundred observers.
- **One** rAF loop for all scroll-linked motion (`lib/motion/scroll-driver.ts`),
  running only while something is subscribed, alongside Lenis's own.
- Scroll-linked code writes to `element.style` directly. No `setState` on a
  scroll, ever.
- Off-screen subscribers bail out before measuring - on a long page that is most
  of them on most frames.
- One rAF loop for Lenis; carousel scroll handlers are rAF-throttled.
- `will-change` / `transform-gpu` only where a layer is genuinely needed
  (ticker track, hero zoom, card images) — a permanent layer on everything costs
  more than it saves. `<TextReveal>` sets it per word only while that word still
  has somewhere to go, and drops it once the heading has settled.
- No scroll-linked parallax on touch. It stutters on mid-range Android and is
  the most common source of janky mobile scroll in sites of this style.

## 9. Audit checklist

- [ ] No `opacity-0` + `translate-y-*` entrance pair outside `Reveal.tsx`
- [ ] No bespoke `IntersectionObserver` for an entrance
- [ ] No literal duration or cubic-bezier in a component — tokens only
- [ ] No section declaring its own stagger constants
- [ ] Every hover has a matching `focus-visible`
- [ ] Every new animation honours `prefers-reduced-motion`
- [ ] Section-specific motion is listed in §6 or removed
- [ ] `<TextReveal>` only on display headings, never on body copy
- [ ] No bespoke scroll listener or rAF loop - subscribe to the scroll driver
- [ ] No scroll handler calling `setState`
- [ ] `<HorizontalScroll>` only on sections that were explicitly designated
