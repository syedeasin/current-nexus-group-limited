import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import FaqAccordion from "@/components/sections/home/faq/FaqAccordion";
import ContactCard from "@/components/sections/home/faq/ContactCard";
import { faqItems, DEFAULT_OPEN_ID } from "@/lib/data/faq";

const HEADING_DELAY_MS = 80;
const CONTACT_DELAY_MS = 160;
const ACCORDION_BASE_DELAY_MS = 160;
const ACCORDION_STEP_MS = 80;
const ACCORDION_STAGGER_CAP_MS = 400;

export default async function Faq() {
  const t = await getTranslations("home.faq");

  const questions = faqItems.map((item) => ({
    id: item.id,
    question: t(`items.${item.id}.question`),
    answer: t(`items.${item.id}.answer`),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions
      .filter((q) => q.answer)
      .map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
  };

  return (
    <section aria-label={t("heading")} className="w-full bg-white pt-48 pb-40 md:pt-64 md:pb-56 xl:pt-80 xl:pb-100">
      {/* Static, local data — safe per project convention, avoids React's default text-node HTML-escaping corrupting the JSON. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container>
        <div className="faq-grid w-full">
          <div className="faq-header flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={t("eyebrow")} />
            </Reveal>
            <Reveal as="div" delay={HEADING_DELAY_MS}>
              <Heading level={2} size="h2" className="whitespace-pre-line">
                {t("heading")}
              </Heading>
            </Reveal>
          </div>

          <div className="faq-accordion-area w-full">
            <FaqAccordion
              questions={questions}
              defaultOpenId={DEFAULT_OPEN_ID}
              baseDelay={ACCORDION_BASE_DELAY_MS}
              stepDelay={ACCORDION_STEP_MS}
              staggerCapMs={ACCORDION_STAGGER_CAP_MS}
            />
          </div>

          <div className="faq-contact-area flex w-full max-w-400 flex-col items-start gap-14">
            <Reveal as="div" delay={CONTACT_DELAY_MS}>
              <Text size="p3" className="text-neutral-3">
                {t("needHelp")}
              </Text>
            </Reveal>
            <Reveal as="div" delay={CONTACT_DELAY_MS} className="w-full">
              <ContactCard />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
