import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageBanner from "@/components/sections/shared/PageBanner";
import ProductGrid from "@/components/sections/manufacturing/ProductGrid";
import WhyChooseCategory from "@/components/sections/manufacturing/WhyChooseCategory";
import CtaBand from "@/components/sections/shared/CtaBand";
import type { ProductCategory } from "@/lib/data/manufacturing";

export async function categoryMetadata(category: ProductCategory): Promise<Metadata> {
  const t = await getTranslations(`${category.namespace}.meta`);
  return { title: t("title"), description: t("description") };
}

export default async function CategoryPage({ category }: { category: ProductCategory }) {
  const t = await getTranslations(category.namespace);

  return (
    <>
      <PageBanner
        eyebrowLabel={t("banner.eyebrow")}
        heading={t("banner.heading")}
        image={{ src: t("banner.image") }}
      />
      <ProductGrid category={category} />
      <WhyChooseCategory category={category} />
      <CtaBand image={{ src: t("ctaImage") }} />
    </>
  );
}
