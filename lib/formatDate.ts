const formatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Fixed-locale, fixed-timezone date formatting (always en-US / UTC),
 * independent of the site locale and the machine's local timezone.
 * `toLocaleDateString()` with no locale argument follows the runtime's
 * default locale, and any timezone-dependent parsing shifts the calendar
 * day near midnight — both differ between the Node server and the browser
 * and cause a hydration mismatch. Pinning both keeps this identical on both.
 */
export function formatDate(isoDate: string): string {
  return formatter.format(new Date(isoDate));
}

const monthDay = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const dayOnly = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });
const yearOnly = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" });

/**
 * "June 9 – 11, 2027", "June 30 – July 2, 2027" or "December 30, 2026 –
 * January 2, 2027". A missing or same-day end date gives a single date.
 */
export function formatDateRange(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  if (!end || end.getTime() <= start.getTime() || formatDate(startIso) === formatDate(endIso!)) {
    return formatDate(startIso);
  }
  const sameYear = yearOnly.format(start) === yearOnly.format(end);
  if (!sameYear) return `${formatDate(startIso)} – ${formatDate(endIso!)}`;
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return `${monthDay.format(start)} – ${sameMonth ? dayOnly.format(end) : monthDay.format(end)}, ${yearOnly.format(end)}`;
}

/**
 * The date a post card or page shows: an event's own dates (client revision
 * 1008 — not the day the article was published), otherwise the publish date.
 */
export function postDateLabel(post: { section: string; publishedAt: string; eventStartDate: string | null; eventEndDate: string | null }): string {
  if (post.section === "EVENTS" && post.eventStartDate) return formatDateRange(post.eventStartDate, post.eventEndDate);
  return formatDate(post.publishedAt);
}
