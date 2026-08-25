import Image from "next/image";
import { FileText } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import Button from "@/components/ui/Button";
import { PhoneCall } from "@/components/icons/PhoneCall";
import { cn } from "@/lib/utils";
import type { ProductHero } from "@/lib/data/products/types";

const STAT_BASE_DELAY_MS = 240;
const STAT_STEP_MS = 80;
const STAT_STAGGER_CAP_MS = 400;

export default function Hero({ hero }: { hero: ProductHero }) {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-1">
      <Image
        src={hero.backgroundImage}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "rgba(10,13,27,0.9)", backdropFilter: "blur(19.6px)" }}
      />

      <Reveal
        variant="scale"
        as="div"
        className="absolute top-1/2 right-[4%] hidden h-560 w-486 -translate-y-1/2 opacity-90 lg:block"
      >
        <Image
          src={hero.productImage}
          alt=""
          aria-hidden="true"
          fill
          sizes="486px"
          className="object-contain"
        />
      </Reveal>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180.53deg, rgba(10,13,27,0) 0.91%, rgba(10,13,27,0.9) 75.27%, #0A0D1B 94.69%)",
          backdropFilter: "blur(10px)",
        }}
      />

      <Container className="relative flex flex-col gap-64 py-64 md:py-80 xl:gap-160 xl:py-100">
        <div className="flex max-w-680 flex-col gap-40">
          <Reveal as="div" delay={0}>
            <SectionEyebrow label={hero.eyebrow} />
          </Reveal>
          <Reveal as="div" delay={80}>
            <Heading level={1} size="h2" className="text-balance text-white">
              {hero.heading}
            </Heading>
          </Reveal>
          <Reveal as="div" delay={160}>
            <Text size="p1" className="max-w-638 text-[#CECFD1]">
              {hero.body}
            </Text>
          </Reveal>
          <Reveal as="div" delay={240} className="flex w-full flex-col gap-12 min-[560px]:w-auto min-[560px]:flex-row">
            <Button href={hero.primaryCta.href} size="xl" className="w-full min-[560px]:w-auto">
              <FileText size={20} />
              {hero.primaryCta.label}
            </Button>
            <Button
              href={hero.secondaryCta.href}
              size="xl"
              variant="ghost"
              className="w-full border-[1.5px] border-neutral-6 text-white hover:bg-white/10 hover:text-white min-[560px]:w-auto"
            >
              <PhoneCall size={20} />
              {hero.secondaryCta.label}
            </Button>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-24 sm:grid-cols-3 lg:flex lg:items-stretch lg:justify-between lg:gap-0">
          {hero.stats.map((stat, index) => {
            const delay = STAT_BASE_DELAY_MS + Math.min(index * STAT_STEP_MS, STAT_STAGGER_CAP_MS);
            return (
              <Reveal
                key={stat.label}
                as="div"
                delay={delay}
                className={cn(
                  "flex flex-col gap-8 border-t border-white/15 pt-16 first:border-t-0 sm:border-t-0",
                  index > 0 && "lg:border-l-[1.5px] lg:border-t-0 lg:pt-0 lg:pl-24"
                )}
              >
                <span className="text-h4 font-semibold text-white">{stat.value}</span>
                <Text size="p2" className="text-[#CECFD1]">
                  {stat.label}
                </Text>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
