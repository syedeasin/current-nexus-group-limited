"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";

interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  questions: FaqQuestion[];
  defaultOpenId: string;
  baseDelay: number;
  stepDelay: number;
  staggerCapMs: number;
}

// Safety net: if a locale has not filled an answer yet, fall back to English
// so every item stays expandable. The i18n answer always takes priority.
const ANSWER_FALLBACK: Record<string, string> = {
  "What products does CNX Energy provide?":
      "CNX Energy provides solar modules, energy storage systems, and photovoltaic products for residential, commercial, and utility-scale projects. Our lineup covers back contact, HJT, TOPCon, and ODM vertical solar modules.",
  "Do you offer private-label (ODM/OEM) manufacturing?":
      "Yes. CNX Energy provides OEM and ODM manufacturing services for solar modules and energy storage products, helping partners build their own brands with reliable production and strict quality control.",
  "What do I receive with my purchase?":
      "Every order includes the products you selected, full technical documentation, product warranty, and access to our after-sales support team. For bulk and project orders, we also handle logistics and tariff compliance.",
  "Which Tier 1 brands do you work with?":
      "We partner with globally recognized Tier 1 manufacturers such as JA Solar, Tongwei, Growatt, DEYE, and GoodWe, so you always receive bankable, certified products backed by strong warranties and proven field performance.",
  "Can CNX support large commercial and utility-scale projects?":
      "Yes. We support large commercial and utility-scale projects with high-volume manufacturing, EPC and credit financing support, and full logistics and tariff compliance, so your project stays on schedule from order to delivery.",
  "Do you provide technical and after-sales support?":
      "Yes. Our technical and after-sales engineering team supports you before and after purchase, from product selection and system design to installation guidance, warranty claims, and long-term maintenance.",
};

function resolveAnswer(question: string, answer: string): string {
  if (answer) return answer;
  const key = question.replace(/^q\.\s*/i, "").trim();
  return ANSWER_FALLBACK[key] ?? "";
}

export default function FaqAccordion({
                                       questions,
                                       defaultOpenId,
                                       baseDelay,
                                       stepDelay,
                                       staggerCapMs,
                                     }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string>(defaultOpenId);

  return (
      <div className="flex w-full flex-col gap-16">
        {questions.map((q, index) => {
          const answer = resolveAnswer(q.question, q.answer);
          const isOpen = openId === q.id;
          const panelId = `faq-panel-${q.id}`;
          const buttonId = `faq-trigger-${q.id}`;

          return (
              <Reveal
                  key={q.id}
                  as="div"
                  delay={baseDelay + Math.min(index * stepDelay, staggerCapMs)}
                  className="w-full"
              >
                {/* Client revision doc point 15: hover opens it (same pattern as the
                    other accordions), and the open item now inverts to a dark fill
                    instead of sharing the closed items' flat light-gray card — a real
                    colour swap, not just a tint, so the selected question reads at a
                    glance. */}
                <div
                    className={`w-full rounded-8 border p-16 transition-colors duration-200 ease-out min-[481px]:p-20 lg:p-24 ${
                        isOpen ? "border-neutral-1 bg-neutral-1" : "border-surface-2 bg-surface-2"
                    }`}
                >
                  <h3 className="m-0">
                    <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? "" : q.id)}
                        onMouseEnter={() => setOpenId(q.id)}
                        className="flex w-full cursor-pointer items-center justify-between gap-12 text-left"
                    >
                  {/* Figma H6 spec here tracks -0.2px, not the shared --text-h6 token's
                      -0.1px — consistent across every H6 usage checked this pass. */}
                  <span
                      className={`text-h6 font-semibold tracking-[-0.2px]! transition-colors duration-200 ease-out ${
                          isOpen ? "text-white" : "text-neutral-1"
                      }`}
                  >
                    {q.question}
                  </span>
                      <span className="flex shrink-0 items-center py-4" aria-hidden>
                    <Indicator isOpen={isOpen} />
                  </span>
                    </button>
                  </h3>

                  <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      aria-hidden={!isOpen}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-12 pr-48 text-p3 text-neutral-9">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
          );
        })}
      </div>
  );
}

function Indicator({ isOpen }: { isOpen: boolean }) {
  return (
      <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={isOpen ? "text-secondary" : "text-neutral-3"}
      >
        <path d="M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
            d="M10 4v12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`origin-center transition-transform duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "scale-y-0" : "scale-y-100"
            }`}
        />
      </svg>
  );
}