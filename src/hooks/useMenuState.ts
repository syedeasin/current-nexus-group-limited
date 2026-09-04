"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type RefObject,
} from "react";

const OPEN_DELAY_MS = 100;
const CLOSE_DELAY_MS = 100;

/**
 * One open panel at a time, with hover-intent delays, outside-click and
 * Escape closing, and a reset whenever the route changes.
 *
 * Mirrors openKey in a ref so scheduleOpen can synchronously determine
 * whether a panel is already active.
 */
export function useMenuState(
    containerRef: RefObject<HTMLElement | null>,
    pathname: string
) {
    const [openKey, setOpenKeyState] = useState<string | null>(null);

    const openKeyRef = useRef<string | null>(null);

    const openTimer = useRef<number | null>(null);
    const closeTimer = useRef<number | null>(null);

    const setOpenKey = useCallback((key: string | null) => {
        openKeyRef.current = key;
        setOpenKeyState(key);
    }, []);

    const clearOpenTimer = useCallback(() => {
        const timer = openTimer.current;

        if (timer !== null) {
            window.clearTimeout(timer);
            openTimer.current = null;
        }
    }, []);

    const clearCloseTimer = useCallback(() => {
        const timer = closeTimer.current;

        if (timer !== null) {
            window.clearTimeout(timer);
            closeTimer.current = null;
        }
    }, []);

    const open = useCallback(
        (key: string) => {
            clearOpenTimer();
            clearCloseTimer();
            setOpenKey(key);
        },
        [clearOpenTimer, clearCloseTimer, setOpenKey]
    );

    const close = useCallback(() => {
        clearOpenTimer();
        clearCloseTimer();
        setOpenKey(null);
    }, [clearOpenTimer, clearCloseTimer, setOpenKey]);

    const toggle = useCallback(
        (key: string) => {
            clearOpenTimer();
            clearCloseTimer();

            setOpenKey(openKeyRef.current === key ? null : key);
        },
        [clearOpenTimer, clearCloseTimer, setOpenKey]
    );

    const scheduleOpen = useCallback(
        (key: string) => {
            clearCloseTimer();

            if (openKeyRef.current !== null) {
                // A panel is already active — swap immediately.
                open(key);
                return;
            }

            clearOpenTimer();

            openTimer.current = window.setTimeout(() => {
                open(key);
            }, OPEN_DELAY_MS);
        },
        [clearCloseTimer, clearOpenTimer, open]
    );

    const scheduleClose = useCallback(() => {
        clearOpenTimer();
        clearCloseTimer();

        closeTimer.current = window.setTimeout(() => {
            close();
        }, CLOSE_DELAY_MS);
    }, [clearOpenTimer, clearCloseTimer, close]);

    // Escape closes the currently open menu.
    useEffect(() => {
        if (openKey === null) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                close();
            }
        }

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [openKey, close]);

    // Outside click closes the menu.
    useEffect(() => {
        if (openKey === null) return;

        function onPointerDown(event: PointerEvent) {
            const container = containerRef.current;

            if (
                container &&
                !container.contains(event.target as Node)
            ) {
                close();
            }
        }

        document.addEventListener("pointerdown", onPointerDown);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
        };
    }, [openKey, close, containerRef]);

    // Close the menu when the route changes.
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;
            close();
        }
    }, [pathname, close]);

    // Cleanup timers when the component unmounts.
    useEffect(() => {
        return () => {
            clearOpenTimer();
            clearCloseTimer();
        };
    }, [clearOpenTimer, clearCloseTimer]);

    return {
        openKey,
        open,
        close,
        toggle,
        scheduleOpen,
        scheduleClose,
    };
}