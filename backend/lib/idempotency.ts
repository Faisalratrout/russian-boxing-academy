import { redis } from "./redis";

const IDEMPOTENCY_TTL_SECONDS = 5 * 60;

interface StoredResponse {
  status: number;
  body: unknown;
}

/**
 * Looks up a prior response stored under this Idempotency-Key.
 * Returns null if there is no key, or no stored response yet.
 */
export async function getIdempotentResponse(
  request: Request
): Promise<{ key: string | null; stored: StoredResponse | null }> {
  const key = request.headers.get("Idempotency-Key");
  if (!key) return { key: null, stored: null };

  const stored = await redis.get<StoredResponse>(idempotencyRedisKey(key));
  return { key, stored: stored ?? null };
}

export async function storeIdempotentResponse(
  key: string,
  response: StoredResponse
): Promise<void> {
  await redis.set(idempotencyRedisKey(key), response, {
    ex: IDEMPOTENCY_TTL_SECONDS,
  });
}

function idempotencyRedisKey(key: string): string {
  return `idempotency:${key}`;
}
