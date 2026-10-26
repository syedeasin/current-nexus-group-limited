"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/hooks/useMediaQuery";

/** Bump the version to ask everyone again (e.g. after adding analytics). */
const CONSENT_KEY = "cnx-cookie-consent-v1";
/** Choices expire so the banner returns roughly twice a year. */
const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180;
/** Footer "Cookie settings" fires this to bring the banner back. */
export const OPEN_COOKIE_SETTINGS_EVENT = "cnx:open-cookie-settings";

export type CookieChoice = "all" | "necessary";

/** The visitor's current choice, or null before they choose (or after it expired). */
export function readCookieChoice(): CookieChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { choice?: CookieChoice; at?: number };
    if (!saved.choice || !saved.at || Date.now() - saved.at > CONSENT_MAX_AGE_MS) return null;
    return saved.choice;
  } catch {
    return null;
  }
}

interface CookieConsentProps {
  labels: {
    title: string;
    message: string;
    policyLabel: string;
    accept: string;
    reject: string;
    dialogLabel: string;
  };
}

/**
 * Cookie banner (client revision 1008). Shown on every visit until the
 * visitor accepts or rejects; the choice is kept for 180 days. Any analytics
 * added later must only load after readCookieChoice() === "all". "Accept" and
 * "Reject" get equal weight, as GDPR guidance expects.
 */
export default function CookieConsent({ labels }: CookieConsentProps) {
  // "auto" = show only if no saved choice. Read after hydration (localStorage
  // doesn't exist on the server), so server and first client render agree.
  const hydrated = useHydrated();
  const [mode, setMode] = useState<"auto" | "open" | "closed">("auto");
  const open = mode === "open" || (mode === "auto" && hydrated && readCookieChoice() === null);

  useEffect(() => {
    const reopen = () => setMode("open");
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  function choose(choice: CookieChoice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() }));
    } catch {
      // Storage blocked (private mode): the banner simply shows again next visit.
    }
    setMode("closed");
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={labels.dialogLabel}
      className="fixed inset-x-16 bottom-16 z-50 mx-auto max-w-1100 rounded-16 border border-neutral-10 bg-white p-20 shadow-lg md:inset-x-24 md:bottom-24 md:p-24"
    >
      <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:justify-between lg:gap-32">
        <div className="flex flex-col gap-4">
          <p className="text-p3 font-semibold text-neutral-1">{labels.title}</p>
          <p className="text-p4 text-neutral-3">
            {labels.message}{" "}
            <Link href="/cookie-policy" className="font-medium text-neutral-1 underline underline-offset-2">
              {labels.policyLabel}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-8 sm:flex-row">
          <button
            type="button"
            onClick={() => choose("necessary")}
            className="rounded-full border-[1.5px] border-neutral-10 px-24 py-12 text-btn-sm font-semibold text-neutral-1 transition-colors duration-150 hover:bg-neutral-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {labels.reject}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-full bg-secondary px-24 py-12 text-btn-sm font-semibold text-neutral-1 transition-colors duration-150 hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {labels.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
