"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleSwitch } from "@/src/hooks/useLocaleSwitch";
import type { Locale } from "@/i18n/routing";

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

interface LanguageSwitcherProps {
  isTransparent: boolean;
}

export default function LanguageSwitcher({ isTransparent }: LanguageSwitcherProps) {
  const t = useTranslations("nav");
  const { locale, locales, selectLocale } = useLocaleSwitch();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  function handleSelect(code: Locale) {
    setIsOpen(false);
    selectLocale(code);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t("changeLanguage")}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((value) => !value)}
        className={cn(
          "flex items-center gap-4 rounded-full py-12 pl-14 pr-8 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
          isTransparent ? "text-white hover:text-secondary" : "text-neutral-1 hover:text-secondary"
        )}
      >
        <Globe size={20} />
        <span className="text-p3">{locale.toUpperCase()}</span>
        <ChevronDown size={20} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-hidden={!isOpen}
        className={cn(
          "absolute right-0 top-full z-50 mt-4 min-w-140 rounded-8 py-8 shadow-lg",
          "bg-white border border-neutral-10",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        )}
      >
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            role="menuitemradio"
            aria-checked={locale === code}
            onClick={() => handleSelect(code)}
            className={cn(
              "flex w-full items-center gap-8 px-16 py-8 text-p3 text-neutral-1 transition-colors hover:bg-neutral-10",
              locale === code && "font-medium text-secondary"
            )}
          >
            <span className="w-24 shrink-0">{code.toUpperCase()}</span>
            <span className="text-neutral-4">{LOCALE_NAMES[code]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
