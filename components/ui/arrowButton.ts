import { cn } from "@/lib/utils";

/**
 * Prev / next carousel arrow (48px circle). Both directions look the same at
 * rest, an outline, because neither is more important than the other. Gold
 * fill shows on hover and keyboard focus, a small press on click, and a
 * disabled arrow stays faded with no hover change.
 */
export function arrowButtonClass(enabled: boolean, className?: string) {
  return cn(
    "flex size-48 shrink-0 items-center justify-center rounded-full border-[1.5px] border-neutral-10 bg-transparent text-neutral-1 outline-none",
    "transition-[background-color,border-color,transform] duration-200 ease-out motion-reduce:transition-none",
    "focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
    enabled
      ? "hover:border-secondary hover:bg-secondary focus-visible:border-secondary focus-visible:bg-secondary active:scale-95"
      : "cursor-not-allowed opacity-40",
    className
  );
}
