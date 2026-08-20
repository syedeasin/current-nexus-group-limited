export interface ApplicationScene {
  /** i18n key under home.applicationScenes.cards */
  key: string;
  image: string;
  href: string;
}

export const applicationScenes: ApplicationScene[] = [
  {
    key: "residentialSolar",
    image: "/images/home/residentialSolar.webp",
    href: "/solutions",
  },
  {
    key: "commercialBuildings",
    image: "/images/home/commercialBuildings.webp",
    href: "/solutions",
  },
  {
    key: "utilityScaleSolar",
    image: "/images/home/utilityScaleSolar.webp",
    href: "/solutions",
  },
  {
    key: "virtualPowerPlant",
    image: "/images/home/virtualPowerPlantSolutions.webp",
    href: "/solutions",
  },
];
