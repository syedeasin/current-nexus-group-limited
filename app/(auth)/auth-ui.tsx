import type { ReactNode } from "react";

/** Shared pieces of the sign-in, forgot-password and reset-password screens. */

export function AuthHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-32">
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">{eyebrow}</p>
      <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">{title}</h1>
      {children && <div className="mt-12 text-p3 font-light leading-relaxed text-neutral-5">{children}</div>}
    </div>
  );
}

export function AuthNotice({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const styles = {
    success: "border-success/30 bg-success/5 text-success",
    error: "border-error/30 bg-error/5 text-error",
    info: "border-primary/20 bg-surface-1 text-primary",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-20 rounded-8 border px-16 py-12 text-p4 leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export const authLabelClass = "mb-8 block text-p4 font-semibold uppercase tracking-[2px] text-neutral-5";

export const authInputClass =
  "w-full rounded-8 border border-neutral-10 bg-white px-16 py-12 text-p3 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-6 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const authButtonClass =
  "w-full rounded-full bg-primary px-24 py-16 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";

export const authLinkClass =
  "font-medium text-primary underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
