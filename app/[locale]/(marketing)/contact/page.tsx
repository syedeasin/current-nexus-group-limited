import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Building2, Clock3, Factory, Mail, MapPin, Phone } from "lucide-react";
import PageBanner from "@/components/sections/shared/PageBanner";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ContactForm from "@/components/sections/contact/ContactForm";
import { pageTitle } from "@/lib/seo";
import { assertPageVisible } from "@/lib/page-visibility";
import { entries, str } from "@/lib/page-content/read";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });
  return { title: pageTitle(t("title")), description: t("description") };
}

export default async function ContactPage() {
  await assertPageVisible("/contact");
  const [t, footer] = await Promise.all([getTranslations("contact"), getTranslations("footer")]);

  // Office, email and phone are the site-wide contact details edited in
  // Pages → Footer → Contact info, so the footer and this page never disagree.
  const location = footer("contact.location");
  const email = footer("contact.email");
  const phone = footer("contact.phone");

  // Factory + office addresses (revision 1022), edited in Pages → Contact →
  // Addresses. Without any, the single footer location is shown instead.
  const offices = entries(t.raw("offices" as never))
    .map(([id, office]) => ({
      id,
      label: str(office, "label"),
      name: str(office, "name"),
      address: str(office, "address"),
    }))
    .filter((office) => office.name || office.address);

  type Detail = { icon: typeof MapPin; label: string; value: string; note?: string; href?: string };
  const details = [
    ...(offices.length > 0
      ? offices.map((office, index): Detail => ({
          icon: index === 0 && /factory/i.test(office.label) ? Factory : offices.length > 1 ? Building2 : MapPin,
          label: office.label,
          value: office.name || office.address,
          note: office.name ? office.address : undefined,
        }))
      : [location && { icon: MapPin, label: t("details.locationLabel"), value: location }]),
    email && { icon: Mail, label: t("details.emailLabel"), value: email, href: `mailto:${email}` },
    phone && { icon: Phone, label: t("details.phoneLabel"), value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` },
  ].filter((d): d is Detail => Boolean(d));

  return (
    <>
      <PageBanner
        eyebrowLabel={t("banner.eyebrow")}
        heading={t("banner.heading")}
        description={t("banner.description") || undefined}
        image={{ src: t("banner.image") }}
      />

      <section aria-labelledby="contact-intro-heading" className="w-full bg-white py-64 md:py-80 xl:py-120">
        <Container>
          <div className="grid gap-48 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-64 xl:gap-96">
            <div className="flex flex-col gap-32">
              <div className="flex flex-col gap-16">
                <Reveal as="div" delay={0}>
                  <SectionEyebrow label={t("intro.eyebrow")} />
                </Reveal>
                <Heading level={2} size="h2" className="text-neutral-1">
                  <span id="contact-intro-heading">{t("intro.heading")}</span>
                </Heading>
                <Text size="p3" className="text-neutral-5">
                  {t("intro.description")}
                </Text>
              </div>

              {details.length > 0 && (
                <ul className="flex flex-col divide-y divide-neutral-10 rounded-24 border border-neutral-10">
                  {details.map((detail) => (
                    <li key={detail.label} className={`flex gap-16 p-20 md:p-24 ${detail.note ? "items-start" : "items-center"}`}>
                      <span className="flex size-48 shrink-0 items-center justify-center rounded-full bg-surface-1 text-primary">
                        <detail.icon size={20} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-p4 text-neutral-5">{detail.label}</span>
                        {detail.href ? (
                          <a
                            href={detail.href}
                            className="break-words text-p3 font-medium text-neutral-1 transition-colors duration-150 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          <span className="text-p3 font-medium text-neutral-1">{detail.value}</span>
                        )}
                        {detail.note && <span className="mt-4 text-p4 text-neutral-4">{detail.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="flex items-center gap-10 text-p4 text-neutral-5">
                <Clock3 size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-tertiary" />
                {t("details.responseNote")}
              </p>
            </div>

            <div className="relative">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
