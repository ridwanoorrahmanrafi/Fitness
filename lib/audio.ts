// One shared AudioContext. Browsers cap how many can exist and block them until a user gesture,
// so we create it lazily and resume it from click handlers via unlockAudio().

let ctx: AudioContext | null = null;

type AC = typeof AudioContext;

export function unlockAudio(): void {
  try {
    if (typeof window === "undefined") return;
    const Ctor: AC | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* audio is optional */
  }
}

function tone(freq: number, startOffset: number, duration: number, volume = 0.2): void {
  if (!ctx || ctx.state !== "running") return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export type Sound = "tick" | "set" | "rest-end" | "complete";

export function playSound(kind: Sound): void {
  switch (kind) {
    case "tick":
      tone(587, 0, 0.09);
      break;
    case "set":
      tone(800, 0, 0.1);
      break;
    case "rest-end":
      tone(1046, 0, 0.3);
      tone(1046, 0.4, 0.3);
      break;
    case "complete":
      tone(523, 0, 0.2);
      tone(659, 0.18, 0.2);
      tone(783, 0.36, 0.25);
      tone(1046, 0.54, 0.45, 0.28);
      break;
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
