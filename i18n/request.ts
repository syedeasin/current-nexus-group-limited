import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

/**
 * Statically imported so the dev server actually reloads a message file when it
 * changes. A dynamic `import(`../messages/${locale}.json`)` compiles to a glob
 * whose modules Turbopack caches for the life of the process: edits to the JSON
 * rebuild the chunk on disk but the running server keeps serving the old copy,
 * which surfaces as MISSING_MESSAGE for any newly added key until a restart.
 */
const MESSAGES: Record<Locale, typeof en> = { en, fr };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale],
  };
});
