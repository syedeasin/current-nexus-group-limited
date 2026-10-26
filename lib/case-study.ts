/**
 * Case study details stored on a Case Studies post (Post.caseStudy, JSON).
 * Edited in Dashboard → Posts → "Case study details"; read by the case page.
 * Client-safe: plain data and helpers only.
 */
export interface CaseStudyStat {
  value: string;
  label: string;
}

export interface CaseStudyDetails {
  client: string;
  location: string;
  capacity: string;
  application: string;
  products: string;
  completed: string;
  stats: CaseStudyStat[];
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
}

export const CASE_STAT_COUNT = 3;

export const EMPTY_CASE_STUDY: CaseStudyDetails = {
  client: "",
  location: "",
  capacity: "",
  application: "",
  products: "",
  completed: "",
  stats: Array.from({ length: CASE_STAT_COUNT }, () => ({ value: "", label: "" })),
  quote: "",
  quoteAuthor: "",
  quoteRole: "",
};

/** Text fields as posted by the dashboard form, keyed by their input name. */
export const CASE_TEXT_FIELDS = [
  ["client", "caseClient", 120],
  ["location", "caseLocation", 120],
  ["capacity", "caseCapacity", 80],
  ["application", "caseApplication", 160],
  ["products", "caseProducts", 200],
  ["completed", "caseCompleted", 60],
  ["quote", "caseQuote", 600],
  ["quoteAuthor", "caseQuoteAuthor", 120],
  ["quoteRole", "caseQuoteRole", 120],
] as const;

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Anything from the database → a complete, safe CaseStudyDetails. */
export function readCaseStudy(raw: unknown): CaseStudyDetails {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const details = { ...EMPTY_CASE_STUDY };
  for (const [key, , max] of CASE_TEXT_FIELDS) details[key] = str(source[key], max);
  const stats = Array.isArray(source.stats) ? source.stats : [];
  details.stats = Array.from({ length: CASE_STAT_COUNT }, (_, i) => {
    const stat = stats[i] && typeof stats[i] === "object" ? (stats[i] as Record<string, unknown>) : {};
    return { value: str(stat.value, 24), label: str(stat.label, 80) };
  });
  return details;
}

/** The dashboard form's flat fields → CaseStudyDetails (null when every field is empty). */
export function caseStudyFromForm(get: (name: string) => string): CaseStudyDetails | null {
  const raw: Record<string, unknown> = {};
  for (const [key, name] of CASE_TEXT_FIELDS) raw[key] = get(name);
  raw.stats = Array.from({ length: CASE_STAT_COUNT }, (_, i) => ({
    value: get(`caseStat${i + 1}Value`),
    label: get(`caseStat${i + 1}Label`),
  }));
  const details = readCaseStudy(raw);
  const filled =
    CASE_TEXT_FIELDS.some(([key]) => details[key]) || details.stats.some((stat) => stat.value || stat.label);
  return filled ? details : null;
}

/** Facts to list on the case page, in display order, skipping empty ones. */
export function caseFacts(details: CaseStudyDetails): { key: string; value: string }[] {
  return (
    [
      ["client", details.client],
      ["location", details.location],
      ["capacity", details.capacity],
      ["application", details.application],
      ["products", details.products],
      ["completed", details.completed],
    ] as const
  )
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value }));
}
