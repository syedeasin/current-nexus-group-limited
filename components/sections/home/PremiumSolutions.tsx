import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BrandTabs from "@/components/sections/home/premium-solutions/BrandTabs";
import { premiumSolutionsBrands } from "@/lib/data/premiumSolutions";

export default async function PremiumSolutions() {
  const t = await getTranslations("home.premiumSolutions");

  const brands = premiumSolutionsBrands.map((brand) => ({
    id: brand.id,
    label: t(`brands.${brand.brandKey}`),
    title: t(`titles.${brand.titleKey}`),
    products: brand.products.map((product) => ({
      key: product.key,
      title: t(`products.${product.key}`),
      image: product.image,
      href: product.href,
    })),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container
        size="section"
        className="flex flex-col items-center pt-48 pb-68 md:pt-64 md:pb-84 xl:pt-80 xl:pb-100"
      >
        <div className="flex w-full max-w-754 flex-col items-center gap-12">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("eyebrow")} tone="dark" />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={2} size="h2" className="text-balance text-center text-white">
              {t("heading")}
            </Heading>
          </Reveal>
        </div>

        <div className="mt-48 w-full">
          <BrandTabs
            brands={brands}
            railAriaLabel={t("railAriaLabel")}
            viewAllLabel={t("viewAll")}
            viewAllHref="/brands"
          />
        </div>
      </Container>
    </section>
  );
}
