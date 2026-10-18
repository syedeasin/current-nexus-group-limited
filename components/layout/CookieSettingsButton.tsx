"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/layout/CookieConsent";

/** Footer link that reopens the cookie banner so a visitor can change their choice. */
export default function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}>
      {label}
    </button>
  );
}
