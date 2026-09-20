import { z } from "zod";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyToUndefined(val: unknown) {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
}
function toBoolean(val: unknown) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val === "on" || val === "true";
  return false;
}
function toOrder(val: unknown) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number.parseInt(val.trim(), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
const orderField = z.preprocess(toOrder, z.number().int().min(0).max(9999).default(0));
const req = (label: string, max = 4000) => z.string().trim().min(1, `${label} is required`).max(max);
const opt = (max = 4000) => z.preprocess(emptyToUndefined, z.string().max(max).optional());
const str = (max = 4000) => z.string().max(max);

// --- content sections (mirrors lib/data/products/types.ts, permissive on deep optional bits) ---

const cta = z.object({ label: str(120), href: str(400) });
const stat = z.object({ value: str(60), label: str(160) });

const heroSchema = z.object({
  eyebrow: req("Hero eyebrow", 160),
  heading: req("Hero title", 300),
  body: str(1200).default(""),
  primaryCta: cta.default({ label: "", href: "" }),
  secondaryCta: cta.default({ label: "", href: "" }),
  stats: z.array(stat).max(8).default([]),
  backgroundImage: req("Hero background", 500),
  backgroundImageMobile: str(500).default(""),
  productImage: str(500).default(""),
  productImageAlt: opt(300),
});

const featureItem = z.object({ icon: str(120), title: str(200), body: str(600) });
const specRow = z.object({ label: str(200), value: str(400) });

const introduction = z.object({
  eyebrow: str(160), heading: str(300), paragraphs: z.array(str(2000)).default([]), image: str(500), imageAlt: opt(300),
}).optional();

const competitiveAdvantage = z.object({
  eyebrow: str(160), heading: str(300), items: z.array(featureItem).default([]),
}).optional();

const engineeringTab = z.object({
  id: str(80), label: str(120), rows: z.array(specRow).default([]),
  pending: z.boolean().optional(), image: str(500).optional(),
});
const engineeringDetails = z.object({
  eyebrow: str(160), heading: str(300), image: str(500), tabs: z.array(engineeringTab).default([]),
}).optional();

const manufacturingReliability = z.object({
  eyebrow: str(160), heading: str(300), intro: str(1200), items: z.array(str(400)).default([]), image: str(500), imageAlt: opt(300),
}).optional();

const workflowStep = z.object({ label: str(80), title: str(200), body: str(600) });
const manufacturingWorkflow = z.object({
  eyebrow: str(160), heading: str(300), intro: str(1200), steps: z.array(workflowStep).default([]),
}).optional();

const awardCard = z.object({ image: str(500), alt: str(200), caption: str(200) });
const awards = z.object({
  eyebrow: str(160), heading: str(300), backgroundImage: str(500), cards: z.array(awardCard).default([]),
}).optional();

const specTableRow = z.object({ label: str(200), value: str(400), internalNote: str(400).optional() });
const electricalRow = z.object({
  model: str(120), pmax: str(60), vmp: str(60), imp: str(60), voc: str(60), isc: str(60),
  maxVoltage: str(120), fuse: str(60),
});
const technicalSpecifications = z.object({
  eyebrow: str(160), heading: str(300), tableA: z.array(specTableRow).default([]), tableB: z.array(electricalRow).default([]),
}).optional();

const chartValue = z.object({ label: str(120), value: z.number() });
const comparisonChart = z.object({ title: str(200), lowerIsBetter: z.boolean().optional(), values: z.array(chartValue).default([]) });
const comparisonRow = z.object({
  technology: str(120), positioning: str(400), strength: str(400), tradeOff: str(400), bestFit: str(400), highlight: z.boolean().optional(),
});
const whyChooseComparison = z.object({
  eyebrow: str(160), heading: str(300), charts: z.array(comparisonChart).default([]), table: z.array(comparisonRow).default([]),
}).optional();

const energyGainBar = z.object({ value: z.number(), displayValue: str(60), caption: str(200) });
const energyGain = z.object({
  eyebrow: str(160), heading: str(300), yAxisLabels: z.array(z.number()).default([]), bars: z.array(energyGainBar).default([]),
}).optional();

const productVariantSpec = z.object({ label: str(200), value: str(400) });
const productVariant = z.object({
  eyebrowPair: z.tuple([str(120), str(120)]).default(["", ""]),
  name: str(200), body: str(1200), specs: z.array(productVariantSpec).default([]), image: str(500), imageAlt: opt(300),
  buttonLabel: str(120), buttonHref: str(400),
});
const productVariants = z.object({
  eyebrow: str(160), heading: str(300), variants: z.array(productVariant).default([]),
}).optional();

const odmFeature = z.object({ icon: str(120), title: str(200), body: str(600) });
const odm = z.object({
  eyebrow: str(160), heading: str(300), intro: str(1200), features: z.array(odmFeature).default([]),
  image: str(500), serviceFlowHeading: str(200), serviceFlowSteps: z.array(str(200)).default([]),
  ctaLabel: str(120), ctaHref: str(400),
}).optional();

const caseSpec = z.object({ icon: str(120), text: str(200) });
const caseStudy = z.object({
  eyebrow: str(160), heading: str(300), backgroundImage: str(500), backgroundImageAlt: opt(300), title: str(300), body: str(1600), specs: z.array(caseSpec).default([]),
}).optional();

const relatedProduct = z.object({ title: str(200), body: str(600), image: str(500), imageAlt: opt(300), href: str(400), featured: z.boolean().optional() });
const relatedProducts = z.object({
  eyebrow: str(160), heading: str(300), items: z.array(relatedProduct).default([]),
}).optional();

const faqItem = z.object({ id: str(80), question: str(400), answer: str(2000) });
const faqContact = z.object({
  avatarSrc: str(500), name: str(160), role: str(160), message: str(600), ctaLabel: str(120), ctaHref: str(400),
});
const faq = z.object({
  eyebrow: str(160), heading: str(300), items: z.array(faqItem).default([]), defaultOpenId: str(80).default(""),
  needHelpLabel: str(200).default(""), contact: faqContact.default({ avatarSrc: "", name: "", role: "", message: "", ctaLabel: "", ctaHref: "" }),
}).optional();

const quotationForm = z.object({
  eyebrow: str(160), heading: str(300), productInterestOptions: z.array(str(160)).default([]), productInterestPlaceholder: str(160).default(""),
}).optional();

const documentsCta = z.object({
  heading: str(300), buttonLabel: str(120), buttonHref: str(400), backgroundImage: str(500), backgroundImageAlt: opt(300),
}).optional();

export const manufacturingContentSchema = z.object({
  slug: str(200).default(""),
  category: str(80).default(""),
  meta: z.object({ title: str(300).default(""), description: str(600).default("") }).default({ title: "", description: "" }),
  hero: heroSchema,
  introduction,
  competitiveAdvantage,
  engineeringDetails,
  manufacturingReliability,
  manufacturingWorkflow,
  awards,
  technicalSpecifications,
  whyChooseComparison,
  energyGain,
  productVariants,
  odm,
  caseStudy,
  relatedProducts,
  faq,
  quotationForm,
  documentsCta,
});

const seoSchema = z.object({
  metaTitle: opt(300), metaDescription: opt(600), keywords: opt(400), canonicalUrl: opt(500),
  noIndex: z.boolean().optional(), noFollow: z.boolean().optional(),
  ogTitle: opt(300), ogDescription: opt(600), ogImage: opt(500), ogImageAlt: opt(300),
  twitterTitle: opt(300), twitterDescription: opt(600), twitterImage: opt(500), twitterImageAlt: opt(300),
});

export const manufacturingPageSchema = z.object({
  title: req("Page title", 300),
  slug: z.preprocess(emptyToUndefined, z.string().max(200).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only").optional()),
  locale: z.enum(["EN", "FR"]).default("EN"),
  category: z.enum(["SOLAR_PANELS", "BESS"]).default("SOLAR_PANELS"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  menuLabel: req("Menu label", 160),
  menuOrder: orderField,
  showInMegaMenu: z.preprocess(toBoolean, z.boolean().default(true)),
  content: manufacturingContentSchema,
  seo: seoSchema.default({}),
});

export type ManufacturingPageFormValues = z.infer<typeof manufacturingPageSchema>;
