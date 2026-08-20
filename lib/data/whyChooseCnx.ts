export interface WhyChooseReason {
  /** i18n key under home.whyChoose.items */
  key: string;
  icon: string;
}

/**
 * TODO(Easin): only "epcfCreditFinancing" has real body copy in Figma. These
 * five still need real body copy before their rows can expand: verticalManufacturing,
 * bankableTier1, hybridProcurement, technicalAfterSales, globalLogistics.
 */
export const whyChooseReasons: WhyChooseReason[] = [
  { key: "verticalManufacturing", icon: "/icons/why-choose/building-06.svg" },
  { key: "bankableTier1", icon: "/icons/why-choose/shield-energy.svg" },
  { key: "epcfCreditFinancing", icon: "/icons/why-choose/card.svg" },
  { key: "hybridProcurement", icon: "/icons/why-choose/blend.svg" },
  { key: "technicalAfterSales", icon: "/icons/why-choose/customer-support.svg" },
  { key: "globalLogistics", icon: "/icons/why-choose/shipping-truck-02.svg" },
];

export const DEFAULT_OPEN_KEY = "epcfCreditFinancing";
