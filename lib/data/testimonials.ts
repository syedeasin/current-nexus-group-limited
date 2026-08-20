export interface Testimonial {
  /** i18n key under home.testimonials.stories */
  key: string;
  /** Exact wordmark as it appears in the client's logo lockup (no spaces) — the quote copy spells it "Lux & Enecore" (spaced), reproduced as designed in both places. */
  clientWordmark: string;
  logo: string;
  photo: string;
  href: string;
}

export const testimonials: Testimonial[] = [
  {
    key: "luxEnecore",
    clientWordmark: "Lux&Enecore",
    logo: "/icons/clients/luxEnecoreLogomark.svg",
    photo: "/images/home/clientTestimonialsBackground.webp",
    href: "/projects",
  },
];
