export interface Award {
  /** i18n key under home.awards.items */
  key: string;
  image: string;
  /** Literal description of the badge artwork, used as the img alt. */
  alt: string;
}

/**
 * TODO(Easin): Figma's caption text is identical on all five cards
 * ("Leading Renewable Energy Manufacturer Award") and the exported badge
 * artwork is generic HotelTechReport placeholder art, not CNX awards.
 * Client needs to supply: 1) the real award name per card, 2) real badge
 * artwork per card. Swap `public/images/home/awardImage0N.png` and the
 * matching `home.awards.items.*` caption in messages/en.json + zh.json.
 */
export const awards: Award[] = [
  {
    key: "award1",
    image: "/images/home/awardImage01.png",
    alt: "Finalist, Best Property Management Systems 2025 award badge",
  },
  {
    key: "award2",
    image: "/images/home/awardImage02.png",
    alt: "Best Places to Work in Hotel Tech 2025 award badge",
  },
  {
    key: "award3",
    image: "/images/home/awardImage03.png",
    alt: "Best All-in-1 Hotel Management System 2025 award badge",
  },
  {
    key: "award4",
    image: "/images/home/awardImage04.png",
    alt: "Best All-in-1 Hotel Management System 2025 award badge",
  },
  {
    key: "award5",
    image: "/images/home/awardImage05.png",
    alt: "Finalist, Best Revenue Management System 2022 award badge",
  },
];
