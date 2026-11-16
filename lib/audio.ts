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

export type Sound =
  | "tick"
  | "set"
  | "rest-end"
  | "complete"
  | "click"
  | "warning"
  // Legacy aliases for backward compatibility
  | "system-click"
  | "system-alert"
  | "level-up"
  | "quest-complete"
  | "arise";

export function playSound(kind: Sound): void {
  switch (kind) {
    case "tick":
      tone(784, 0, 0.05, 0.12);
      break;
    case "click":
    case "system-click":
      tone(600, 0, 0.04, 0.1);
      break;
    case "set":
      // Crisp 2-tone workout set completion confirmation
      tone(880, 0, 0.06, 0.18);
      tone(1320, 0.05, 0.08, 0.2);
      break;
    case "rest-end":
    case "warning":
    case "system-alert":
      // Double gym buzzer alerting rest period has expired
      tone(1046, 0, 0.18, 0.22);
      tone(1318, 0.15, 0.22, 0.24);
      break;
    case "complete":
    case "quest-complete":
    case "level-up":
    case "arise":
      // Clean, rewarding session finished arpeggio
      tone(523, 0, 0.12, 0.2);      // C5
      tone(659, 0.1, 0.12, 0.22);   // E5
      tone(783, 0.2, 0.15, 0.24);   // G5
      tone(1046, 0.32, 0.35, 0.25); // C6
      break;
  }
}

export function playAudioTone(frequency = 880, duration = 0.14): void {
  try {
    unlockAudio();
    tone(frequency, 0, duration, 0.18);
  } catch {
    /* ignore */
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
