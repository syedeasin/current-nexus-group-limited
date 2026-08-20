export interface HeroSlide {
  id: string;
  image: string;
  /** CSS object-position for the background photo; not translatable, tied to the photo's crop. */
  imagePosition: string;
  ctaHref: string;
  messageKey: "solar750w" | "bess488" | "smartPv";
}

export const heroSlides: HeroSlide[] = [
  {
    id: "750w-solar",
    image: "/images/hero/hero-750w-solar.webp",
    imagePosition: "50% 65%",
    ctaHref: "/contact",
    messageKey: "solar750w",
  },
  {
    id: "488kwh-bess",
    image: "/images/hero/hero-488kwh-bess.webp",
    imagePosition: "50% 25%",
    ctaHref: "/contact",
    messageKey: "bess488",
  },
  {
    id: "smart-pv",
    image: "/images/hero/hero-smart-pv.webp",
    imagePosition: "50% 50%",
    ctaHref: "/contact",
    messageKey: "smartPv",
  },
];
