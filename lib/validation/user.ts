import { z } from "zod";

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$/;

/** "" → null, otherwise lower-cased; usernames are matched case-insensitively. */
const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || USERNAME_PATTERN.test(value), {
    message: "3–32 characters: letters, numbers, dot, dash or underscore (not at the start or end).",
  });

const profileFields = {
  name: z.string().trim().min(2, "Enter the person's name.").max(80, "Keep the name under 80 characters."),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
  username: usernameField,
};

export const userAdminSchema = z.object({
  ...profileFields,
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"], { message: "Choose a role." }),
  isActive: z.boolean(),
});

export const profileSchema = z.object({
  ...profileFields,
  bio: z
    .string()
    .trim()
    .max(500, "Keep the bio under 500 characters.")
    .transform((value) => (value === "" ? null : value)),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^\/(media|uploads)\//.test(value), { message: "Upload the photo again." })
    .transform((value) => (value === "" ? null : value)),
});

export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
