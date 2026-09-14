"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarRailProps {
  className?: string;
}

/** Figma node 2080:38697 draws a 6px thumb; below this it would be a smudge. */
const MIN_THUMB_HEIGHT = 24;

/**
 * The 12px hairline track between the sidebar and the results column.
 *
 * Figma shows a scrollbar thumb inside it, but the sidebar is a normal
 * document-flow column that grows with its content, so in practice there is
 * nothing to scroll. The thumb therefore renders only when the sidebar really
 * does overflow — measured, not assumed — and otherwise the track is just the
 * two rules. A thumb that scrolls nothing is worse than no thumb.
 *
 * The measurement reads the previous sibling deliberately: the rail is defined
 * as "the track beside the column before it", which keeps `DownloadsExplorer`
 * free of refs threaded through two client components.
 */
export default function SidebarRail({ className }: SidebarRailProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const sidebar = track?.previousElementSibling as HTMLElement | null;
    if (!track || !sidebar) return;

    function measure() {
      if (!track || !sidebar) return;
      const trackHeight = track.clientHeight;
      const contentHeight = sidebar.scrollHeight;
      if (trackHeight === 0 || contentHeight <= trackHeight + 1) {
        setThumb(null);
        return;
      }
      const height = Math.max(MIN_THUMB_HEIGHT, (trackHeight / contentHeight) * trackHeight);
      const scrollable = contentHeight - sidebar.clientHeight;
      const progress = scrollable > 0 ? sidebar.scrollTop / scrollable : 0;
      setThumb({ top: progress * (trackHeight - height), height });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(sidebar);
    sidebar.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      sidebar.removeEventListener("scroll", measure);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className={cn(
        "relative w-12 shrink-0 border-l-[1.5px] border-r-[1.5px] border-neutral-10 bg-white",
        className
      )}
    >
      {thumb ? (
        <span
          className="absolute left-1/2 w-6 -translate-x-1/2 rounded-full bg-neutral-9"
          style={{ top: thumb.top, height: thumb.height }}
        />
      ) : null}
    </div>
  );
}
