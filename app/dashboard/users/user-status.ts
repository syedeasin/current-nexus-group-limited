export type UserStatus = "active" | "inactive" | "invited";

/** "Invited" = the account has never had a password of its own and never signed in. */
export function userStatus(user: { isActive: boolean; lastLoginAt: Date | null; passwordChangedAt: Date | null }): UserStatus {
  if (!user.isActive) return "inactive";
  if (!user.lastLoginAt && !user.passwordChangedAt) return "invited";
  return "active";
}

export const USER_STATUS_STYLES: Record<UserStatus, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-success" },
  inactive: { label: "Deactivated", dot: "bg-neutral-8" },
  invited: { label: "Invited", dot: "bg-secondary" },
};

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function formatRelative(date: Date, now = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return RTF.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
}
