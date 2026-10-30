import { Globe, MapPin, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "@/components/ui/Picture";
import { Link } from "@/i18n/navigation";
import Container from "@/components/layout/Container";
import NewsletterForm from "@/components/layout/NewsletterForm";
import CookieSettingsButton from "@/components/layout/CookieSettingsButton";
import { Facebook, Instagram, LinkedIn, XTwitter, YouTube } from "@/components/icons/SocialIcons";
import { siteConfig } from "@/site.config";
import { brandEntryHref, solutionsMenuLinks, type BrandMenuEntry } from "@/config/nav.config";
import { isHiddenPath } from "@/config/page-visibility";
import { bool, entries, str } from "@/lib/page-content/read";
import type { SolutionMenuEntry } from "@/lib/solutions-projects/types";
import type { ManufacturingMenuEntry } from "@/lib/manufacturing/types";

const socialIcons: Record<string, ({ size }: { size?: number }) => React.ReactElement> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: LinkedIn,
  youtube: YouTube,
  x: XTwitter,
  twitter: XTwitter,
};

const LINK_CLASS =
  "text-p3 font-medium text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-disabled:text-neutral-6 aria-disabled:hover:text-neutral-6";

const LEGAL_LINK_CLASS =
  "text-p4 text-neutral-7 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

type FooterLink = { label: string; href: string };
type FooterColumn = { id: string; heading: string; links: FooterLink[] };

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

interface FooterProps {
  /** Published Solutions & Projects pages — the same source as the mega menu. */
  solutions: SolutionMenuEntry[];
  /** Unused since revision 1022 (the column is a fixed editable list); kept so callers need no change. */
  manufacturing: ManufacturingMenuEntry[];
  /** Published Tier 1 brand pages shown in the menu — the same source as the mega menu. */
  brands: BrandMenuEntry[];
  /** Paths switched off in Dashboard → Settings → Page visibility. */
  hidden: ReadonlySet<string>;
}

/**
 * Column order (client revision): Quick links · Manufacturing · Tier 1 brands
 * · Solutions · Services, with contact info and the newsletter on their own
 * row underneath. Quick links / Tier 1 brands / Services and every label are
 * edited in Dashboard → Pages → Footer; the Manufacturing and Solutions
 * columns list the published pages automatically, so they can never drift
 * from the real menu again (they used to repeat the brand list).
 */
