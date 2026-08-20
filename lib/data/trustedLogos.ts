export interface TrustedLogo {
  name: string;
  image: string;
  /** Native width in px at the 32px logo height (Figma), so aspect ratio never distorts. */
  width: number;
}

export const trustedLogos: TrustedLogo[] = [
  { name: "JA Solar", image: "/images/trustedLogos/jaSolarLogo.svg", width: 162 },
  { name: "TW Solar", image: "/images/trustedLogos/twSolarLogo.svg", width: 186 },
  { name: "GOODWE", image: "/images/trustedLogos/goodweLogo.svg", width: 176 },
  { name: "Solis", image: "/images/trustedLogos/solisLogo.svg", width: 86 },
  { name: "HTHIUM", image: "/images/trustedLogos/hthium%20Logo.svg", width: 134 },
  { name: "GROWATT", image: "/images/trustedLogos/growatt%20Logo.svg", width: 191 },
  { name: "Deye", image: "/images/trustedLogos/deye%20Logo.svg", width: 71 },
];
