import { Redis } from "@upstash/redis";

// Shared Upstash Redis client. Required for rate limiting and idempotency
// because Vercel serverless functions have no persistent process to hold
// in-memory state across invocations.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
