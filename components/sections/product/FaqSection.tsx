import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import FaqAccordion from "@/components/sections/home/faq/FaqAccordion";
import ProjectInquiryCard from "@/components/sections/shared/ProjectInquiryCard";
import type { FaqSection as FaqSectionData } from "@/lib/data/products/types";

const HEADING_DELAY_MS = 80;
const CONTACT_DELAY_MS = 160;
const ACCORDION_BASE_DELAY_MS = 160;
const ACCORDION_STEP_MS = 80;
const ACCORDION_STAGGER_CAP_MS = 400;

export default function FaqSection({ data }: { data: FaqSectionData }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-label={data.heading} className="w-full bg-white py-48 md:py-64 xl:py-80">
      {/* Static, local data — safe per project convention, avoids React's default text-node HTML-escaping corrupting the JSON. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Container>
        <div className="faq-grid w-full">
          {/* Heading + Project Inquiry Card stay in view beside a long FAQ list on
              desktop (revision 1022: the left side used to sit empty). */}
          <div className="faq-aside">
            <div className="faq-header flex flex-col gap-12">
              <Reveal as="div" delay={0}>
                <SectionEyebrow label={data.eyebrow} />
              </Reveal>
              <TextReveal delay={HEADING_DELAY_MS}>
                {/* Figma H2 spec here tracks -1.2px, not the shared --text-h2 token's -0.72px. */}
                <Heading level={2} size="h2" className="whitespace-pre-line tracking-[-1.2px]!">
                  {data.heading}
                </Heading>
              </TextReveal>
            </div>

            <Reveal as="div" delay={CONTACT_DELAY_MS} className="faq-contact-area w-full">
              <ProjectInquiryCard />
            </Reveal>
          </div>

          <div className="faq-accordion-area w-full">
            <FaqAccordion
              questions={data.items}
              defaultOpenId={data.defaultOpenId}
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
