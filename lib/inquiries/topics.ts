/**
 * Contact-form topics. The keys are stored on each enquiry; the labels live in
 * messages `contact.form.topics.<key>` so they are translated and editable in
 * Dashboard → Pages → Contact. Client-safe.
 */
export const INQUIRY_TOPICS = ["solarPanels", "bess", "solutions", "distribution", "other"] as const;

export type InquiryTopic = (typeof INQUIRY_TOPICS)[number];

/** Dashboard labels (English), independent of the editable public copy. */
export const INQUIRY_TOPIC_LABELS: Record<InquiryTopic, string> = {
  solarPanels: "Solar panels",
  bess: "Battery storage",
  solutions: "Solutions & projects",
  distribution: "Distribution & partnership",
  other: "Something else",
};

export function isInquiryTopic(value: unknown): value is InquiryTopic {
  return typeof value === "string" && (INQUIRY_TOPICS as readonly string[]).includes(value);
}
