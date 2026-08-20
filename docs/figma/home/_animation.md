# Shared motion language

Every homepage section must obey this file. Read it before building any section in `docs/figma/home/`.

The goal is one consistent, calm, premium feel while scrolling. Industrial buyers, not a startup landing page. Nothing bounces, nothing spins, nothing slides in from the side.

## Rules

1. **No animation libraries.** No framer-motion, no motion, no gsap, no tailwindcss-animate. Everything is CSS transitions plus the existing `Reveal` component.
2. **Every animation respects `prefers-reduced-motion: reduce`.** Under it, content renders at its final state instantly. No fades, no translates, no counters, no autoplay.
3. **Reveal fires once.** Never re-animate on scroll back up.
4. **Nothing animates layout.** Only `opacity` and `transform`. Never animate `height`, `width`, `top`, `left` or `margin`.
5. **No content is invisible without JavaScript.** `Reveal` renders children visible by default and only hides them once the observer is confirmed active.

## The scroll-reveal recipe

Every section entrance uses the same values.

- Distance: 24px upward translate.
- Duration: 600ms.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Trigger: the element is 15% into the viewport.
- Stagger between siblings: 80ms. Cap the total stagger at 400ms so a six-item list does not take half a second to finish.

Order within a section is always the same:

1. Eyebrow
2. Heading
3. Supporting paragraph
4. Controls, such as tabs or a toggle
5. Content grid or cards, staggered

## Images

Any photograph revealed for the first time:

- Fade in, plus scale from 1.04 to 1.
- Duration 700ms, same easing.
- The rounded frame around it needs `overflow-hidden` so the scale never spills.

## Hover

- Cards: 4px lift plus a 1.03 image scale. 250ms, `ease-out`. Never shifts neighbours.
- Links with a chevron: colour moves to the secondary token, underline appears, chevron slides 4px right. 200ms.
- Buttons: background shifts only. No scale, no shadow jump.

## Tab and carousel transitions

- Outgoing content fades out, incoming fades in with an 8px upward translate. 250ms, `ease-out`.
- Reserve the container height so nothing jumps.
- Do not run `Reveal` again on a tab or slide change, that is a separate transition.
- Under reduced motion, the swap is instant.

## The section eyebrow

`components/ui/SectionEyebrow.tsx` already exists with the animated double-circle marker. Every section uses it. Do not rebuild it and do not hand-roll a marker.

## Focus

Every interactive element gets a visible focus ring using `ring-secondary`. Focus styles never animate.

## Performance

- `will-change: transform` only on elements that are actually moving continuously, such as the logo ticker. Never on reveal targets.
- No animation may run when its section is off screen.
- No layout shift at any point. Reserve space for anything that grows.
