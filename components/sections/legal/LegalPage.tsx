import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { entries, str } from "@/lib/page-content/read";
import { pageTitle } from "@/lib/seo";
import { assertPageVisible } from "@/lib/page-visibility";

export type LegalKey = "privacy" | "cookies" | "terms";

const LEGAL_PATHS: Record<LegalKey, string> = {
  privacy: "/privacy-policy",
  cookies: "/cookie-policy",
  terms: "/terms",
};

export async function legalMetadata(locale: string, key: LegalKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `legal.${key}.meta` });
  return { title: pageTitle(t("title")), description: t("description") };
}

/**
 * Privacy Policy / Cookie Policy / Terms (client revision 1008). One plain
 * long-form layout; every heading and paragraph is edited in Dashboard →
 * Pages → Legal. A blank line or line break in a section starts a new paragraph.
 */
export default async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  await assertPageVisible(LEGAL_PATHS[pageKey]);
  const t = await getTranslations(`legal.${pageKey}`);
  const sections = entries(t.raw("sections" as never))
    .map(([id, section]) => ({ id, heading: str(section, "heading"), body: str(section, "body") }))
    .filter((section) => section.heading || section.body);

  return (
    <>
      <section className="w-full bg-surface-2 pt-160 pb-64 md:pt-180 xl:pt-200 xl:pb-80">
        <Container className="flex max-w-840 flex-col gap-16">
          <SectionEyebrow label={t("eyebrow")} />
          <Heading level={1} size="h2">
            {t("title")}
          </Heading>
          <Text size="p3" className="text-neutral-4">
            {t("updated")}
          </Text>
        </Container>
      </section>

      <section className="w-full bg-white py-64 xl:py-100">
        <Container className="flex max-w-840 flex-col gap-40">
          <Text size="p1" className="text-neutral-3">
            {t("intro")}
          </Text>
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-16">
              {section.heading ? (
                <Heading level={2} size="h5">
                  {section.heading}
                </Heading>
              ) : null}
              {section.body
                .split(/\n+/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <Text key={index} size="p2" className="text-neutral-3">
                    {paragraph}
                  </Text>
                ))}
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
