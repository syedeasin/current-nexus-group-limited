"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Date field for the enquiry forms (client revision 1022: the browser's own
 * picker was too small). A large month grid with month/year jumps, Today and
 * Clear. Submits "YYYY-MM-DD" through a hidden input under the field's name,
 * exactly what the native date input sent.
 */

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function fromIso(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}
const sameDay = (a: Date | null, b: Date | null) =>
  Boolean(a && b) && a!.getFullYear() === b!.getFullYear() && a!.getMonth() === b!.getMonth() && a!.getDate() === b!.getDate();

interface DatePickerProps {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export default function DatePicker({ id, name, defaultValue, placeholder, required, className, ...aria }: DatePickerProps) {
  const locale = useLocale();
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Date | null>(() => fromIso(defaultValue));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = fromIso(defaultValue) ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const today = useMemo(() => new Date(), []);

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2026, m, 1))),
    [locale]
  );
  // Monday-first weekday initials.
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 0, 5 + i))),
    [locale]
  );
  const years = useMemo(() => {
    const y = today.getFullYear();
    return Array.from({ length: 16 }, (_, i) => y - 5 + i);
  }, [today]);

  // The forms call form.reset() after a successful send; follow it.
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onReset = () => setValue(fromIso(defaultValue));
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [defaultValue]);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep keyboard focus on the active day while navigating.
  useEffect(() => {
    if (!open || focusDay === null) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus();
  }, [open, focusDay, view]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const shiftMonth = (delta: number) => setView(new Date(year, month + delta, 1));

  function openPicker() {
    const base = value ?? today;
    setView(new Date(base.getFullYear(), base.getMonth(), 1));
    setFocusDay(base.getDate());
    // Open toward whichever side has room, so a right-column field never clips.
    const rect = rootRef.current?.getBoundingClientRect();
    setAlignRight(Boolean(rect && rect.left + 380 > window.innerWidth && rect.right - 380 >= 0));
    setOpen(true);
  }

  function choose(day: number) {
    setValue(new Date(year, month, day));
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(id)}`)?.focus();
  }

  function onGridKey(event: KeyboardEvent<HTMLDivElement>) {
    if (focusDay === null) return;
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in moves) {
      event.preventDefault();
      const target = new Date(year, month, focusDay + moves[event.key]);
      if (target.getMonth() !== month || target.getFullYear() !== year) setView(new Date(target.getFullYear(), target.getMonth(), 1));
      setFocusDay(target.getDate());
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      shiftMonth(event.key === "PageUp" ? -1 : 1);
      setFocusDay(Math.min(focusDay, 28));
    }
  }

  const label = value
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(value)
    : placeholder || "Select a date";

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <input type="hidden" name={name} value={value ? toIso(value) : ""} data-required={required || undefined} />
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={cn(className, "flex items-center justify-between gap-12 text-left", !value && "text-neutral-7")}
        {...aria}
      >
        <span className="truncate">{label}</span>
        <CalendarDays size={20} aria-hidden="true" className="shrink-0 text-neutral-5" />
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Choose a date"
          className={cn(
            "absolute z-50 mt-8 w-[min(360px,calc(100vw-40px))] rounded-16 border border-neutral-10 bg-white p-16 shadow-[0_24px_60px_rgba(10,13,27,0.16)] sm:p-20",
            alignRight ? "right-0" : "left-0"
          )}
        >
          <div className="mb-12 flex items-center justify-between gap-8">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex size-40 items-center justify-center rounded-full text-neutral-3 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-6">
              <select
                aria-label="Month"
                value={month}
                onChange={(e) => setView(new Date(year, Number(e.target.value), 1))}
                className="rounded-8 border border-neutral-10 bg-white px-8 py-6 text-p4 font-semibold text-neutral-1"
              >
                {monthNames.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={year}
                onChange={(e) => setView(new Date(Number(e.target.value), month, 1))}
                className="rounded-8 border border-neutral-10 bg-white px-8 py-6 text-p4 font-semibold text-neutral-1"
              >
                {(years.includes(year) ? years : [...years, year].sort()).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex size-40 items-center justify-center rounded-full text-neutral-3 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-4 pb-4 text-center text-p4 font-medium uppercase text-neutral-5">
            {weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div ref={gridRef} role="grid" onKeyDown={onGridKey} className="grid grid-cols-7 gap-4">
            {cells.map((day, index) => {
              if (day === null) return <span key={`e${index}`} />;
              const date = new Date(year, month, day);
              const selected = sameDay(date, value);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={day}
                  type="button"
                  data-day={day}
                  tabIndex={day === focusDay ? 0 : -1}
                  aria-pressed={selected}
                  aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date)}
                  onClick={() => choose(day)}
                  onFocus={() => setFocusDay(day)}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-full text-p4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                    selected
                      ? "bg-neutral-1 font-semibold text-white"
                      : isToday
                        ? "border border-secondary font-semibold text-neutral-1 hover:bg-secondary/20"
                        : "text-neutral-1 hover:bg-surface-2"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-neutral-10 pt-12">
            <button
              type="button"
              onClick={() => {
                setValue(null);
                setOpen(false);
              }}
              className="rounded-full px-12 py-8 text-p4 font-medium text-neutral-4 hover:text-neutral-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setValue(today);
                setOpen(false);
              }}
              className="rounded-full bg-surface-2 px-16 py-8 text-p4 font-semibold text-neutral-1 hover:bg-secondary"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
