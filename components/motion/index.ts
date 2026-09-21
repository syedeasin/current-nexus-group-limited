/**
 * The site's motion primitives, in one import surface.
 *
 * `Reveal` stays in `components/ui` — it is the generic entrance used by nearly
 * every section and predates this folder — and is re-exported here so a section
 * never has to know which of the two directories a given primitive lives in.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */
export { default as Reveal } from "@/components/ui/Reveal";
export { default as TextReveal } from "./TextReveal";
export { default as ImageReveal } from "./ImageReveal";
export { default as Parallax } from "./Parallax";
export { default as HorizontalScroll } from "./HorizontalScroll";
