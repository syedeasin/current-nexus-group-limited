export interface EnergyEcosystemProduct {
  /** i18n key under home.ecosystem.products */
  key: string;
  image: string;
  href: string;
}

export interface EnergyEcosystemTab {
  id: "solar" | "bess";
  /** i18n key under home.ecosystem.tabs */
  tabKey: "solarPanels" | "bess";
  products: EnergyEcosystemProduct[];
}

const solarImage = "/images/energyEcosystem/solarpaelTabImage01.webp";
const bessImage = "/images/energyEcosystem/bessTabImage01.webp";

/**
 * Hrefs reuse the exact paths already declared in config/nav.config.ts for the
 * same products, so both places point at one URL per concept. Only
 * /manufacturing/solar-panels/bc has a real page today (see
 * app/[locale]/(marketing)/manufacturing/solar-panels/bc) — the rest fall
 * through to the app's not-found page until those pages are built. No new
 * pages are being added for the first MVP pass — client's explicit call.
 */
export const energyEcosystemTabs: EnergyEcosystemTab[] = [
  {
    id: "solar",
    tabKey: "solarPanels",
    products: [
      { key: "backContactSolarPanel", image: solarImage, href: "/manufacturing/solar-panels/bc" },
      { key: "hjtsSolarPanel", image: solarImage, href: "/manufacturing/solar-panels/hjt" },
      { key: "topconSolarPanel", image: solarImage, href: "/manufacturing/solar-panels/topcon" },
      {
        key: "odmVerticalSolarModules",
        image: solarImage,
        href: "/manufacturing/solar-panels/odm-vertical-solar-modules",
      },
    ],
  },
  {
    id: "bess",
    tabKey: "bess",
    products: [
      { key: "residentialBess", image: bessImage, href: "/manufacturing/bess/residential" },
      { key: "bess112kwh", image: bessImage, href: "/manufacturing/bess/112kwh" },
      { key: "bess261kwh", image: bessImage, href: "/manufacturing/bess/261kwh" },
      { key: "bess488kwh", image: bessImage, href: "/manufacturing/bess/488kwh" },
    ],
  },
];
