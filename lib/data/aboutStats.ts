export interface AboutStat {
  value: number;
  suffix?: string;
  /** i18n key under home.about.stats */
  labelKey: "yearsExperience" | "ownFactories" | "countriesExported" | "satisfiedCustomers";
}

export const aboutStats: AboutStat[] = [
  { value: 18, labelKey: "yearsExperience" },
  { value: 6, labelKey: "ownFactories" },
  { value: 50, suffix: "+", labelKey: "countriesExported" },
  { value: 200, suffix: "+", labelKey: "satisfiedCustomers" },
];
