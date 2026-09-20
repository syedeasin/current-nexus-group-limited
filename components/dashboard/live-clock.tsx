"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZoneName: "short",
});

export default function LiveClock() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      setLabel(formatter.format(new Date()));
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!label) return null;

  return (
    <span className="hidden shrink-0 whitespace-nowrap text-p4 font-medium tabular-nums text-neutral-5 md:inline">
      {label}
    </span>
  );
}
