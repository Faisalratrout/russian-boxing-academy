import { z } from "zod";
import { corsPreflightHandler, withPostHandler } from "@/lib/api-handler";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export const POST = withPostHandler(
  { schema: z.unknown().transform(() => ({})) },
  async () => {
    const cookieParts = [
      `${SESSION_COOKIE_NAME}=`,
      "Path=/",
      "Max-Age=0",
      "HttpOnly",
      "Secure",
      "SameSite=Strict",
    ];

    return {
      status: 200,
      body: { message: "Logged out" },
      headers: { "Set-Cookie": cookieParts.join("; ") },
    };
  }
);

export const OPTIONS = corsPreflightHandler();
