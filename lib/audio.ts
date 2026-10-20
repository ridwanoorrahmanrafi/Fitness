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

export type Sound = "tick" | "set" | "rest-end" | "complete" | "system-alert" | "level-up" | "quest-complete" | "system-click" | "arise";

export function playSound(kind: Sound): void {
  switch (kind) {
    case "tick":
    case "system-click":
      tone(784, 0, 0.05, 0.15);
      break;
    case "set":
      tone(880, 0, 0.08, 0.2);
      tone(1320, 0.06, 0.1, 0.22);
      break;
    case "rest-end":
      tone(1046, 0, 0.25, 0.25);
      tone(1318, 0.2, 0.3, 0.25);
      break;
    case "complete":
    case "quest-complete":
      // Victorious System arpeggio
      tone(523, 0, 0.15, 0.25);      // C5
      tone(659, 0.12, 0.15, 0.25);    // E5
      tone(783, 0.24, 0.18, 0.28);    // G5
      tone(1046, 0.38, 0.4, 0.3);     // C6
      tone(1318, 0.52, 0.55, 0.32);   // E6
      break;
    case "system-alert":
      // Iconic high-tech dual ding [ SYSTEM NOTIFICATION ]
      tone(1760, 0, 0.09, 0.3);      // A6
      tone(2349, 0.1, 0.22, 0.32);   // D7
      break;
    case "level-up":
      // Euphoric Level Up ascending power chime
      tone(440, 0, 0.12, 0.25);
      tone(554, 0.1, 0.12, 0.25);
      tone(659, 0.2, 0.14, 0.28);
      tone(880, 0.32, 0.2, 0.3);
      tone(1108, 0.46, 0.25, 0.32);
      tone(1760, 0.62, 0.6, 0.35);
      break;
    case "arise":
      // Deep bass resonance surge + electric harmonics for ARISE (জাগ্রত হও)
      tone(110, 0, 0.8, 0.4);        // Deep A2
      tone(220, 0.15, 0.6, 0.35);    // A3
      tone(440, 0.3, 0.5, 0.3);      // A4
      tone(880, 0.45, 0.4, 0.25);    // A5
      tone(1760, 0.6, 0.6, 0.3);     // A6
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
