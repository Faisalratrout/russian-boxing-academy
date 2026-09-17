import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "@/lib/validation/transactions";

// TODO: GET — list transactions (support filtering by type/category/date range)
export const GET = withGetHandler(
  { schema: listTransactionsQuerySchema },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

// TODO: POST — manually log an EXPENSE transaction (EQUIPMENT, REPAIR, GLOVES, WRAPS, OTHER)
export const POST = withPostHandler(
  { schema: createTransactionSchema, idempotent: true },
  async () => {
    return { status: 501, body: { message: "Not implemented" } };
  }
);

export const OPTIONS = corsPreflightHandler();
