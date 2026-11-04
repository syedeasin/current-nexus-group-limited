import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import Heading from "@/components/ui/Heading";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import FaqAccordion from "@/components/sections/home/faq/FaqAccordion";
import ProjectInquiryCard from "@/components/sections/shared/ProjectInquiryCard";
import { entries, str } from "@/lib/page-content/read";
import type { MessageTree } from "@/lib/page-content/tree";
import { cascade, REVEAL_STEP_MS } from "@/lib/motion/timing";
import { cn } from "@/lib/utils";
import type { BlockTone } from "@/components/sections/blocks/ContentBlocks";

/**
 * FAQ block: the site's FAQ layout (heading and Project Inquiry Card in a
 * sticky column, accordion beside it) plus FAQPage structured data.
 */
export default function BlockFaq({ data, tone }: { data: MessageTree; tone: BlockTone }) {
  const questions = entries(data.items)
    .map(([id, item]) => ({ id, question: str(item, "question"), answer: str(item, "answer") }))
    .filter((item) => item.question && item.answer);
  if (questions.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section aria-label={str(data, "heading")} className={cn("w-full py-64 md:py-80 xl:py-120", tone === "muted" ? "bg-surface-2" : "bg-white")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container>
        <div className="faq-grid w-full">
          <div className="faq-aside">
            <div className="faq-header flex flex-col gap-12">
              {str(data, "eyebrow") ? (
                <Reveal as="div" delay={cascade(0)}>
                  <SectionEyebrow label={str(data, "eyebrow")} />
                </Reveal>
              ) : null}
              <TextReveal delay={cascade(1)}>
                <Heading level={2} size="h2" className="text-balance">
                  {str(data, "heading")}
                </Heading>
              </TextReveal>
            </div>
            <Reveal as="div" delay={cascade(2)} className="faq-contact-area w-full">
              <ProjectInquiryCard ctaHref={str(data, "cardCtaHref") || undefined} />
            </Reveal>
          </div>
          <div className="faq-accordion-area w-full">
            <FaqAccordion questions={questions} defaultOpenId={questions[0].id} baseDelay={cascade(2)} stepDelay={REVEAL_STEP_MS} staggerCapMs={400} />
          </div>
        </div>
      </Container>
    </section>
  );
}
