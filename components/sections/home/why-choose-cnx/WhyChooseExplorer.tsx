"use client";

import Image from "@/components/ui/Picture";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WhyChooseReason {
  key: string;
  icon: string;
  title: string;
  body: string;
  image: string;
}

/**
 * Homepage "Why choose us" (client feedback 28 Oct: back to hover, no scroll
 * pinning).
 *
 * Desktop: hovering (or clicking / focusing) a reason opens its text on the
 * right and cross-fades the photo on the left to that reason's own image. The
 * section scrolls normally, so the whole photo is always visible. Phones: a
 * plain list with every answer open and one photo.
 */
export default function WhyChooseExplorer({
  header,
  reasons,
  fallbackImage,
  imageAlt,
}: {
  header: ReactNode;
  reasons: WhyChooseReason[];
  fallbackImage: string;
  imageAlt: string;
}) {
  const [active, setActive] = useState(0);

  if (reasons.length === 0) return null;

  return (
    <>
      {/* ── Phones and tablets ── */}
      <div className="flex flex-col gap-40 lg:hidden">
        {header}
        <ol className="flex flex-col border-t border-white/10">
          {reasons.map((reason) => (
            <li key={reason.key} className="flex gap-16 border-b border-white/10 py-24">
              <Image src={reason.icon} alt="" aria-hidden width={28} height={28} className="mt-2 size-28 shrink-0" />
              <div className="flex flex-col gap-8">
                <h3 className="text-h6 font-semibold text-white">{reason.title}</h3>
                {reason.body && <p className="text-p3 text-neutral-8">{reason.body}</p>}
              </div>
            </li>
          ))}
        </ol>
        {fallbackImage && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-16">
            <Image src={fallbackImage} alt={imageAlt} fill sizes="100vw" className="object-cover" />
          </div>
        )}
      </div>

      {/* ── Desktop: hover-driven ── */}
      <div className="hidden grid-cols-2 items-stretch gap-80 lg:grid xl:gap-120">
        {/* Left: header and link, then the photo for the active reason. */}
        <div className="flex flex-col justify-between gap-48">
          {header}
          <div className="relative aspect-[600/380] w-full overflow-hidden rounded-16 bg-neutral-2">
            {reasons.map((reason, index) => (
              <div
                key={reason.key}
                aria-hidden={index !== active}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                  index === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                )}
              >
                <Image
                  src={reason.image || fallbackImage}
                  alt={index === active ? imageAlt : ""}
                  fill
                  sizes="(min-width: 1280px) 600px, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: the reasons; hovering one opens it. */}
        <ol className="flex flex-col justify-center" aria-label="Reasons">
          {reasons.map((reason, index) => {
            const selected = index === active;
            const panelId = `why-choose-panel-${reason.key}`;
            return (
              <li key={reason.key} className="border-b border-white/10 last:border-b-0" onMouseEnter={() => setActive(index)}>
                <h3 className="m-0">
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    aria-expanded={selected}
                    aria-controls={panelId}
                    className={cn(
                      "flex w-full items-center gap-20 py-20 text-left text-h5 font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
                      selected ? "text-white" : "text-neutral-6 hover:text-neutral-9"
                    )}
                  >
                    <Image
                      src={reason.icon}
                      alt=""
                      aria-hidden
                      width={28}
                      height={28}
                      className={cn("size-28 shrink-0 transition-opacity duration-300", selected ? "opacity-100" : "opacity-50")}
                    />
                    {reason.title}
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-hidden={!selected}
                  className={cn(
                    "grid pl-48 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-24 text-p3 text-neutral-8">{reason.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
