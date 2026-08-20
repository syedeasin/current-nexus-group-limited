import { getTranslations } from "next-intl/server";
import { heroSlides } from "@/lib/data/heroSlides";
import HeroCarousel from "@/components/sections/home/hero/HeroCarousel";

export default async function Hero() {
  const t = await getTranslations("home.hero");

  const slides = heroSlides.map((slide) => ({
    id: slide.id,
    image: slide.image,
    imagePosition: slide.imagePosition,
    ctaHref: slide.ctaHref,
    heading: t(`slides.${slide.messageKey}.heading`),
    body: t(`slides.${slide.messageKey}.body`),
    cta: t(`slides.${slide.messageKey}.cta`),
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
