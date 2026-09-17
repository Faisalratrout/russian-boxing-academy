import { corsPreflightHandler, withPostHandler } from "@/lib/api-handler";
import { loginSchema } from "@/lib/validation/auth";

// TODO: POST — authenticate a User (ADMIN/COACH) by name + passwordHash,
// issue a session (mechanism TBD — no online payment/3rd-party auth needed,
// this is internal staff login only)
export const POST = withPostHandler(
  { schema: loginSchema, isPublic: true, useAuthRateLimit: true },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

export const OPTIONS = corsPreflightHandler();
