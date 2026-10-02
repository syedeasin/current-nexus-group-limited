import { getTranslations } from "next-intl/server";
import HeroCarousel from "@/components/sections/home/hero/HeroCarousel";
import { entries, str } from "@/lib/page-content/read";

export default async function Hero() {
  const t = await getTranslations("home.hero");

  // Slides are an editable list (Dashboard → Pages → Homepage → Hero slider).
  const slides = entries(t.raw("slides" as never)).map(([id, slide]) => ({
    id,
    image: str(slide, "image"),
    imagePosition: str(slide, "imagePosition") || "50% 50%",
    ctaHref: str(slide, "ctaHref") || "/contact",
    heading: str(slide, "heading"),
    body: str(slide, "body"),
    cta: str(slide, "cta"),
  }));

  return (
    <HeroCarousel
      slides={slides}
      ariaLabel={t("ariaLabel")}
      previousSlideLabel={t("previousSlide")}
      nextSlideLabel={t("nextSlide")}
    />
  );
}
