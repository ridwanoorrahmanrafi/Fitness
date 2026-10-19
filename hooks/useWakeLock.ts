"use client";

import { useEffect } from "react";

/** Keeps the screen on while a workout is active (where supported). Silently does nothing elsewhere. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        /* denied or low battery: not essential */
      }
    };
    void acquire();

    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled) void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
