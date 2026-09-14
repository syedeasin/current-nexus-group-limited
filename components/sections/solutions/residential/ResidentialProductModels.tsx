import Image from "next/image";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Reveal from "@/components/ui/Reveal";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { CARD_IMAGE_ZOOM, CARD_LIFT } from "@/lib/motion/interactions";
import { CONTENT_BASE_DELAY_MS, cascade, stagger } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";

/**
 * The two residential HJT modules, in Figma order (node 4028:10516).
 *
 * `href` is the datasheet download target. There is no per-product datasheet
 * route yet, so both point at the shared downloads page until there is one.
 */
const PRODUCTS = [
  {
    key: "uranusPro",
    image:
      "/images/solutionsAndProjects/solutions/residential/solutions-residential-product-model-730-765w.webp",
    href: "/service/downloads",
    buttonVariant: "primary",
    // Figma draws both buttons 48px tall, but only the second carries a visible
    // 1.5px rule. Matching it with a transparent one here keeps the two boxes
    // identical so the buttons sit on the same baseline across the two cards.
    buttonClassName: "border-[1.5px] border-transparent",
  },
  {
    key: "venusPro",
    image:
      "/images/solutionsAndProjects/solutions/residential/solutions-residential-product-model-530-565w.webp",
    href: "/service/downloads",
    // `outline` is the gold-bordered variant; this card's button is a neutral
    // hairline outline, so it starts from `ghost` and adds the border.
    buttonVariant: "ghost",
    buttonClassName: "border-[1.5px] border-neutral-10 hover:bg-neutral-11 hover:text-neutral-1",
  },
] as const;

/**
 * Product Model — Figma node 4028:10516 ("HJT products").
 *
 * Desktop is two 424x340 image boxes over a name + datasheet button; the card's
 * 460px Figma height falls out of the parts (340 + 28 + 20 + 48 + 24), so it is
 * never hard-coded and the cards stay honest when a name wraps.
 */
export default async function ResidentialProductModels() {
  const t = await getTranslations("solutions.residential.productModel");
  const datasheetLabel = t("datasheetLabel");

  return (
    <section aria-label={t("heading")} className="w-full bg-white py-48 md:py-64 xl:py-100">
      <Container>
        <div className="flex w-full flex-col items-center gap-48">
          <div className="flex w-full max-w-560 flex-col items-center gap-12 md:max-w-680 xl:max-w-790">
            <Reveal as="div" delay={cascade(0)}>
              <SectionEyebrow label={t("eyebrow")} />
            </Reveal>
            <Reveal as="div" delay={cascade(1)}>
              {/* Figma draws this heading in the unfinished "Stack Sans
                  Headline" placeholder style (52/60/-1.04px); the H2s on this
                  page that use the real Switzer token are 48/56/-1.2px, so the
                  page tracks -1.2px throughout. Global token untouched. */}
              <Heading
                level={2}
                size="h2"
                className="text-balance text-center tracking-[-1.2px]!"
              >
                {t("heading")}
              </Heading>
            </Reveal>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-24 sm:flex-row sm:items-stretch">
            {PRODUCTS.map((product, index) => {
              const name = t(`products.${product.key}.name`);

              return (
                <Reveal
                  key={product.key}
                  as="div"
                  delay={stagger(index, CONTENT_BASE_DELAY_MS)}
                  className="w-full max-w-424 sm:min-w-0 sm:flex-1"
                >
                  <div
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-16 border border-neutral-10 bg-surface-2",
                      CARD_LIFT
                    )}
                  >
                    {/* Contained product shot, not a fill: Figma insets the
                        240x276 photo by 92px horizontally and 32px vertically
                        inside the 424x340 box. `p-32` + object-contain lands on
                        exactly that — the 240x276 aspect letterboxes itself to
                        276px tall inside the 360x276 padding box — and keeps
                        the inset proportional once the card narrows. */}
                    <div className="relative aspect-[424/340] w-full overflow-hidden">
                      <Image
                        src={product.image}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 424px, (min-width: 640px) 45vw, 90vw"
                        className={cn("object-contain p-32", CARD_IMAGE_ZOOM)}
                      />
                    </div>

                    <div className="flex flex-1 flex-col items-center gap-20 px-24 pb-24">
                      <Heading level={3} size="h6" className="text-center text-balance">
                        {name}
                      </Heading>
                      {/* Both cards share one label, so screen readers get the
                          product name folded into each button's accessible name. */}
                      <Button
                        href={product.href}
                        size="lg"
                        variant={product.buttonVariant}
                        aria-label={`${datasheetLabel} — ${name}`}
                        className={cn(
                          // Label + icon need ~240px, so Figma's 24px side
                          // padding only fits from the 481px card up. Below
                          // that the padding steps down to 16 to keep the
                          // label on one line; under ~360px it finally wraps,
                          // which the auto height and 48px floor absorb
                          // identically on both cards so they stay aligned.
                          "mt-auto h-auto min-h-48 max-w-full shrink whitespace-normal px-16 py-12 text-center min-[481px]:px-24",
                          product.buttonClassName
                        )}
                      >
                        <Download size={18} aria-hidden="true" className="shrink-0" />
                        {datasheetLabel}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
