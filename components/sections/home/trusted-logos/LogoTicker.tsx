"use client";

import { useEffect, useRef, useState } from "react";
import type { TrustedLogo } from "@/lib/data/trustedLogos";

interface LogoTickerProps {
  logos: TrustedLogo[];
}

/** Pixels of horizontal travel per second. Kept constant regardless of logo count. */
const SPEED_PX_PER_SEC = 20;

export default function LogoTicker({ logos }: LogoTickerProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const measure = () => {
      const halfWidth = node.scrollWidth / 2;
      if (halfWidth > 0) setDuration(halfWidth / SPEED_PX_PER_SEC);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Duplicated once so the track can loop seamlessly; the duplicate is aria-hidden
  // so each brand is announced exactly once.
  const doubled = [...logos, ...logos];

  return (
    <div className="ticker-viewport relative w-full overflow-hidden" tabIndex={0}>
      <div
        ref={trackRef}
        className="ticker-track flex w-max items-center gap-[var(--ticker-gap)] will-change-transform"
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((logo, index) => {
          const isDuplicate = index >= logos.length;
          return (
            <div key={`${logo.name}-${index}`} className="group flex shrink-0 items-center gap-[var(--ticker-gap)]">
              {index > 0 && <span className="h-[20px] w-px shrink-0 bg-neutral-10" aria-hidden="true" />}
              <img
                src={logo.image}
                alt={isDuplicate ? "" : logo.name}
                aria-hidden={isDuplicate || undefined}
                style={{ height: "var(--logo-h)", width: "auto" }}
                loading="lazy"
                decoding="async"
                className="opacity-65 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
