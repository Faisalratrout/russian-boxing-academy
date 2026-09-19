import { SESSION_COOKIE_NAME, SessionPayload, verifySessionToken } from "./session";

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function getSessionUser(request: Request): Promise<SessionPayload | null> {
  const token = getCookie(request, SESSION_COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(
  request: Request
): Promise<{ authenticated: true; user: SessionPayload } | { authenticated: false }> {
  const user = await getSessionUser(request);
  if (!user) return { authenticated: false };
  return { authenticated: true, user };
}
