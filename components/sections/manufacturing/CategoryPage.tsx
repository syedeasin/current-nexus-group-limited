import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/sections/shared/PageBanner";
import ProductGrid from "@/components/sections/manufacturing/ProductGrid";
import WhyChooseCategory from "@/components/sections/manufacturing/WhyChooseCategory";
import CtaBand from "@/components/sections/shared/CtaBand";
import type { ProductCategory } from "@/lib/data/manufacturing";

export default async function CategoryPage({ category }: { category: ProductCategory }) {
  const t = await getTranslations(category.namespace);

  return (
    <main>
      <PageBanner
        eyebrowLabel={t("banner.eyebrow")}
        heading={t("banner.heading")}
        image={{ src: category.bannerImage }}
      />
      <ProductGrid category={category} />
      <WhyChooseCategory category={category} />
      <CtaBand image={{ src: category.ctaImage }} />
    </main>
  );
}
