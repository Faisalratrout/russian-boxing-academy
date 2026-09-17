// TODO: replace with real session/token verification once POST /api/auth
// issues sessions. For now this only checks that a bearer token is present
// and well-formed — it does not yet verify it against a real session store.
export function verifyAuthToken(token: string): boolean {
  return token.length > 0;
}

export function requireAuth(
  request: Request
): { authenticated: true } | { authenticated: false } {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return { authenticated: false };
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token || !verifyAuthToken(token)) {
    return { authenticated: false };
  }

  return { authenticated: true };
}
