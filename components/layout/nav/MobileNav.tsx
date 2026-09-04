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
      <div className="flex h-56 items-center justify-between px-20 py-16 lg:hidden">
        <Link href="/" className="shrink-0">
          <Logo isTransparent={isTransparent} width={98} height={24} className="h-24 w-98" />
        </Link>

        <div className="flex items-center gap-16">
          <button
              type="button"
              aria-label={t("search")}
              onClick={onOpenSearch}
              className={cn("flex size-24 items-center justify-center", iconColor)}
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
                  "flex size-24 items-center justify-center",
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
