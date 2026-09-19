import { switzer } from "@/app/fonts";
import "@/app/globals.css";

/**
 * Next.js App Router only reaches a nested `not-found.tsx` (here
 * app/[locale]/not-found.tsx) when the unmatched path still resolves inside
 * that segment's matched layout tree. A path that doesn't match ANY route at
 * all — which is exactly what every "page not built yet" link in the site
 * produces (e.g. /en/manufacturing/solar-panels/hjt) — falls through past
 * [locale] entirely and hits Next's bare built-in 404 instead, unless a root
 * not-found.tsx exists to catch it. This is that root catch-all.
 *
 * No app/layout.tsx exists at the root (app/(auth), app/dashboard and
 * app/[locale] each define their own <html>/<body>, matching the project's
 * existing "parallel root layouts" pattern), so this needs its own shell too.
 * Content mirrors app/[locale]/not-found.tsx exactly — same design, just
 * reachable from a path with no locale segment at all.
 */
export default function GlobalNotFound() {
  // No [locale] param reaches this file — it's the fallback for paths Next
  // couldn't attribute to any route at all, sometimes without even a locale
  // prefix. Defaulting to routing.defaultLocale ("en") is the correct call
  // here, not a placeholder. html/body className strings are copied verbatim
  // from app/[locale]/layout.tsx (same classes, same order) so a client-side
  // navigation into this boundary doesn't trip React's hydration diff on
  // attribute value equality — same visual result, but exact string match
  // avoids a spurious dev-only console warning.
  return (
    <html lang="en" className={`${switzer.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-16 py-172">
          <h1 className="text-h3 text-neutral-1">Page not found</h1>
          <p className="text-p3 text-neutral-6">The page you are looking for does not exist.</p>
        </div>
      </body>
    </html>
  );
}
