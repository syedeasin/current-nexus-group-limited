import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Parallax from "@/components/motion/Parallax";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ProductTabs from "@/components/sections/home/energy-ecosystem/ProductTabs";
import { energyEcosystemTabs } from "@/lib/data/energyEcosystem";
import { cascade, PARALLAX_DISTANCE_PX } from "@/lib/motion/timing";

export default async function EnergyEcosystem() {
  const t = await getTranslations("home.ecosystem");

  const tabs = energyEcosystemTabs.map((tab) => ({
    id: tab.id,
    label: t(`tabs.${tab.tabKey}` as never),
    products: tab.products.map((product) => ({
      key: product.key,
      title: t(`products.${product.key}` as never),
      image: product.image,
      href: product.href,
    })),
  }));

  return (
    <section aria-label={t("heading")} className="relative w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        {/* The backdrop drifts against the page as the section passes, which is
            what separates it from the copy sitting on top. The photo is scaled
            past its frame so the drift can never expose an edge, and the
            section's own overflow-hidden clips the overhang. Desktop pointer
            only — Parallax opts itself out below lg and under reduced motion. */}
        <Parallax distance={PARALLAX_DISTANCE_PX} className="absolute inset-0 scale-[1.08]">
          <Image
            src="/images/energyEcosystem/energyEcosystemSectionBackground.webp"
            alt=""
            fill
            sizes="1600px"
            className="object-cover"
          />
        </Parallax>
        <div className="energy-ecosystem-overlay absolute inset-0" />
      </div>

      <Container className="relative flex flex-col items-center py-48 md:py-64 xl:py-80">
        <div className="flex w-full max-w-790 flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} tone="light" />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance text-center">
              {t("heading")}
            </Heading>
          </TextReveal>
        </div>

        <div className="mt-48 w-full">
          <ProductTabs
            tabs={tabs}
            learnMoreLabel={t("learnMore")}
            ariaLabel={t("tabsAriaLabel")}
          />
        </div>
      </Container>
    </section>
  );
}
