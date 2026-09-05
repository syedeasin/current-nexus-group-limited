# Animation System — Motion Guidelines

Single source of truth for every entry/scroll animation on cnx-website.
Values measured directly from a reference Framer site's live DOM/CSS.

## Core scroll-entry values (locked)
- Offset: translateY(40px) → translateY(0)
- Opacity: 0 → 1
- Duration: 750ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Trigger: IntersectionObserver, threshold 0.15, fires once, unobserves after
- Stagger: sibling elements offset by 50-150ms via the `delay` prop, never by duplicating transition logic
- Reduced motion: `usePrefersReducedMotion()` disables the animation entirely, final state shown immediately

## Marquee / ticker values (locked)
- Speed: 20px/sec (`SPEED_PX_PER_SEC` constant)
- Default logo state: opacity 0.65
- Hover/focus state: opacity 1.0, transition-opacity 300ms

## Rules
1. Every scroll-entering element MUST be wrapped in `<Reveal>`. No bespoke `opacity-0 translate-y-*` combos anywhere else in the codebase.
2. Never attach a raw Tailwind `duration-*` / `ease-*` pair to an entrance animation outside `Reveal.tsx`. Timing lives in one file only.
3. `HeroCarousel.tsx`'s image crossfade (1200ms scale+fade) is a deliberate exception — it is a slideshow transition, not a scroll-reveal, and is not expected to match these values.
4. If a new section needs a different entrance feel, extend `Reveal`'s existing variants (`up` / `scale` / `fade`) — do not invent a new one without updating this doc.
5. `Carousel.tsx` drives horizontal card scrolling with its own rAF tween (750ms, expo-out `1 - 2^(-10t)`), not `scrollBy({ behavior: "smooth" })`. This is a deliberate exception: Lenis sets `scroll-behavior: auto !important` on `html.lenis`, so every native smooth scroll would collapse into an instant jump. Scroll-snap is disabled for the duration of the tween (and of a pointer drag) and re-enabled once the track has settled on a card start.

## Audit checklist
- [ ] No component outside `Reveal.tsx` defines its own `opacity-0` + `translate-y-*` scroll-entrance pair
- [ ] No component defines its own IntersectionObserver for entrance animation (should always delegate to `<Reveal>`)
- [ ] `LogoTicker.tsx` speed constant matches this doc
- [ ] Any carousel/slider crossfade timing is documented here as an explicit, intentional exception if it differs