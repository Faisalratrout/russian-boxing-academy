const FRONTEND_URL = process.env.FRONTEND_URL;

export function getCorsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");

  if (origin && FRONTEND_URL && origin === FRONTEND_URL) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Idempotency-Key"
    );
  }

  return headers;
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // No Origin header (e.g. server-to-server, curl) is allowed through;
  // browser requests always send Origin and are checked below.
  if (!origin) return true;
  return origin === FRONTEND_URL;
}
