import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

const navigation = createNavigation(routing);

/** The plain next-intl link. Site code imports `Link` below, which also hides links to missing pages. */
export const BaseLink = navigation.Link;
export const { redirect, permanentRedirect, usePathname, useRouter, getPathname } = navigation;
export { default as Link } from "@/i18n/SafeLink";
