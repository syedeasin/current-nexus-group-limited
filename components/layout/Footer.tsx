import { MapPin, Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/layout/Container";
import { Facebook, Instagram, LinkedIn } from "@/components/icons/SocialIcons";
import { siteConfig, footerNav, socialLinks } from "@/site.config";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: LinkedIn,
} as const;

export default async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative w-full overflow-hidden bg-neutral-1 py-60"
      style={{ "--footer-wordmark-offset": "-40px" } as React.CSSProperties}
    >
      <img
        src="/footer-wordmark.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-0 h-auto w-full select-none bottom-[var(--footer-wordmark-offset)]"
      />
      <Container>
        <div className="relative z-10 flex w-full flex-col gap-172">
          <div className="flex w-full flex-col gap-32 md:flex-row md:items-start">
            {footerNav.map((column, index) => (
              <div
                key={column.heading}
                className={
                  index === 0
                    ? "flex w-204 flex-col gap-16"
                    : "flex flex-1 flex-col gap-16"
                }
              >
                <span className="text-p3 font-normal text-neutral-6">
                  {column.heading}
                </span>
                <ul className="flex flex-col gap-12">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-p3 font-medium text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex w-375 flex-col gap-40">
              <div className="flex flex-col gap-24">
                <span className="text-p3 font-normal text-neutral-6">
                  {t("contactInfo")}
                </span>
                <ul className="flex flex-col gap-12">
                  <li className="flex items-center gap-8">
                    <MapPin size={20} className="text-white" />
                    <span className="text-p3 font-medium text-white">
                      {siteConfig.contact.location}
                    </span>
                  </li>
                  <li className="flex items-center gap-8">
                    <Mail size={20} className="text-white" />
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-p3 font-medium text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-8">
                    <Phone size={20} className="text-white" />
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="text-p3 font-medium text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-16">
                <span className="text-p3 font-normal text-neutral-6">
                  {t("newsletterLabel")}
                </span>
                <form className="flex w-full items-center gap-24 rounded-full bg-neutral-2 py-6 pl-32 pr-6">
                  <input
                    type="email"
                    required
                    aria-label={t("emailLabel")}
                    placeholder={t("emailPlaceholder")}
                    className="flex-1 bg-transparent text-p4 text-white placeholder:text-neutral-7 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-secondary px-24 py-12 text-btn-sm font-semibold text-neutral-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
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
            <div className="flex items-center gap-16">
              {socialLinks.map((social, index) => {
                const Icon = socialIcons[social.icon];
                return (
                  <div key={social.label} className="flex items-center gap-16">
                    <a
                      href={social.href}
                      className="flex items-center gap-6 text-p4 text-neutral-7 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    >
                      <Icon size={18} />
                      {social.label}
                    </a>
                    {index < socialLinks.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="h-[10.5px] w-px bg-neutral-5"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
