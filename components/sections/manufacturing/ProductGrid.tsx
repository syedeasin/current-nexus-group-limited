import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ManufacturingProductCard from "@/components/sections/manufacturing/ProductCard";
import type { ProductCategory } from "@/lib/data/manufacturing";
import { bool, entries, str } from "@/lib/page-content/read";

const CARD_STEP_MS = 80;
const CARD_STAGGER_CAP_MS = 400;

export default async function ProductGrid({ category }: { category: ProductCategory }) {
  const t = await getTranslations(`${category.namespace}.products`);
  // Cards are an editable list (Dashboard → Pages → Manufacturing → <category> → Product cards).
  const products = entries(t.raw("items" as never));

  return (
    <section className="w-full bg-white pt-80 pb-100">
      <Container>
        <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
          {products.map(([id, product], index) => {
            const delay = Math.min(index * CARD_STEP_MS, CARD_STAGGER_CAP_MS);
            return (
              <Reveal key={id} as="div" delay={delay}>
                <ManufacturingProductCard
                  href={str(product, "href") || `/manufacturing/${category.slug}`}
                  image={str(product, "image")}
                  title={str(product, "title")}
                  description={str(product, "description")}
                  learnMoreLabel={t("learnMoreLabel")}
                  featured={bool(product, "featured")}
                />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
