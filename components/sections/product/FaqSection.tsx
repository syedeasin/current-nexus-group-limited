import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import FaqAccordion from "@/components/sections/home/faq/FaqAccordion";
import ContactCard from "@/components/sections/shared/ContactCard";
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
          <div className="faq-header flex flex-col gap-12">
            <Reveal as="div" delay={0}>
              <SectionEyebrow label={data.eyebrow} />
            </Reveal>
            <Reveal as="div" delay={HEADING_DELAY_MS}>
              <Heading level={2} size="h2" className="whitespace-pre-line">
                {data.heading}
              </Heading>
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

          <div className="faq-contact-area flex w-full max-w-400 flex-col items-start gap-14">
            <Reveal as="div" delay={CONTACT_DELAY_MS} className="w-full">
              <ContactCard
                avatarSrc={data.contact.avatarSrc}
                name={data.contact.name}
                role={data.contact.role}
                message={data.contact.message}
                ctaLabel={data.contact.ctaLabel}
                ctaHref={data.contact.ctaHref}
              />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
