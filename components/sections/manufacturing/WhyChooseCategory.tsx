import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Cpu, TrendingUp, Globe } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/lib/data/manufacturing";

const ICONS = {
  cpu: Cpu,
  "trending-up": TrendingUp,
  globe: Globe,
} as const;

const HEADING_DELAY_MS = 80;
const IMAGE_DELAY_MS = 160;
const FEATURE_BASE_DELAY_MS = 240;
const FEATURE_STEP_MS = 80;
const FEATURE_STAGGER_CAP_MS = 400;

export default async function WhyChooseCategory({ category }: { category: ProductCategory }) {
  const t = await getTranslations(category.namespace as never);

  return (
    <section className="w-full bg-surface-2 py-100">
      <Container className="flex flex-col gap-48">
        <div className="mx-auto flex max-w-702 flex-col items-center gap-12 text-center">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={t("whyChoose.eyebrow" as never)} />
          </Reveal>
          <Reveal as="div" delay={HEADING_DELAY_MS}>
            <Heading level={2} size="h2" className="text-balance">
              {t("whyChoose.heading" as never)}
            </Heading>
          </Reveal>
        </div>

        <div className="flex flex-col gap-48">
          <Reveal
            variant="scale"
            delay={IMAGE_DELAY_MS}
            className="relative aspect-[1320/500] w-full overflow-hidden rounded-16 xl:h-500 xl:aspect-auto"
          >
            <Image
              src={category.whyChooseImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1280px) 1320px, 100vw"
              className="object-cover"
            />
          </Reveal>

          <div className="flex flex-col gap-24 sm:grid sm:grid-cols-2 sm:gap-32 lg:flex lg:flex-row lg:gap-48">
            {category.features.map((feature, index) => {
              const Icon = ICONS[feature.icon];
              const delay = FEATURE_BASE_DELAY_MS + Math.min(index * FEATURE_STEP_MS, FEATURE_STAGGER_CAP_MS);
              return (
                <Reveal
                  key={feature.titleKey}
                  as="div"
                  delay={delay}
                  className={cn(
                    "flex flex-1 gap-20",
                    index > 0 && "border-t border-neutral-10 pt-24 sm:border-t-0 sm:pt-0 lg:border-l lg:pl-48"
                  )}
                >
                  <Icon size={24} className="shrink-0 pt-2 text-secondary" aria-hidden="true" />
                  <div className="flex flex-col gap-8">
                    <Heading level={3} size="h6">
                      {t(feature.titleKey as never)}
                    </Heading>
                    <Text size="p2" className="text-neutral-3">
                      {t(feature.descriptionKey as never)}
                    </Text>
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
