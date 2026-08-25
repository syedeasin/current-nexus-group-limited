"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query via useSyncExternalStore instead of the
 * effect+setState pattern, so the initial value is available synchronously
 * on first render (no flash) and there's no setState-in-effect for React
 * Compiler's lint rule to flag.
 */
export function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
