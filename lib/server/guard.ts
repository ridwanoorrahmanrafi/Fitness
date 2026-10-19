import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison that also hides length differences. */
export function codesMatch(provided: string | null, expected: string): boolean {
  const a = createHash("sha256").update(provided ?? "").digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

const hits = new Map<string, number[]>();

/**
 * Best-effort sliding-window limiter. On serverless hosts the map resets with each cold start,
 * so treat it as a speed bump, not a guarantee. The ACCESS_CODE is the real protection.
 */
export function rateLimited(key: string, max = 15, windowMs = 10 * 60 * 1000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return false;
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? headers.get("x-real-ip") ?? "local").trim().slice(0, 64);
}
