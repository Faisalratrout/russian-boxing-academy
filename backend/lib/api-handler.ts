import { NextResponse } from "next/server";
import { ZodError, ZodType } from "zod";
import { getCorsHeaders, isAllowedOrigin } from "./cors";
import { requireAuth } from "./auth-middleware";
import {
  authRateLimit,
  checkRateLimit,
  generalRateLimit,
  getClientIp,
} from "./rate-limit";
import { getIdempotentResponse, storeIdempotentResponse } from "./idempotency";
import { jsonError, serverError } from "./api-response";

interface RouteOptions<T> {
  schema: ZodType<T>;
  /** Skips auth verification — only the login route should set this. */
  isPublic?: boolean;
  /** Uses the stricter auth rate limit instead of the general one. */
  useAuthRateLimit?: boolean;
  /** Wraps the handler with Idempotency-Key support (mutating POSTs only). */
  idempotent?: boolean;
}

type Handler<T> = (
  request: Request,
  data: T
) => Promise<{ status: number; body: unknown }>;

/** Shared preamble: CORS origin check, rate limiting, auth. Returns an
 * early NextResponse if the request should be rejected, otherwise null. */
async function runCommonChecks(
  request: Request,
  corsHeaders: Headers,
  options: { isPublic?: boolean; useAuthRateLimit?: boolean }
): Promise<NextResponse | null> {
  if (!isAllowedOrigin(request)) {
    return jsonError("Origin not allowed", 403, corsHeaders);
  }

  const limiter = options.useAuthRateLimit ? authRateLimit : generalRateLimit;
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(limiter, ip);
  if (!rateLimitResult.success) {
    const headers = new Headers(corsHeaders);
    headers.set("Retry-After", String(rateLimitResult.retryAfterSeconds));
    return jsonError("Too many requests", 429, headers);
  }

  if (!options.isPublic) {
    const auth = requireAuth(request);
    if (!auth.authenticated) {
      return jsonError("Unauthorized", 401, corsHeaders);
    }
  }

  return null;
}

export function withGetHandler<T>(
  options: RouteOptions<T>,
  handler: Handler<T>
) {
  return async function GET(request: Request): Promise<NextResponse> {
    const corsHeaders = getCorsHeaders(request);

    const early = await runCommonChecks(request, corsHeaders, options);
    if (early) return early;

    try {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      const data = options.schema.parse(query);

      const result = await handler(request, data);
      return NextResponse.json(result.body, {
        status: result.status,
        headers: corsHeaders,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonError(
          `Invalid query parameters: ${error.issues.map((i) => i.message).join(", ")}`,
          400,
          corsHeaders
        );
      }
      return serverError(error, corsHeaders);
    }
  };
}

export function withPostHandler<T>(
  options: RouteOptions<T>,
  handler: Handler<T>
) {
  return async function POST(request: Request): Promise<NextResponse> {
    const corsHeaders = getCorsHeaders(request);

    const early = await runCommonChecks(request, corsHeaders, options);
    if (early) return early;

    let idempotencyKey: string | null = null;

    try {
      if (options.idempotent) {
        const { key, stored } = await getIdempotentResponse(request);
        idempotencyKey = key;
        if (stored) {
          return NextResponse.json(stored.body, {
            status: stored.status,
            headers: corsHeaders,
          });
        }
      }

      const rawBody = await request.json().catch(() => null);
      const data = options.schema.parse(rawBody);

      const result = await handler(request, data);

      if (options.idempotent && idempotencyKey) {
        await storeIdempotentResponse(idempotencyKey, {
          status: result.status,
          body: result.body,
        });
      }

      return NextResponse.json(result.body, {
        status: result.status,
        headers: corsHeaders,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return jsonError(
          `Invalid request body: ${error.issues.map((i) => i.message).join(", ")}`,
          400,
          corsHeaders
        );
      }
      return serverError(error, corsHeaders);
    }
  };
}

export function corsPreflightHandler() {
  return async function OPTIONS(request: Request): Promise<NextResponse> {
    const corsHeaders = getCorsHeaders(request);
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  };
}
