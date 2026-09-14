/**
 * Static, non-translatable content for the Residential solutions page
 * (Figma node 4028:10429). Copy lives in `messages/*.json` under
 * `solutions.residential`; only assets, hrefs and the ordering live here — the
 * same split the manufacturing and home data modules use.
 */

const IMAGE_ROOT = "/images/solutionsAndProjects/solutions/residential";

export const residentialBannerImage = `${IMAGE_ROOT}/solutions-residential-heroBanner.webp`;

export interface ResidentialStat {
  /** Rendered verbatim — these are units ("540W", "30 year"), not countable numbers. */
  value: string;
  /** i18n key under `solutions.residential.stats`. */
  labelKey: "modulePerformance" | "efficiency" | "annualReduction" | "warranty";
}

/** Figma node 4028:10450 — four equal columns separated by 2px rules. */
export const residentialStats: ResidentialStat[] = [
  { value: "540W", labelKey: "modulePerformance" },
  { value: "23%", labelKey: "efficiency" },
  { value: "0.4%", labelKey: "annualReduction" },
  { value: "30 year", labelKey: "warranty" },
];

export interface ResidentialApplication {
  /** i18n key under `solutions.residential.applications.cards`. */
  key: string;
  image: string;
}

/**
 * Figma node 4028:10552. The photos are the same five shots the homepage's
 * Application Scenes uses, so they are referenced from `/images/home` rather
 * than duplicated — the last two cards share one image in the design.
 */
export const residentialApplications: ResidentialApplication[] = [
  { key: "independentHouses", image: "/images/home/residentialSolar.webp" },
  { key: "villas", image: "/images/home/commercialBuildings.webp" },
  { key: "apartments", image: "/images/home/utilityScaleSolar.webp" },
  { key: "farmhouses", image: "/images/home/virtualPowerPlantSolutions.webp" },
  { key: "gatedCommunities", image: "/images/home/supplyChainFinancing.webp" },
  { key: "smartHomes", image: "/images/home/supplyChainFinancing.webp" },
];

/** Figma node 4028:10626 — the same photo the BC product page's success story uses. */
export const residentialCaseStudyImage =
  "/images/manufacturing/bc-solar/success-story-bg.webp";
