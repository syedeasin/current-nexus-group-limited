import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailPage from "@/components/sections/product/ProductDetailPage";
import { getProductDetail } from "@/lib/data/products";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getProductDetail("solar-panels", "bc");
  if (!product) return { title: "Product not found" };

  return {
    title: product.meta.title,
    description: product.meta.description,
  };
}

export default async function BcProductPage() {
  const product = await getProductDetail("solar-panels", "bc");
  if (!product) notFound();

  return <ProductDetailPage product={product} />;
}
