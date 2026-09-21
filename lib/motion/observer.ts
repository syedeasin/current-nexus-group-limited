/**
 * One IntersectionObserver for every scroll entrance on the page.
 *
 * Each `<Reveal>`, `<TextReveal>` and `<ImageReveal>` used to construct its own
 * observer. A long page renders well over a hundred of them, and every one is a
 * separate object the compositor has to keep intersection rects for. They all
 * want the same threshold and root margin, so they can share a single instance:
 * elements register, fire once, and unregister themselves.
 *
 * Threshold and root margin mirror `--reveal-threshold` in globals.css. The
 * `-10%` bottom margin means an element is considered "in view" slightly before
 * it really is, so the motion has already started by the time the reader's eye
 * arrives.
 *
 * @see docs/ANIMATION-SYSTEM.md
 */

type EnterCallback = () => void;

const THRESHOLD = 0.15;
const ROOT_MARGIN = "0px 0px -10% 0px";

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, EnterCallback>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        // Unobserve before invoking: entrances run once, and dropping the
        // element here keeps the shared observer's target list short.
        observer?.unobserve(entry.target);
        callbacks.delete(entry.target);
        callback?.();
      }
    },
    { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
  );

  return observer;
}

/**
 * Run `onEnter` once, the first time `element` scrolls into view.
 * Returns a cleanup function that cancels the registration.
 */
export function observeOnce(element: Element, onEnter: EnterCallback): () => void {
  const instance = getObserver();

  // No IntersectionObserver (very old browser, jsdom): show immediately rather
  // than leaving the element stuck in its hidden state.
  if (!instance) {
    onEnter();
    return () => {};
  }

  callbacks.set(element, onEnter);
  instance.observe(element);

  return () => {
    instance.unobserve(element);
    callbacks.delete(element);
  };
}
