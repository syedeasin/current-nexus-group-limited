"use client";

import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import { PlusMinus } from "@/components/icons/PlusMinus";

interface FaqQuestion {
  id: string;
  question: string;
  /** Empty string renders the trigger as present but not expandable. */
  answer: string;
}

interface FaqAccordionProps {
  questions: FaqQuestion[];
  defaultOpenId: string;
  baseDelay: number;
  stepDelay: number;
  staggerCapMs: number;
}

export default function FaqAccordion({
  questions,
  defaultOpenId,
  baseDelay,
  stepDelay,
  staggerCapMs,
}: FaqAccordionProps) {
  const items: AccordionItem[] = questions.map((q) => ({
    id: q.id,
    label: <span className="text-h6 font-semibold text-neutral-1">{q.question}</span>,
    panel: q.answer ? <p className="pt-12 pr-48 text-p3 text-neutral-3">{q.answer}</p> : undefined,
  }));

  return (
    <Accordion
      items={items}
      defaultOpenId={defaultOpenId}
      className="gap-16"
      itemClassName="rounded-8 bg-surface-2 p-16 min-[481px]:p-20 lg:p-24"
      triggerClassName="items-center"
      chevronClassName="pt-0"
      indicator={(isOpen) => (
        <PlusMinus isOpen={isOpen} size={20} className={isOpen ? "text-secondary" : "text-neutral-3"} />
      )}
      renderItem={(node, item, index) => (
        <Reveal
          as="div"
          delay={baseDelay + Math.min(index * stepDelay, staggerCapMs)}
          className="w-full"
        >
          {node}
        </Reveal>
      )}
    />
  );
}
