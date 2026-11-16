import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison that also hides length differences. */
export function codesMatch(provided: string | null, expected: string): boolean {
  const a = createHash("sha256").update(provided ?? "").digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Best-effort sliding-window rate limiter with remaining quota calculation.
 */
export function rateLimitCheck(
  key: string,
  max = 15,
  windowMs = 10 * 60 * 1000,
  now = Date.now()
): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    const earliest = recent[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, windowMs - (now - earliest)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 1000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - recent.length),
    resetMs: windowMs,
  };
}

/**
 * Backwards compatible rate-limited boolean check.
 */
export function rateLimited(
  key: string,
  max = 15,
  windowMs = 10 * 60 * 1000,
  now = Date.now()
): boolean {
  return !rateLimitCheck(key, max, windowMs, now).allowed;
}

/**
 * Extracts client IP or identity key safely from request headers.
 */
export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? headers.get("x-real-ip") ?? "local").trim().slice(0, 64);
}

/**
 * Wraps an asynchronous operation with an enforceable timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 25000,
  errorMessage = "Request timed out. Please try again."
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
