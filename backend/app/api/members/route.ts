import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import { createMemberSchema, listMembersQuerySchema } from "@/lib/validation/members";

// TODO: GET — list members (support filtering by status, search by name)
export const GET = withGetHandler(
  { schema: listMembersQuerySchema },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

// TODO: POST — create a member (firstName, lastName, birthDate, locationId)
export const POST = withPostHandler(
  { schema: createMemberSchema, idempotent: true },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

export const OPTIONS = corsPreflightHandler();
