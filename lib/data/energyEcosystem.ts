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

export const energyEcosystemTabs: EnergyEcosystemTab[] = [
  {
    id: "solar",
    tabKey: "solarPanels",
    products: [
      { key: "backContactSolarPanel", image: solarImage, href: "/products" },
      { key: "hjtsSolarPanel", image: solarImage, href: "/products" },
      { key: "topconSolarPanel", image: solarImage, href: "/products" },
      { key: "odmVerticalSolarModules", image: solarImage, href: "/products" },
    ],
  },
  {
    id: "bess",
    tabKey: "bess",
    products: [
      { key: "residentialBess", image: bessImage, href: "/products" },
      { key: "bess112kwh", image: bessImage, href: "/products" },
      { key: "bess261kwh", image: bessImage, href: "/products" },
      { key: "bess488kwh", image: bessImage, href: "/products" },
    ],
  },
];
