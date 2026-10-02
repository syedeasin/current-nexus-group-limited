import { MapPin, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Container from "@/components/layout/Container";
import { Facebook, Instagram, LinkedIn } from "@/components/icons/SocialIcons";
import { siteConfig, socialLinks } from "@/site.config";
import { manufacturingEntryHref, solutionEntryHref } from "@/config/nav.config";
import { entries, str } from "@/lib/page-content/read";
import type { SolutionMenuEntry } from "@/lib/solutions-projects/types";
import type { ManufacturingMenuEntry } from "@/lib/manufacturing/types";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: LinkedIn,
} as const;

const LINK_CLASS =
  "text-p3 font-medium text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

type FooterLink = { label: string; href: string };
type FooterColumn = { id: string; heading: string; links: FooterLink[] };

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

interface FooterProps {
  /** Published Solutions & Projects pages — the same source as the mega menu. */
  solutions: SolutionMenuEntry[];
  /** Published Manufacturing product pages — the same source as the mega menu. */
  manufacturing: ManufacturingMenuEntry[];
}

/**
 * Column order (client revision): Quick links · Manufacturing · Tier 1 brands
 * · Solutions · Services, with contact info and the newsletter on their own
 * row underneath. Quick links / Tier 1 brands / Services and every label are
 * edited in Dashboard → Pages → Footer; the Manufacturing and Solutions
 * columns list the published pages automatically, so they can never drift
 * from the real menu again (they used to repeat the brand list).
 */
export default async function Footer({ solutions, manufacturing }: FooterProps) {
  const [t, nav] = await Promise.all([getTranslations("footer"), getTranslations("nav")]);
  const year = new Date().getFullYear();

  const editable = Object.fromEntries(
    entries(t.raw("columns" as never)).map(([id, column]) => [
      id,
      {
        id,
        heading: str(column, "heading"),
        links: entries(column.links)
          .map(([, link]) => ({ label: str(link, "label"), href: str(link, "href") }))
          .filter((link) => link.label && link.href),
      } satisfies FooterColumn,
    ])
  ) as Record<string, FooterColumn | undefined>;

  const manufacturingColumn: FooterColumn = {
    id: "manufacturing",
    heading: t("manufacturingHeading"),
    links: [
      { label: nav("solarPanels"), href: "/manufacturing/solar-panels" },
      { label: nav("bess"), href: "/manufacturing/bess" },
      ...manufacturing.map((entry) => ({
        label: entry.menuLabel,
        href: manufacturingEntryHref(entry.category, entry.slug),
      })),
    ],
  };

  const solutionsColumn: FooterColumn = {
    id: "solutions",
    heading: t("solutionsHeading"),
    links: solutions.map((entry) => ({
      label: entry.menuLabel,
      href: solutionEntryHref(entry.menuGroup, entry.slug),
    })),
  };

  const columns = [
    editable.quickLinks,
    manufacturingColumn,
    editable.tier1Brands,
    solutionsColumn,
    editable.services,
  ].filter((column): column is FooterColumn => Boolean(column && column.links.length > 0));

  const contact = {
    location: t("contact.location"),
    email: t("contact.email"),
    phone: t("contact.phone"),
  };
  const social = socialLinks
    .map((link) => ({ ...link, href: t(`social.${link.icon}`) }))
    .filter((link) => link.href);

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
        <div className="relative z-10 flex w-full flex-col gap-120 xl:gap-172">
          <div className="flex w-full flex-col gap-48">
            <div className="grid w-full grid-cols-2 gap-x-24 gap-y-40 sm:grid-cols-3 lg:grid-cols-5 lg:gap-32">
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

              <div className="flex w-full flex-col gap-16 lg:max-w-480">
                <label htmlFor="footer-newsletter-email" className="text-p3 font-normal text-neutral-6">
                  {t("newsletterLabel")}
                </label>
                <form className="flex w-full items-center gap-24 rounded-full bg-neutral-2 py-6 pl-32 pr-6">
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-p4 text-white placeholder:text-neutral-7 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-secondary px-24 py-12 text-btn-sm font-semibold text-neutral-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    {t("subscribe")}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-16 md:flex-row md:items-center md:justify-between">
            <span className="text-p4 text-neutral-7">
              {t("copyright", { year, name: siteConfig.name })} {t("rights")}
            </span>
            {social.length > 0 && (
              <div className="flex items-center gap-16">
                {social.map((link, index) => {
                  const Icon = socialIcons[link.icon];
                  const external = isExternal(link.href);
                  return (
                    <div key={link.label} className="flex items-center gap-16">
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
