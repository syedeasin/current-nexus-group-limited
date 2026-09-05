// components/layout/nav/MobileNav.tsx
"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

interface MobileNavProps {
  isTransparent: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpenSearch: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileNav({ isTransparent, isOpen, onOpenChange, onOpenSearch, triggerRef }: MobileNavProps) {
  const t = useTranslations("nav");
  const iconColor = cn(
    "transition-colors duration-250 ease-out motion-reduce:transition-none",
    isTransparent ? "text-white" : "text-neutral-1"
  );

  return (
      <div className="flex h-56 items-center justify-between px-20 py-16 xl:hidden">
        <Link href="/" className="shrink-0">
          <Logo isTransparent={isTransparent} width={98} height={24} className="h-24 w-98" />
        </Link>

        <div className="flex items-center gap-16">
          {/* p-8 -m-8: pads the hit area out to 40px (real-device tap target
              minimum) while the matching negative margin cancels the padding out
              of the row's layout, so the icon's visual position and the gap-16
              spacing are unchanged. Capped at 8px (not 10px) because the two
              buttons sit gap-16 apart — 2x10px padding would expand each button's
              hit box 20px toward its neighbor, overlapping into a 4px dead zone
              where a tap could resolve to the wrong button; 2x8px exactly meets
              the middle of the gap with zero overlap. */}
          <button
              type="button"
              aria-label={t("search")}
              onClick={onOpenSearch}
              className={cn("-m-8 flex items-center justify-center p-8", iconColor)}
          >
            <Search size={24} />
          </button>

          <button
              ref={triggerRef}
              type="button"
              aria-label={isOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={isOpen}
              onClick={() => onOpenChange(!isOpen)}
              className={cn(
                  "-m-8 flex items-center justify-center p-8",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
                  iconColor
              )}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
  );
}
