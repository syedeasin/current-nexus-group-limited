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

/** Form numbers arrive as strings; anything unparseable falls back to 0. */
function toOrder(val: unknown) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number.parseInt(val.trim(), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const orderField = z.preprocess(toOrder, z.number().int().min(0).max(9999).default(0));

export const downloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(180),

  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .max(180)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only")
      .optional()
  ),

  locale: z.enum(["EN", "FR"]).default("EN"),

  description: z.preprocess(emptyToUndefined, z.string().max(600).optional()),

  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),

  displayOrder: orderField,

  tags: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(
        (val) => {
          const parts = val.split(",").map((t) => t.trim()).filter(Boolean);
          if (parts.length > 20) return false;
          return parts.every((t) => t.length <= 40);
        },
        { message: "Enter up to 20 tags, each 40 characters or fewer, separated by commas." }
      )
      .optional()
  ),
});

export type DownloadFormValues = z.infer<typeof downloadSchema>;

export const filterGroupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .max(80)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only")
      .optional()
  ),
  locale: z.enum(["EN", "FR"]).default("EN"),
  sortOrder: orderField,
  isActive: z.preprocess(toBoolean, z.boolean().default(true)),
});

export const filterOptionSchema = z.object({
  groupId: z.string().trim().min(1, "A group is required"),
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .max(80)
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens only")
      .optional()
  ),
  sortOrder: orderField,
  isActive: z.preprocess(toBoolean, z.boolean().default(true)),
});

/** A group slug must never shadow a query key the public page owns. */
export const RESERVED_GROUP_SLUGS = new Set(["q", "sort", "page"]);
