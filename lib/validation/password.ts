import { z } from "zod";

/**
 * Password policy, shared by the server actions that set a password and the
 * client forms that preview it (strength meter, generator).
 *
 * bcrypt only reads the first 72 bytes of its input, so anything longer would
 * silently accept a different password with the same prefix — hence the max.
 */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 72;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX, {
    message: `Use at most ${PASSWORD_MAX} characters.`,
  })
  .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
    message: "Include at least one letter and one number.",
  });

export type PasswordStrength = {
  /** 0 (empty) … 4 (strong) */
  score: 0 | 1 | 2 | 3 | 4;
  label: "" | "Too weak" | "Weak" | "Good" | "Strong";
};

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: "" };
  if (!passwordSchema.safeParse(value).success) return { score: 1, label: "Too weak" };

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(value)).length;
  const points = (value.length >= 14 ? 2 : value.length >= 12 ? 1 : 0) + (classes >= 4 ? 2 : classes === 3 ? 1 : 0);

  if (points >= 3) return { score: 4, label: "Strong" };
  if (points >= 1) return { score: 3, label: "Good" };
  return { score: 2, label: "Weak" };
}

const GENERATOR_SETS = [
  "abcdefghijkmnopqrstuvwxyz",
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "23456789",
  "!@#$%*-_+=?",
];

/**
 * A random password that always satisfies the policy (one of each character
 * class, ambiguous characters like 0/O and 1/l left out so it can be read
 * aloud or retyped). Uses Web Crypto, available in browsers and Node 20+.
 */
export function generatePassword(length = 16): string {
  const all = GENERATOR_SETS.join("");
  const random = new Uint32Array(length + GENERATOR_SETS.length);
  crypto.getRandomValues(random);

  const chars = GENERATOR_SETS.map((set, i) => set[random[i] % set.length]);
  for (let i = chars.length; i < length; i += 1) {
    chars.push(all[random[i] % all.length]);
  }

  // Fisher–Yates so the guaranteed characters aren't always at the front.
  const order = new Uint32Array(chars.length);
  crypto.getRandomValues(order);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = order[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
