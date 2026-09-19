"use client";

import Image from "next/image";
import { useState } from "react";
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

// Placeholder copy so every row is expandable until the client provides final text.
// The i18n body always takes priority over this fallback.
const BODY_FALLBACK: Record<string, string> = {
  "Vertical Manufacturing & Quality Control":
      "We control every stage from cell to finished module in our own facilities, so quality, lead times, and consistency stay in our hands, not a third party's.",
  "Bankable Tier-1 Brand Portfolio":
      "Our lineup is built around bankable Tier-1 manufacturers, giving your projects the certifications, warranties, and financing acceptance that lenders and EPCs expect.",
  "EPC+F Credit Financing Support":
      "Exclusive 2-year long-term credit financing for qualified ODM partners. Ease your project cash flow pressure and scale your pipeline without tying up working capital.",
  "Hybrid Procurement Synergy":
      "Source modules, storage, and balance-of-system parts through one partner, so you cut coordination overhead, align delivery schedules, and negotiate stronger bundled pricing.",
  "Technical & After sales Engineering":
      "Our engineers support you from system design and product selection to installation guidance, warranty handling, and long-term performance monitoring.",
  "Global Logistics & Tariff Compliance":
      "We manage shipping, documentation, and tariff compliance across markets, so your orders clear customs smoothly and arrive on schedule wherever your projects are.",
};

function resolveBody(title: string, body: string): string {
  if (body) return body;
  return BODY_FALLBACK[title.trim()] ?? "";
}

export default function ReasonAccordion({
                                          reasons,
                                          defaultOpenKey,
                                          baseDelay,
                                          stepDelay,
                                        }: ReasonAccordionProps) {
  const [openKey, setOpenKey] = useState<string>(defaultOpenKey);

  return (
      <div className="flex w-full flex-col">
        {reasons.map((reason, index) => {
          const body = resolveBody(reason.title, reason.body);
          const isOpen = openKey === reason.key;
          const panelId = `reason-panel-${reason.key}`;
          const buttonId = `reason-trigger-${reason.key}`;

          return (
              <Reveal
                  key={reason.key}
                  as="div"
                  delay={baseDelay + index * stepDelay}
                  className="w-full border-b-[1.5px] border-white/10 py-32 first:pt-0"
              >
                <h3 className="m-0">
                  <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenKey(isOpen ? "" : reason.key)}
                      onMouseEnter={() => setOpenKey(reason.key)}
                      className="flex w-full cursor-pointer items-start gap-24 text-left"
                  >
                <span className="flex shrink-0 items-center py-2">
                  <Image src={reason.icon} alt="" aria-hidden width={28} height={28} />
                </span>
                    <span className="flex-1 text-h5 font-semibold text-white">
                  {reason.title}
                </span>
                  </button>
                </h3>

                <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className={`grid pl-52 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-12 text-p3 text-neutral-9">
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
          );
        })}
      </div>
  );
}