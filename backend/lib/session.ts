import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  name: string;
  role: UserRole;
}

// Stateless JWT: no server-side revocation. Rotating SESSION_SECRET is the
// only way to invalidate all sessions at once. Fine at current team size;
// revisit with a session table if per-user logout-everywhere is needed.
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      name: payload.name,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
