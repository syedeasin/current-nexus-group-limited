export type ImageCredit = { alt: string; credit: string; reference: string }

export type ImageCreditMap = Record<string, ImageCredit>
export type PageImageMap = Record<string, Record<string, ImageCredit & { src: string }>>

const EMPTY_CREDIT: ImageCredit = { alt: "", credit: "", reference: "" }

/**
 * Looks up alt text / credit / reference for an image by its src.
 * Pass in your own credits map (originally sourced from a data/imageCredits
 * file that was specific to the source project and is not part of this export).
 */
export function getImageMeta(credits: ImageCreditMap, src: string): ImageCredit {
  return credits[src] ?? EMPTY_CREDIT
}

/**
 * Looks up a named image slot on a given page (e.g. a hero image).
 * Pass in your own page-image map (originally sourced from a data/imageCredits
 * file that was specific to the source project and is not part of this export).
 */
export function getPageImage(pageImages: PageImageMap, page: string, slot: string) {
  return pageImages[page]?.[slot] ?? { src: "", alt: "", credit: "", reference: "" }
}
