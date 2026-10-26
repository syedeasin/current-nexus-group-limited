"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { Link } from "@/i18n/navigation";
import { getLenis } from "@/lib/motion/lenis-instance";
import { cn } from "@/lib/utils";
import type { BrandProduct } from "@/lib/brands/content";

/** Fired by a product's "Request a Quote" — the brand inquiry form fills in the model. */
export const BRAND_QUOTE_EVENT = "cnx:brand-quote";

const CARD_SPECS = 4;

interface BrandProductsProps {
  brandName: string;
  logo: string;
  items: BrandProduct[];
  allLabel: string;
  tabsLabel: string;
  viewSpecsLabel: string;
  datasheetLabel: string;
  quoteLabel: string;
  closeLabel: string;
  specsDialogLabel: string;
}

function requestQuote(series: string) {
  window.dispatchEvent(new CustomEvent(BRAND_QUOTE_EVENT, { detail: series }));
  const target = document.getElementById("inquiry");
  if (!target) return;
  // Through Lenis when it runs, so the smooth scroller doesn't fight a native jump.
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: -96 });
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

const ACTION_CLASS =
  "inline-flex h-44 shrink-0 items-center justify-center gap-6 whitespace-nowrap rounded-full px-20 text-p4 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const SPECS_LINK_CLASS =
  "text-p4 font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors duration-150 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/**
 * Product display (brief §3): photo, series, category, the key procurement
 * parameters and three actions per card. Category tabs appear only when a
 * brand has more than one category (e.g. Deye inverters + storage). A card
 * without a photo shows the brand logo instead of a misleading stock shot.
 */
export default function BrandProducts({
  brandName,
  logo,
  items,
  allLabel,
  tabsLabel,
  viewSpecsLabel,
  datasheetLabel,
  quoteLabel,
  closeLabel,
  specsDialogLabel,
}: BrandProductsProps) {
  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const [active, setActive] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const baseId = useId();

  const visible = active ? items.filter((item) => item.category === active) : items;
  const open = items.find((item) => item.id === openId) ?? null;

  function showSpecs(id: string) {
    setOpenId(id);
    dialogRef.current?.showModal();
  }

  return (
    <div className="flex flex-col gap-32">
      {categories.length > 1 ? (
        <div role="group" aria-label={tabsLabel} className="flex flex-wrap justify-center gap-8">
          {[null, ...categories].map((category) => (
            <button
              key={category ?? "all"}
              type="button"
              aria-pressed={active === category}
              onClick={() => setActive(category)}
              className={cn(
                "h-40 whitespace-nowrap rounded-full border-[1.5px] px-20 text-p4 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
                active === category
                  ? "border-neutral-1 bg-neutral-1 text-white"
                  : "border-neutral-10 bg-white text-neutral-3 hover:border-neutral-6"
              )}
            >
              {category ?? allLabel}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="grid gap-24 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <li key={item.id} className="flex flex-col overflow-hidden rounded-16 border border-neutral-10 bg-surface-2">
            <div className="relative flex aspect-[424/280] items-center justify-center overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.series}
                  fill
                  sizes="(min-width: 1024px) 424px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : logo ? (
                <Image src={logo} alt="" aria-hidden="true" width={180} height={48} className="h-28 w-auto max-w-[70%] object-contain opacity-50 grayscale sm:h-36" />
              ) : (
                <span aria-hidden="true" className="text-h4 font-semibold text-neutral-7">
                  {brandName}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-20 px-24 pt-20 pb-24">
              <div className="flex flex-col items-center gap-4 text-center">
                {item.category ? <span className="text-p4 text-tertiary">{item.category}</span> : null}
                <h3 className="text-h6 font-semibold text-balance text-neutral-1">{item.series}</h3>
              </div>
              {item.specs.length > 0 ? (
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-12 border border-neutral-10 bg-neutral-10">
                  {item.specs.slice(0, CARD_SPECS).map((spec) => (
                    <div key={spec.label} className="flex flex-col gap-2 bg-white px-14 py-10">
                      <dt className="text-p4 text-neutral-5">{spec.label}</dt>
                      <dd className="text-p4 font-semibold text-neutral-1">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="mt-auto flex flex-col items-center gap-14">
                <div className="flex w-full flex-col gap-8">
                  <a
                    href="#inquiry"
                    onClick={(event) => {
                      event.preventDefault();
                      requestQuote(item.series);
                    }}
                    className={cn(ACTION_CLASS, "bg-secondary text-neutral-1 hover:bg-secondary/90")}
                  >
                    {quoteLabel}
                    <ChevronRight size={12} />
                  </a>
                  {item.datasheetHref ? (
                    <Link
                      href={item.datasheetHref}
                      className={cn(ACTION_CLASS, "border-[1.5px] border-neutral-10 bg-white text-neutral-1 hover:bg-neutral-11")}
                    >
                      <Download size={16} aria-hidden="true" />
                      {datasheetLabel}
                    </Link>
                  ) : null}
                </div>
                {item.specsHref ? (
                  <Link href={item.specsHref} className={SPECS_LINK_CLASS}>
                    {viewSpecsLabel}
                  </Link>
                ) : (
                  <button type="button" onClick={() => showSpecs(item.id)} aria-haspopup="dialog" className={SPECS_LINK_CLASS}>
                    {viewSpecsLabel}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${baseId}-dialog-title`}
        onClose={() => setOpenId(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto w-[min(640px,calc(100vw-32px))] rounded-20 bg-white p-0 text-neutral-1 backdrop:bg-neutral-1/60"
      >
        {open ? (
          <div className="flex flex-col gap-24 p-24 md:p-32">
            <div className="flex items-start justify-between gap-16">
              <div className="flex flex-col gap-4">
                <span className="text-p4 font-medium uppercase tracking-[1px] text-tertiary">{specsDialogLabel}</span>
                <h3 id={`${baseId}-dialog-title`} className="text-h5 font-semibold">
                  {open.series}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={closeLabel}
                className="flex size-40 shrink-0 items-center justify-center rounded-full border border-neutral-10 hover:border-neutral-6 focus-visible:outline-2 focus-visible:outline-secondary"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <dl className="flex flex-col divide-y divide-neutral-10 border-y border-neutral-10">
              {open.specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-16 py-12">
                  <dt className="text-p3 text-neutral-5">{spec.label}</dt>
                  <dd className="text-right text-p3 font-semibold">{spec.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-8">
              {open.datasheetHref ? (
                <Link href={open.datasheetHref} className={cn(ACTION_CLASS, "border-[1.5px] border-neutral-10 hover:bg-neutral-11")}>
                  <Download size={16} aria-hidden="true" />
                  {datasheetLabel}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  dialogRef.current?.close();
                  requestQuote(open.series);
                }}
                className={cn(ACTION_CLASS, "bg-secondary text-neutral-1 hover:bg-secondary/90")}
              >
                {quoteLabel}
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
