export interface ApplicationScene {
  /** i18n key under home.applicationScenes.cards */
  key: string;
  image: string;
  href: string;
}

/**
 * Hrefs reuse the exact paths config/nav.config.ts already declares for the
 * same solutions. Only /solutions-projects/solutions/residential has a real
 * page today — the rest fall through to the app's not-found page until those
 * pages are built (no new pages for the first MVP pass — client's explicit
 * call). "/solutions" itself was never a real route.
 */
export const applicationScenes: ApplicationScene[] = [
  {
    key: "residentialSolar",
    image: "/images/home/residentialSolar.webp",
    href: "/solutions-projects/solutions/residential",
  },
  {
    key: "commercialBuildings",
    image: "/images/home/commercialBuildings.webp",
    href: "/solutions-projects/solutions/commercial-industrial",
  },
  {
    key: "utilityScaleSolar",
    image: "/images/home/utilityScaleSolar.webp",
    href: "/solutions-projects/solutions/utilities",
  },
  {
    key: "virtualPowerPlant",
    image: "/images/home/virtualPowerPlantSolutions.webp",
    href: "/solutions-projects/solutions/virtual-power-plant",
  },
  {
    key: "supplyChainFinancing",
    image: "/images/home/supplyChainFinancing.webp",
    href: "/solutions-projects/solutions/supply-chain-financing",
  },
];
