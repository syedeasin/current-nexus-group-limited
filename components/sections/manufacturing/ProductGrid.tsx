import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ManufacturingProductCard from "@/components/sections/manufacturing/ProductCard";
import type { ProductCategory } from "@/lib/data/manufacturing";

const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default async function ProductGrid({ category }: { category: ProductCategory }) {
  const t = await getTranslations(category.namespace);

  return (
    <section className="w-full bg-white pt-80 pb-100">
      <Container>
        <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
          {category.products.map((product, index) => {
            const delay = Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal key={product.slug} as="div" delay={delay}>
                <ManufacturingProductCard
                  href={`/manufacturing/${category.slug}/${product.slug}`}
                  image={product.image}
                  title={t(product.titleKey)}
                  description={t(product.descriptionKey)}
                  learnMoreLabel={t("products.learnMoreLabel")}
                  featured={product.featured}
                />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
