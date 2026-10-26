import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import AdvantageExplorer from "@/components/sections/about/why-choose-cnx/AdvantageExplorer";
import { cascade } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

/** About Us → "Why choose us": the client's six advantages (revision 1022). */
export default async function CompetitiveAdvantage() {
  const t = await getTranslations("about.whyChooseCnx.competitiveAdvantage");
  const items = entries(t.raw("items" as never)).map(([id, item]) => ({
    id,
    icon: str(item, "icon"),
    title: str(item, "title"),
    body: str(item, "body"),
    cta: str(item, "cta"),
    ctaHref: str(item, "ctaHref"),
    image: str(item, "image"),
    imageAlt: str(item, "imageAlt"),
  }));

  const header = (
    <div className="flex flex-col gap-12">
      <Reveal as="div" delay={cascade(0)}>
        <SectionEyebrow label={t("eyebrow")} />
      </Reveal>
      <Heading level={2} size="h2" className="text-balance">
        {t("heading")}
      </Heading>
    </div>
  );

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="py-64 md:py-80 xl:py-120">
        <AdvantageExplorer header={header} items={items} />
      </Container>
    </section>
  );
}
