import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import BrandTabs from "@/components/sections/home/premium-solutions/BrandTabs";
import { cascade } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

export default async function PremiumSolutions() {
  const t = await getTranslations("home.premiumSolutions");

  // Brands and each brand's products are editable lists
  // (Dashboard → Pages → Homepage → Tier 1 brand products).
  const brands = entries(t.raw("brands" as never)).map(([brandId, brand]) => ({
    id: brandId,
    label: str(brand, "label"),
    title: str(brand, "title"),
    products: entries(brand.products).map(([productId, product]) => ({
      key: productId,
      title: str(product, "title"),
      image: str(product, "image"),
      href: str(product, "href") || "#",
    })),
  }));

  return (
    <section aria-label={t("heading")} className="w-full bg-neutral-1">
      <Container className="flex flex-col items-center pt-48 pb-68 md:pt-64 md:pb-84 xl:pt-80 xl:pb-100">
        <div className="flex w-full max-w-754 flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} tone="dark" />
          </Reveal>
          <TextReveal delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-balance text-center text-white">
              {t("heading")}
            </Heading>
          </TextReveal>
        </div>

        <div className="mt-48 w-full">
          <BrandTabs
            brands={brands}
            railAriaLabel={t("railAriaLabel")}
            viewAllLabel={t("viewAll")}
            viewAllHref={t("viewAllHref")}
          />
        </div>
      </Container>
    </section>
  );
}
