import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getMergedMessages } from "@/lib/page-content/messages";

/**
 * Messages = the shipped copy (messages/<locale>.json + site.config values)
 * with every Dashboard → Pages edit for the locale merged on top — see
 * lib/page-content/messages.ts. Components keep calling plain `t(...)`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await getMergedMessages(locale),
  };
});
