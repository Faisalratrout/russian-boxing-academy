import { NextResponse } from "next/server";
import { cronRateLimit, checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { jsonError, serverError } from "@/lib/api-response";
import { runExpiryCheck } from "@/lib/notifications";

// Vercel Cron-only route: no user session, no CORS. Gated solely by
// CRON_SECRET, which Vercel sends as `Authorization: Bearer <secret>`
// automatically once the env var is configured for the Cron Job.
export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(cronRateLimit, ip);
  if (!rateLimitResult.success) {
    const headers = new Headers();
    headers.set("Retry-After", String(rateLimitResult.retryAfterSeconds));
    return jsonError("Too many requests", 429, headers);
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await runExpiryCheck();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
