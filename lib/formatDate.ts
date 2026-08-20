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
