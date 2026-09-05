import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The single horizontal rhythm for every page.
 *
 * Figma draws the homepage on a 1600px frame with a 1320px content column and
 * 140px gutters (confirmed on About CNX, Application Scenes, Awards, Client
 * Testimonials, FAQ, Latest News and the hero's arrow rail). `max-w-1600` +
 * `xl:px-140` reproduces that exactly at >= 1600px and keeps the same gutter
 * proportion as the viewport narrows, instead of capping content at an
 * arbitrary width.
 *
 * Gutters: 20 (mobile) / 64 (>= md) / 140 (>= xl).
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-1600 px-20 md:px-64 xl:px-140", className)}>
      {children}
    </div>
  );
}
