"use client";

import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  return (
      <form
          className="flex items-center justify-between gap-2 rounded-full border border-line-dark bg-dark px-5 py-[14px]"
          onSubmit={(e) => e.preventDefault()}
      >
        <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            className="min-w-0 flex-1 bg-transparent font-mono text-[14px] tracking-[-0.5px] text-paper outline-none placeholder:text-paper-3"
        />
        <button
            type="submit"
            aria-label="Subscribe"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-paper-3 transition-colors hover:text-paper"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
  );
}
