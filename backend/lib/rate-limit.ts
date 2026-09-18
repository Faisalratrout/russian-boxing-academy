import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// General API routes: 20 requests/minute per IP.
export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "ratelimit:general",
});

// Auth/login route: stricter, 5 requests/minute per IP, to resist brute-force.
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "ratelimit:auth",
});

// Cron-triggered expiry check: not user-facing, but capped in case
// CRON_SECRET ever leaks.
export const cronRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:cron",
});

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: true } | { success: false; retryAfterSeconds: number }> {
  const result = await limiter.limit(identifier);
  if (result.success) return { success: true };

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000)
  );
  return { success: false, retryAfterSeconds };
}
