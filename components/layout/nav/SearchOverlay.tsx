"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchForm from "./SearchForm";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const t = useTranslations("nav");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={rootRef}
      role="search"
      aria-hidden={!isOpen}
      className={cn(
        "absolute left-0 right-0 top-56 z-40 lg:top-88",
        "border-b border-neutral-10 bg-white",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-8 opacity-0"
      )}
    >
      <div className="flex items-center gap-12 px-20 py-16 lg:gap-16 lg:px-80">
        <button
          type="button"
          aria-label={t("closeSearch")}
          onClick={onClose}
          className="order-first shrink-0 rounded-full p-8 text-neutral-1 transition-colors duration-150 hover:text-secondary lg:hidden"
        >
          <ArrowLeft size={24} />
        </button>
        <SearchForm active={isOpen} onSubmitted={onClose} className="flex-1" />
        <button
          type="button"
          aria-label={t("closeSearch")}
          onClick={onClose}
          className="hidden shrink-0 rounded-full p-8 text-neutral-1 transition-colors duration-150 hover:text-secondary lg:block"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
