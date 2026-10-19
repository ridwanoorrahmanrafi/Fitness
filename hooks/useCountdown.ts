"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSound, vibrate } from "@/lib/audio";

export type TimerState = "idle" | "running" | "paused" | "finished";

/**
 * Timestamp-based countdown: the remaining time is derived from an end time, so it cannot drift,
 * survives throttled background tabs, and has no side effects inside state updaters.
 */
export function useCountdown(soundOn: boolean) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [label, setLabel] = useState("");
  const [finished, setFinished] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const lastTick = useRef(-1);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  useEffect(() => {
    if (endAt === null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endAt]);

  const remainingMs = endAt !== null ? Math.max(0, endAt - now) : (pausedMs ?? 0);
  const seconds = Math.ceil(remainingMs / 1000);

  // Beeps for the last three seconds, once per second value.
  useEffect(() => {
    if (endAt === null || seconds <= 0 || seconds > 3) return;
    if (lastTick.current === seconds) return;
    lastTick.current = seconds;
    if (soundRef.current) playSound("tick");
  }, [endAt, seconds]);

  // Completion.
  useEffect(() => {
    if (endAt === null || remainingMs > 0) return;
    setEndAt(null);
    setPausedMs(null);
    setFinished(true);
    if (soundRef.current) playSound("rest-end");
    vibrate([200, 100, 200]);
  }, [endAt, remainingMs]);

  // Auto-hide the "go" state.
  useEffect(() => {
    if (!finished) return;
    const id = window.setTimeout(() => setFinished(false), 6000);
    return () => window.clearTimeout(id);
  }, [finished]);

  const start = useCallback((secs: number, text: string) => {
    lastTick.current = -1;
    setFinished(false);
    setPausedMs(null);
    setTotalSeconds(secs);
    setLabel(text);
    setNow(Date.now());
    setEndAt(Date.now() + secs * 1000);
  }, []);

  const pause = useCallback(() => {
    if (endAt === null) return;
    setPausedMs(Math.max(0, endAt - Date.now()));
    setEndAt(null);
  }, [endAt]);

  const resume = useCallback(() => {
    if (pausedMs === null) return;
    setNow(Date.now());
    setEndAt(Date.now() + pausedMs);
    setPausedMs(null);
  }, [pausedMs]);

  const adjust = useCallback(
    (deltaSeconds: number) => {
      if (endAt !== null) {
        setEndAt((e) => (e === null ? e : Math.max(Date.now() + 1000, e + deltaSeconds * 1000)));
        setTotalSeconds((t) => Math.max(1, t + deltaSeconds));
      } else if (pausedMs !== null) {
        setPausedMs((p) => Math.max(1000, (p ?? 0) + deltaSeconds * 1000));
        setTotalSeconds((t) => Math.max(1, t + deltaSeconds));
      }
    },
    [endAt, pausedMs],
  );

  const stop = useCallback(() => {
    setEndAt(null);
    setPausedMs(null);
    setFinished(false);
  }, []);

  const state: TimerState = endAt !== null ? "running" : pausedMs !== null ? "paused" : finished ? "finished" : "idle";
  const progress = totalSeconds > 0 && state !== "idle" ? Math.min(1, 1 - remainingMs / (totalSeconds * 1000)) : 0;

  return { state, seconds, label, progress, start, pause, resume, adjust, stop };
}
