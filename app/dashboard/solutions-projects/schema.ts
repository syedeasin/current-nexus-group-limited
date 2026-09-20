import { z } from "zod";
import { SOLUTION_ICON_NAMES } from "@/lib/solutions-projects/icons";

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
const nonEmpty = (label: string, max = 300) => z.string().trim().min(1, `${label} is required`).max(max);
const opt = (max = 4000) => z.preprocess(emptyToUndefined, z.string().max(max).optional());

// --- content sections -------------------------------------------------------

const ctaLink = z.object({
  label: z.string().trim().max(120),
  href: z.string().trim().max(300),
});

const heroSchema = z.object({
  eyebrow: nonEmpty("Hero eyebrow", 120),
  heading: nonEmpty("Hero title", 200),
  description: z.preprocess(emptyToUndefined, z.string().max(600).optional()),
  backgroundImage: nonEmpty("Hero background image", 500),
  backgroundImageAlt: opt(300),
  layout: z.enum(["centered", "bottom"]).default("centered"),
});

const statsSchema = z.object({
  items: z
    .array(z.object({ value: nonEmpty("Stat value", 40), label: nonEmpty("Stat label", 120) }))
    .max(8),
});

const whyChooseSchema = z.object({
  eyebrow: nonEmpty("Eyebrow", 120),
  heading: nonEmpty("Heading", 200),
  description: nonEmpty("Description", 600),
  image: nonEmpty("Image", 500),
  imageAlt: opt(300),
  features: z
    .array(
      z.object({
        icon: nonEmpty("Feature icon", 500),
        title: nonEmpty("Feature title", 160),
        description: nonEmpty("Feature description", 400),
      })
    )
    .max(6),
});

const productModelsSchema = z.object({
  eyebrow: nonEmpty("Eyebrow", 120),
  heading: nonEmpty("Heading", 200),
  datasheetLabel: nonEmpty("Datasheet label", 120),
  products: z
    .array(
      z.object({
        name: nonEmpty("Product name", 200),
        image: nonEmpty("Product image", 500),
        imageAlt: opt(300),
        datasheetHref: z.string().trim().max(300).default("/service/downloads"),
        buttonVariant: z.enum(["primary", "outline"]).default("primary"),
      })
    )
    .max(6),
});

const applicationsSchema = z.object({
  eyebrow: nonEmpty("Eyebrow", 120),
  heading: nonEmpty("Heading", 200),
  previousLabel: z.string().trim().max(80).default("Previous"),
  nextLabel: z.string().trim().max(80).default("Next"),
  cards: z
    .array(
      z.object({
        title: nonEmpty("Card title", 160),
        description: nonEmpty("Card description", 400),
        image: nonEmpty("Card image", 500),
        imageAlt: opt(300),
      })
    )
    .max(12),
});

const caseStudySchema = z.object({
  eyebrow: nonEmpty("Eyebrow", 120),
  heading: nonEmpty("Heading", 200),
  backgroundImage: nonEmpty("Background image", 500),
  backgroundImageAlt: opt(300),
  title: nonEmpty("Title", 200),
  body: nonEmpty("Body", 1200),
  specs: z
    .array(
      z.object({
        icon: z.enum(SOLUTION_ICON_NAMES as [string, ...string[]]),
        text: nonEmpty("Spec text", 160),
      })
    )
    .max(6),
});

const ctaSchema = z.object({
  heading: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  subtext: z.preprocess(emptyToUndefined, z.string().max(400).optional()),
  primary: ctaLink.optional(),
  secondary: ctaLink.nullish(),
  image: z.object({ src: z.string().max(500), alt: z.string().max(200).optional() }).optional(),
});

export const solutionContentSchema = z.object({
  hero: heroSchema,
  stats: statsSchema.optional(),
  whyChoose: whyChooseSchema.optional(),
  productModels: productModelsSchema.optional(),
  applications: applicationsSchema.optional(),
  caseStudy: caseStudySchema.optional(),
  cta: ctaSchema.optional(),
});

const seoSchema = z.object({
  metaTitle: opt(300), metaDescription: opt(600), keywords: opt(400), canonicalUrl: opt(500),
  noIndex: z.boolean().optional(), noFollow: z.boolean().optional(),
  ogTitle: opt(300), ogDescription: opt(600), ogImage: opt(500), ogImageAlt: opt(300),
  twitterTitle: opt(300), twitterDescription: opt(600), twitterImage: opt(500), twitterImageAlt: opt(300),
});

// --- page row ---------------------------------------------------------------

export const solutionPageSchema = z.object({
  title: nonEmpty("Page title", 200),
  slug: z.preprocess(
    emptyToUndefined,
    z.string().max(200).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only").optional()
  ),
  locale: z.enum(["EN", "FR"]).default("EN"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),

  menuGroup: z.enum(["SOLUTIONS", "RENEWABLE_PROJECTS"]).default("SOLUTIONS"),
  menuLabel: nonEmpty("Menu label", 120),
  menuOrder: orderField,
  showInMegaMenu: z.preprocess(toBoolean, z.boolean().default(true)),

  metaTitle: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(500).optional()),

  content: solutionContentSchema,
  seo: seoSchema.default({}),
});

export type SolutionPageFormValues = z.infer<typeof solutionPageSchema>;
