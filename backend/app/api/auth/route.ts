import { corsPreflightHandler, withPostHandler } from "@/lib/api-handler";
import { loginSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/session";

export const POST = withPostHandler(
  { schema: loginSchema, isPublic: true, useAuthRateLimit: true },
  async (_request, { name, password }) => {
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { status: 401, body: { error: "Invalid credentials" } };
    }

    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      role: user.role,
    });

    const cookieParts = [
      `${SESSION_COOKIE_NAME}=${token}`,
      `Path=${sessionCookieOptions.path}`,
      `Max-Age=${sessionCookieOptions.maxAge}`,
      "HttpOnly",
      "Secure",
      "SameSite=Strict",
    ];

    return {
      status: 200,
      body: { id: user.id, name: user.name, role: user.role },
      headers: { "Set-Cookie": cookieParts.join("; ") },
    };
  }
);

export const OPTIONS = corsPreflightHandler();
