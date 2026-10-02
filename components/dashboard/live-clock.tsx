"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

const TIME_ZONE = "America/New_York";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const zoneFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "short" });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});

function read(now: Date) {
  const zone = zoneFormatter.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time: timeFormatter.format(now), zone, date: dateFormatter.format(now) };
}

export default function LiveClock() {
  const [label, setLabel] = useState<ReturnType<typeof read> | null>(null);

  useEffect(() => {
    function tick() {
      setLabel(read(new Date()));
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!label) return null;

  return (
    <div
      className="hidden shrink-0 items-center gap-10 rounded-full border border-neutral-10 bg-white py-6 pl-10 pr-14 shadow-[0_1px_2px_rgba(10,13,27,0.04)] xl:flex"
      title={`Office time (${label.zone})`}
    >
      <span className="flex h-28 w-28 items-center justify-center rounded-full bg-surface-1 text-primary">
        <Clock3 size={14} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] font-semibold tabular-nums text-neutral-1">
          {label.time} <span className="font-medium text-neutral-6">{label.zone}</span>
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-[1px] text-neutral-6">{label.date}</span>
      </span>
    </div>
  );
}
