import { z } from "zod";
import { RESERVED_NEWS_SLUGS } from "@/lib/news-sections";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_OR_PATH_PATTERN = /^https?:\/\//;

function emptyToUndefined(val: unknown) {
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
}

function emptyToNull(val: unknown) {
  if (val == null) return null;
  if (typeof val === "string" && val.trim() === "") return null;
  return val;
}

function toBoolean(val: unknown) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val === "on" || val === "true";
  return false;
}

function urlOrPathField(max: number) {
  return z.preprocess(
    emptyToUndefined,
    z
      .string()
      .max(max)
      .refine((val) => URL_OR_PATH_PATTERN.test(val) || val.startsWith("/"), {
        message: "Enter a full URL or a root-relative path.",
      })
      .optional()
  );
}

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(180),

  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only")
      .refine((val) => !RESERVED_NEWS_SLUGS.includes(val), {
        message: "This slug is reserved for a News Room page. Choose another.",
      })
      .optional()
  ),

  locale: z.enum(["EN", "FR"]).default("EN"),

  excerpt: z.preprocess(emptyToUndefined, z.string().max(300).optional()),

  content: z.preprocess((val) => (val == null ? "" : val), z.string().default("")),

  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"]),

  categoryId: z.preprocess(emptyToNull, z.string().nullable().optional().default(null)),

  section: z.enum(["NEWS", "RE_ANALYSIS", "KNOWLEDGE_DATABASE", "EVENTS"]).default("NEWS"),
  isHighlight: z.preprocess(toBoolean, z.boolean().default(false)),

  tags: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(
        (val) => {
          const parts = val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          if (parts.length > 10) return false;
          return parts.every((t) => t.length >= 1 && t.length <= 40);
        },
        { message: "Enter up to 10 tags, each 1-40 characters, separated by commas." }
      )
      .optional()
  ),

  featuredImage: urlOrPathField(500),
  featuredImageAlt: z.preprocess(emptyToUndefined, z.string().max(180).optional()),

  metaTitle: z.preprocess(emptyToUndefined, z.string().max(60).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(160).optional()),
  focusKeyword: z.preprocess(emptyToUndefined, z.string().max(80).optional()),

  canonicalUrl: z.preprocess(emptyToUndefined, z.url().max(500).optional()),
  ogImage: urlOrPathField(500),

  noIndex: z.preprocess(toBoolean, z.boolean().default(false)),
}).superRefine((data, ctx) => {
  if (data.featuredImage && !data.featuredImageAlt) {
    ctx.addIssue({
      code: "custom",
      path: ["featuredImageAlt"],
      message: "Alt text is required when a featured image is set.",
    });
  }
});

export type PostFormValues = z.infer<typeof postSchema>;
