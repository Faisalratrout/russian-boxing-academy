import { NextResponse } from "next/server";
import { ZodError, ZodType } from "zod";
import { getCorsHeaders, isAllowedOrigin } from "./cors";
import { requireAuth } from "./auth-middleware";
import { SessionPayload } from "./session";
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

interface HandlerContext {
  user: SessionPayload | null;
}

type Handler<T> = (
  request: Request,
  data: T,
  context: HandlerContext
) => Promise<{ status: number; body: unknown; headers?: HeadersInit }>;

type ParamsHandler<T> = (
  request: Request,
  data: T,
  params: Record<string, string>,
  context: HandlerContext
) => Promise<{ status: number; body: unknown; headers?: HeadersInit }>;

async function runCommonChecks(
  request: Request,
  corsHeaders: Headers,
  options: { isPublic?: boolean; useAuthRateLimit?: boolean }
): Promise<{ response: NextResponse } | { response: null; user: SessionPayload | null }> {
  if (!isAllowedOrigin(request)) {
    return { response: jsonError("Origin not allowed", 403, corsHeaders) };
  }

  const limiter = options.useAuthRateLimit ? authRateLimit : generalRateLimit;
  const ip = getClientIp(request);
  const rateLimitResult = await checkRateLimit(limiter, ip);
  if (!rateLimitResult.success) {
    const headers = new Headers(corsHeaders);
    headers.set("Retry-After", String(rateLimitResult.retryAfterSeconds));
    return { response: jsonError("Too many requests", 429, headers) };
  }

  if (options.isPublic) {
    return { response: null, user: null };
  }

  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return { response: jsonError("Unauthorized", 401, corsHeaders) };
  }

  return { response: null, user: auth.user };
}

export function withGetHandler<T>(
  options: RouteOptions<T>,
  handler: Handler<T>
) {
  return async function GET(request: Request): Promise<NextResponse> {
    const corsHeaders = getCorsHeaders(request);

    const checks = await runCommonChecks(request, corsHeaders, options);
    if (checks.response) return checks.response;

    try {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      const data = options.schema.parse(query);

      const result = await handler(request, data, { user: checks.user });
      return NextResponse.json(result.body, {
        status: result.status,
        headers: mergeHeaders(corsHeaders, result.headers),
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

    const checks = await runCommonChecks(request, corsHeaders, options);
    if (checks.response) return checks.response;

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

      const result = await handler(request, data, { user: checks.user });

      if (options.idempotent && idempotencyKey) {
        await storeIdempotentResponse(idempotencyKey, {
          status: result.status,
          body: result.body,
        });
      }

      return NextResponse.json(result.body, {
        status: result.status,
        headers: mergeHeaders(corsHeaders, result.headers),
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

export function withPatchHandler<T>(
  options: RouteOptions<T>,
  handler: ParamsHandler<T>
) {
  return async function PATCH(
    request: Request,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    const corsHeaders = getCorsHeaders(request);

    const checks = await runCommonChecks(request, corsHeaders, options);
    if (checks.response) return checks.response;

    try {
      const params = await context.params;
      const rawBody = await request.json().catch(() => null);
      const data = options.schema.parse(rawBody);

      const result = await handler(request, data, params, { user: checks.user });

      return NextResponse.json(result.body, {
        status: result.status,
        headers: mergeHeaders(corsHeaders, result.headers),
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

function mergeHeaders(base: Headers, extra?: HeadersInit): Headers {
  if (!extra) return base;
  const merged = new Headers(base);
  new Headers(extra).forEach((value, key) => merged.set(key, value));
  return merged;
}
