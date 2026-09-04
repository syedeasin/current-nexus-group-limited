"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  isTransparent: boolean;
  width: number;
  height: number;
  /** bare Tailwind size classes matching width/height, e.g. "h-32 w-129" */
  className: string;
}

// Both logo lockups are stacked absolutely and crossfaded with opacity so the
// transparent <-> white header transition never shifts layout.
export default function Logo({ isTransparent, width, height, className }: LogoProps) {
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width, height }}>
      <Image
        src="/logos/cnx-logo-white.svg"
        alt="CNX Energy"
        fill
        priority
        sizes={`${width}px`}
        className={cn(
          "object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none",
          isTransparent ? "opacity-100" : "opacity-0"
        )}
      />
      <Image
        src="/logos/cnx-logo-dark.svg"
        alt="CNX Energy"
        fill
        priority
        sizes={`${width}px`}
        className={cn(
          "object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none",
          isTransparent ? "opacity-0" : "opacity-100"
        )}
      />
    </span>
  );
}
