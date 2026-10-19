"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useState persisted to localStorage. Renders `initial` on the server and first client render (no hydration mismatch),
 * then loads the saved value. `hydrated` tells you when the saved value is in.
 */
export function useStoredState<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T | null = (v) => v as T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const parseRef = useRef(parse);
  parseRef.current = parse;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = parseRef.current(JSON.parse(raw));
        if (parsed !== null) setValue(parsed);
      }
    } catch {
      /* corrupted or blocked storage: fall back to the initial value */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (value === null || value === undefined) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [key, value, hydrated]);

  const set = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, set, hydrated];
}
