/**
 * Tailwind classes for a page's first <section> when the site header should
 * float transparently over it. Cancels the fixed-height spacer <Navbar> renders
 * (h-56 / xl:h-88) so the absolute, transparent header overlaps the section
 * instead of sitting above it — must stay in sync with that spacer's height.
 *
 * Pair it with a bare `data-hero-sentinel` attribute on the same <section>:
 * that is what `useHeaderScroll` observes to drive the transparent + non-sticky
 * state (and to re-hide the white sticky header when the user scrolls back up
 * into the hero).
 *
 * Lives in its own module (no "use client") so server-rendered hero sections
 * can import it without pulling in the client hook.
 */
export const HERO_HEADER_OFFSET = "-mt-56 xl:-mt-88";
