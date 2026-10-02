/** Shared Tailwind class strings for dashboard cards and buttons (usable from server and client components). */
export const cardClass = "rounded-16 border border-neutral-10 bg-white p-24 lg:p-32";
export const cardTitleClass = "text-h6 font-extralight tracking-[-0.2px] text-neutral-1";
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-8 rounded-full bg-primary px-24 py-14 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-8 rounded-full border border-neutral-10 bg-white px-20 py-10 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
export const dangerButtonClass =
  "inline-flex items-center justify-center gap-8 rounded-full border border-error/40 bg-white px-20 py-10 text-p4 font-semibold uppercase tracking-[1px] text-error transition-colors duration-200 hover:bg-error hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60";
export const noticeClass = {
  success: "rounded-8 border border-success/30 bg-success/5 px-16 py-12 text-p4 text-success",
  error: "rounded-8 border border-error/30 bg-error/5 px-16 py-12 text-p4 text-error",
  warning: "rounded-8 border border-warning/30 bg-warning/5 px-16 py-12 text-p4 text-warning",
} as const;
