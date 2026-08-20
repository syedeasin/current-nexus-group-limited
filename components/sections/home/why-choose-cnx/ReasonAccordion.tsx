"use client";

import Image from "next/image";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";

interface Reason {
  key: string;
  icon: string;
  title: string;
  body: string;
}

interface ReasonAccordionProps {
  reasons: Reason[];
  defaultOpenKey: string;
  baseDelay: number;
  stepDelay: number;
}

export default function ReasonAccordion({
  reasons,
  defaultOpenKey,
  baseDelay,
  stepDelay,
}: ReasonAccordionProps) {
  const items: AccordionItem[] = reasons.map((reason) => ({
    id: reason.key,
    icon: <Image src={reason.icon} alt="" aria-hidden="true" width={28} height={28} />,
    label: <span className="text-h5 font-semibold text-white">{reason.title}</span>,
    panel: reason.body ? (
      <p className="pt-12 pl-52 text-p3 text-neutral-9">{reason.body}</p>
    ) : undefined,
  }));

  return (
    <Accordion
      items={items}
      defaultOpenId={defaultOpenKey}
      itemClassName="border-b border-white/10 pt-32 pb-32 first:pt-0"
      chevronClassName="text-white/50"
      renderItem={(node, item, index) => (
        <Reveal as="div" delay={baseDelay + index * stepDelay} className="w-full">
          {node}
        </Reveal>
      )}
    />
  );
}
