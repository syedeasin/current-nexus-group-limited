export interface FaqItem {
  /** i18n key under home.faq.items — question + answer copy live there, not here. */
  id: string;
}

/**
 * TODO(Easin): Figma only supplies a real answer for "odmOemManufacturing"
 * (see messages/en.json home.faq.items.*.answer). The other five ship with
 * an empty answer string until real copy exists — do not invent it. An
 * empty answer renders the trigger as present but not expandable and is
 * excluded from the FAQPage JSON-LD.
 */
export const faqItems: FaqItem[] = [
  { id: "productsProvided" },
  { id: "odmOemManufacturing" },
  { id: "purchaseInclusions" },
  { id: "tier1Brands" },
  { id: "largeProjectSupport" },
  { id: "afterSalesSupport" },
];

/**
 * Figma inconsistency: question 1 shows the open (minus) icon but has no
 * visible answer; question 2 shows the closed (plus) icon but its answer
 * text is visible. Content wins — "odmOemManufacturing" is the one real
 * answer in the design, so it's the default-open row, not question 1.
 */
export const DEFAULT_OPEN_ID = "odmOemManufacturing";
