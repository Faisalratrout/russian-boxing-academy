import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import {
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
} from "@/lib/validation/subscriptions";

// TODO: GET — list subscriptions (support filtering by status/member)
export const GET = withGetHandler(
  { schema: listSubscriptionsQuerySchema },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

// TODO: POST — create a subscription (memberId, planType) and auto-log the
// matching INCOME/SUBSCRIPTION transaction
export const POST = withPostHandler(
  { schema: createSubscriptionSchema, idempotent: true },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

export const OPTIONS = corsPreflightHandler();
