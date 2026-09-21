import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The single horizontal rhythm for every page.
 *
 * One content column, 1320px wide on desktop, centred, with the same gutters
 * everywhere: 20px on mobile, 64px from 768px up. The header, every section,
 * the news grid and the footer all sit on it, so nothing on the site is ever
 * measurably wider or narrower than anything else.
 *
 * The geometry lives in `.cnx-container` in globals.css rather than in Tailwind
 * classes here, because full-bleed rails (carousel tracks, the hero's edge
 * arrows) need to land on the same content edge without being inside this
 * component — `.cnx-container-inset` reproduces it from the same two custom
 * properties. Two classes, one source of truth.
 *
 * A section may still be full-width — backgrounds, hero imagery, a horizontal
 * track. Its *content* goes in here.
 *
 * @see docs/DESIGN-SYSTEM.md
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("cnx-container", className)}>
      {children}
    </div>
  );
}
