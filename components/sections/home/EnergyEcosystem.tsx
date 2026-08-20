import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ProductTabs from "@/components/sections/home/energy-ecosystem/ProductTabs";
import { energyEcosystemTabs } from "@/lib/data/energyEcosystem";

export default async function EnergyEcosystem() {
  const t = await getTranslations("home.ecosystem");

  const tabs = energyEcosystemTabs.map((tab) => ({
    id: tab.id,
    label: t(`tabs.${tab.tabKey}`),
    products: tab.products.map((product) => ({
      key: product.key,
      title: t(`products.${product.key}`),
      image: product.image,
      href: product.href,
    })),
  }));

  return (
    <section aria-label={t("heading")} className="relative w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/energyEcosystem/energyEcosystemSectionBackground.webp"
          alt=""
          fill
          sizes="1600px"
          className="object-cover"
        />
        <div className="energy-ecosystem-overlay absolute inset-0" />
      </div>

      <Container
        size="section"
        className="relative flex flex-col items-center py-48 md:py-64 xl:py-80"
      >
        <div className="flex w-full max-w-790 flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} tone="light" />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-balance text-center">
              {t("heading")}
            </Heading>
          </Reveal>
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
