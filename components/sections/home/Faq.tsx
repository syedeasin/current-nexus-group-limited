import { getTranslations } from "next-intl/server";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import FaqAccordion from "@/components/sections/home/faq/FaqAccordion";
import ProjectInquiryCard from "@/components/sections/shared/ProjectInquiryCard";
import { cascade, REVEAL_STEP_MS } from "@/lib/motion/timing";
import { entries, str } from "@/lib/page-content/read";

const HEADING_DELAY_MS = cascade(1);
const CONTACT_DELAY_MS = cascade(2);
const ACCORDION_BASE_DELAY_MS = cascade(2);
const ACCORDION_STEP_MS = REVEAL_STEP_MS;
const ACCORDION_STAGGER_CAP_MS = 400;

export default async function Faq() {
  const t = await getTranslations("home.faq");

  const questions = entries(t.raw("items" as never)).map(([id, item]) => ({
    id,
    question: str(item, "question"),
    answer: str(item, "answer"),
  }));
  const defaultOpenId = questions.find((q) => q.answer)?.id ?? "";

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
    <section aria-label={t("heading")} className="w-full bg-white py-64 md:py-80 xl:py-120">
      {/* JSON.stringify only (no HTML) — avoids React's default text-node escaping corrupting the JSON. "<" is escaped so admin-edited copy can never close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <Container>
        <div className="faq-grid w-full">
          {/* Heading + inquiry card share one column that stays in view on desktop,
              so a long FAQ list no longer leaves a blank left side (revision 1022). */}
          <div className="faq-aside">
            <div className="faq-header flex flex-col gap-12">
              <Reveal as="div" delay={cascade(0)}>
                <SectionEyebrow label={t("eyebrow")} />
              </Reveal>
              <TextReveal delay={HEADING_DELAY_MS}>
                <Heading level={2} size="h2" className="whitespace-pre-line">
                  {t("heading")}
                </Heading>
              </TextReveal>
            </div>

            <Reveal as="div" delay={CONTACT_DELAY_MS} className="faq-contact-area w-full">
              <ProjectInquiryCard />
            </Reveal>
          </div>

          <div className="faq-accordion-area w-full">
            <FaqAccordion
              questions={questions}
              defaultOpenId={defaultOpenId}
              baseDelay={ACCORDION_BASE_DELAY_MS}
              stepDelay={ACCORDION_STEP_MS}
              staggerCapMs={ACCORDION_STAGGER_CAP_MS}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
