import type { ProductDetail } from "@/lib/data/products/types";
import { bcProductDetail } from "@/lib/data/products/bc";

const productDetails: Record<string, Record<string, ProductDetail>> = {
  "solar-panels": {
    bc: bcProductDetail,
  },
};

export async function getProductDetail(category: string, slug: string): Promise<ProductDetail | null> {
  return productDetails[category]?.[slug] ?? null;
}

export type { ProductDetail } from "@/lib/data/products/types";
