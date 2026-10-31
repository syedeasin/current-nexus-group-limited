"use client";

import Image from "@/components/ui/Picture";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WhyChooseReason } from "@/components/sections/home/why-choose-cnx/WhyChooseExplorer";

/**
 * Why choose us, row 2 (see WhyChooseShowcase).
 *
 * Desktop: photo on the left, reasons on the right, both the same height.
 * Hovering (or clicking / focusing) a reason opens its text and cross-fades
 * the photo to that reason's own image.
 *
 * Phones: an accordion. Tapping a reason opens it and shows its text with its
 * photo right underneath, so the words and the picture are seen together; the
 * other reasons stay closed, so the list stays short. One open at a time.
 */
export default function WhyChooseShowcaseExplorer({
  reasons,
  fallbackImage,
  imageAlt,
}: {
  reasons: WhyChooseReason[];
  fallbackImage: string;
  imageAlt: string;
}) {
  const [active, setActive] = useState(0);
  const [openOnPhone, setOpenOnPhone] = useState(0);

  if (reasons.length === 0) return null;

  return (
    <>
      {/* ── Phones and tablets: accordion with a photo inside each panel ── */}
      <ol className="flex flex-col border-t border-white/10 lg:hidden">
        {reasons.map((reason, index) => {
          const open = index === openOnPhone;
          const panelId = `why-choose-mobile-${reason.key}`;
          return (
            <li key={reason.key} className="border-b border-white/10">
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenOnPhone(open ? -1 : index)}
                  className="flex w-full items-center gap-16 py-20 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                >
                  <Image src={reason.icon} alt="" aria-hidden width={28} height={28} className="size-28 shrink-0" />
                  <span className={cn("flex-1 text-h6 font-semibold transition-colors", open ? "text-white" : "text-neutral-8")}>
                    {reason.title}
                  </span>
                  {/* Plus turns into a minus when open. */}
                  <span aria-hidden="true" className="relative size-16 shrink-0">
                    <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-secondary" />
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-secondary transition-transform duration-300",
                        open && "scale-y-0"
                      )}
                    />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-hidden={!open}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-20 pb-24 pl-44">
                    {reason.body && <p className="text-p3 text-neutral-8">{reason.body}</p>}
                    {(reason.image || fallbackImage) && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-12 bg-neutral-2">
                        <Image src={reason.image || fallbackImage} alt={imageAlt} fill sizes="100vw" className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── Desktop: photo left, hover list right, same height ── */}
      <div className="hidden grid-cols-2 items-stretch gap-80 lg:grid xl:gap-120">
        <div className="relative min-h-[460px] overflow-hidden rounded-16 bg-neutral-2">
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