export default async function Footer({ solutions, brands, hidden }: FooterProps) {
  const [t, nav] = await Promise.all([getTranslations("footer"), getTranslations("nav")]);
  const year = new Date().getFullYear();

  // Columns are an editable list (Dashboard → Pages → Footer → Link columns),
  // mirroring the main menu sections. The columns with ids "tier1Brands" and
  // "solutions" also list the published pages, so they never drift from the
  // mega menu.
  // Manufacturing lists only its editable links (client revision 1022: Solar
  // Panels, BESS, Revamping); Solutions lists the full planned page set, the
  // unpublished ones as plain text until they go live.
  const autoLinks: Record<string, FooterLink[]> = {
    tier1Brands: brands.map((brand) => ({ label: brand.name, href: brandEntryHref(brand.slug) })),
    solutions: solutionsMenuLinks(solutions, hidden).map((link) => ({
      label: link.label ?? (link.labelKey ? nav(link.labelKey) : ""),
      href: link.href,
    })),
  };

  const columns = entries(t.raw("menu" as never))
    .map(([id, column]) => {
      const links = entries(column.links)
        .map(([, link]) => ({ label: str(link, "label"), href: str(link, "href") }))
        .filter((link) => link.label && link.href && !isHiddenPath(link.href, hidden));
      const extra = (autoLinks[id] ?? []).filter((auto) => !links.some((link) => link.href === auto.href));
      return { id, heading: str(column, "heading"), links: [...links, ...extra] } satisfies FooterColumn;
    })
    .filter((column) => column.links.length > 0);

  const contact = {
    location: t("contact.location"),
    email: t("contact.email"),
    phone: t("contact.phone"),
  };
  const social = entries(t.raw("socialLinks" as never))
    .filter(([, item]) => bool(item, "show") && str(item, "href"))
    .map(([id, item]) => ({
      id,
      label: str(item, "label"),
      href: str(item, "href"),
      platform: str(item, "platform").toLowerCase(),
    }));

  return (
    <footer
      className="relative w-full overflow-hidden bg-neutral-1 py-60"
      style={{ "--footer-wordmark-offset": "-40px" } as React.CSSProperties}
    >
      <Image
        src="/footer-wordmark.svg"
        alt=""
        aria-hidden="true"
        width={1600}
        height={176}
        className="pointer-events-none absolute inset-x-0 z-0 h-auto w-full select-none bottom-[var(--footer-wordmark-offset)]"
      />
      <Container>
        <div className="relative z-10 flex w-full flex-col gap-64 sm:gap-120 xl:gap-172">
          <div className="flex w-full flex-col gap-48">
            {/* Phones: one column, each menu column stacked under the last with
                the same gap (a two-column grid left big holes beside Tier 1
                Brands, revision 1022). */}
            <div
              className="footer-columns grid w-full grid-cols-1 gap-y-40 sm:grid-cols-3 sm:gap-x-24 lg:gap-32"
              style={{ "--footer-cols": columns.length } as React.CSSProperties}
            >
              {columns.map((column) => (
                <div key={column.id} className="flex min-w-0 flex-col gap-16">
                  <span className="text-p3 font-normal text-neutral-6">{column.heading}</span>
                  <ul className="flex flex-col gap-12">
                    {column.links.map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <Link href={link.href} className={LINK_CLASS}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-40 border-t border-white/10 pt-40 lg:flex-row lg:items-end lg:justify-between lg:gap-64">
              <div className="flex flex-col gap-24">
                <span className="text-p3 font-normal text-neutral-6">{t("contactInfo")}</span>
                <ul className="flex flex-col gap-12 md:flex-row md:flex-wrap md:items-center md:gap-x-40">
                  {contact.location && (
                    <li className="flex items-center gap-8">
                      <MapPin size={20} className="shrink-0 text-white" aria-hidden="true" />
                      <span className="text-p3 font-medium text-white">{contact.location}</span>
                    </li>
                  )}
                  {contact.email && (
                    <li className="flex items-center gap-8">
                      <Mail size={20} className="shrink-0 text-white" aria-hidden="true" />
                      <a href={`mailto:${contact.email}`} className={LINK_CLASS}>
                        {contact.email}
                      </a>
                    </li>
                  )}
                  {contact.phone && (
                    <li className="flex items-center gap-8">
                      <Phone size={20} className="shrink-0 text-white" aria-hidden="true" />
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={LINK_CLASS}>
                        {contact.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <NewsletterForm
                labels={{
                  label: t("newsletterLabel"),
                  placeholder: t("emailPlaceholder"),
                  subscribe: t("subscribe"),
                  success: t("newsletterSuccess"),
                  invalid: t("newsletterInvalid"),
                  failed: t("newsletterFailed"),
                }}
              />
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-16 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-8 md:flex-row md:flex-wrap md:items-center md:gap-x-24">
              <span className="text-p4 text-neutral-7">
                {t("copyright", { year, name: siteConfig.name })} {t("rights")}
              </span>
              <nav aria-label={t("legalNavLabel")} className="flex flex-wrap items-center gap-x-16 gap-y-8">
                {[
                  { href: "/privacy-policy", label: t("privacyLabel") },
                  { href: "/cookie-policy", label: t("cookiesLabel") },
                  { href: "/terms", label: t("termsLabel") },
                ]
                  .filter((link) => !isHiddenPath(link.href, hidden))
                  .map((link) => (
                    <Link key={link.href} href={link.href} className={LEGAL_LINK_CLASS}>
                      {link.label}
                    </Link>
                  ))}
                <CookieSettingsButton label={t("cookieSettingsLabel")} className={LEGAL_LINK_CLASS} />
              </nav>
            </div>
            {social.length > 0 && (
              <div className="flex items-center gap-16">
                {social.map((link, index) => {
                  const Icon = socialIcons[link.platform] ?? Globe;
                  const external = isExternal(link.href);
                  return (
                    <div key={link.id} className="flex items-center gap-16">
                      <a
                        href={link.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="flex items-center gap-6 text-p4 text-neutral-7 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                      >
                        <Icon size={18} />
                        {link.label}
                      </a>
                      {index < social.length - 1 && (
                        <span aria-hidden="true" className="h-[10.5px] w-px bg-neutral-5" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
