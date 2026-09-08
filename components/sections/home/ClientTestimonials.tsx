import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Button, { BUTTON_ICON_SIZE } from "@/components/ui/Button";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { testimonials } from "@/lib/data/testimonials";
import { cascade } from "@/lib/motion/timing";

const CARD_DELAY_MS = cascade(2);
/** The photo scales in first; its copy follows once that move has settled. */
const CONTENT_BASE_DELAY_MS = CARD_DELAY_MS + 200;
const CONTENT_STEP_MS = 80;

export default async function ClientTestimonials() {
  const t = await getTranslations("home.testimonials");
  const story = testimonials[0];

  return (
    <section aria-label={t("heading")} className="w-full bg-surface-2">
      <Container className="flex flex-col gap-48 py-48 md:py-64 xl:py-100">
        <div className="flex w-full flex-col items-center gap-12">
          <Reveal as="div" delay={cascade(0)}>
            <SectionEyebrow label={t("eyebrow")} />
          </Reveal>
          <Reveal as="div" delay={cascade(1)}>
            <Heading level={2} size="h2" className="text-center">
              {t("heading")}
            </Heading>
          </Reveal>
        </div>

        <Reveal
          as="div"
          delay={CARD_DELAY_MS}
          className="relative w-full overflow-hidden rounded-16 bg-neutral-2 lg:h-600"
        >
          <Reveal variant="scale" as="div" className="absolute inset-0">
            <Image
              src={story.photo}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1280px) 1320px, 100vw"
              className="object-cover"
              style={{ objectPosition: "center 45%" }}
            />
          </Reveal>
          <div aria-hidden="true" className="testimonial-scrim pointer-events-none absolute inset-0" />

          <div className="relative flex flex-col justify-between gap-40 p-24 min-[480px]:p-32 lg:absolute lg:inset-0 lg:p-40 xl:p-60">
            <Reveal
              variant="fade"
              delay={CONTENT_BASE_DELAY_MS}
              as="div"
              className="flex flex-col items-start gap-16 min-[480px]:gap-27"
            >
              <div className="flex items-center gap-12">
                <Image
                  src={story.logo}
                  alt=""
                  aria-hidden="true"
                  width={48}
                  height={47}
                  className="h-32 w-auto min-[480px]:h-40 lg:h-48"
                />
                <span className="text-[24px] font-semibold leading-[32px] tracking-[-0.48px] text-white min-[480px]:text-[30px] min-[480px]:leading-[40px] min-[480px]:tracking-[-0.6px] lg:text-[36px] lg:leading-[48px] lg:tracking-[-0.72px]">
                  {story.clientWordmark}
                </span>
              </div>
              <div className="flex flex-col gap-8">
                <p className="text-p1 font-medium text-white">{t(`stories.${story.key}.clientName` as never)}</p>
                <p className="text-p1 font-medium text-white">{t(`stories.${story.key}.location` as never)}</p>
              </div>
            </Reveal>

            <div className="flex flex-col items-start gap-24 lg:flex-row lg:items-end lg:justify-between">
              <Reveal
                variant="fade"
                delay={CONTENT_BASE_DELAY_MS + CONTENT_STEP_MS}
                as="div"
                className="w-full lg:min-w-0 lg:flex-1"
              >
                <blockquote className="m-0">
                  <p className="text-p1 font-medium text-white lg:min-h-136 xl:min-h-144">
                    {t(`stories.${story.key}.quote` as never)}
                  </p>
                  <cite className="sr-only not-italic">{story.clientWordmark}</cite>
                </blockquote>
              </Reveal>
              <Reveal
                variant="fade"
                delay={CONTENT_BASE_DELAY_MS + CONTENT_STEP_MS * 2}
                as="div"
                className="w-full min-[481px]:w-fit lg:shrink-0"
              >
                <Button href={story.href} size="lg" className="w-full min-[481px]:w-fit">
                  {t("cta")}
                  <ChevronRight size={BUTTON_ICON_SIZE} />
                </Button>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
