import { corsPreflightHandler, withGetHandler, withPostHandler } from "@/lib/api-handler";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "@/lib/validation/transactions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createExpenseTransaction, LocationNotFoundError } from "@/lib/transactions";

export const GET = withGetHandler(
  { schema: listTransactionsQuerySchema },
  async (_request, { type, category, dateFrom, dateTo }) => {
    const where: Prisma.TransactionWhereInput = {
      ...(type && { type }),
      ...(category && { category }),
      ...((dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return { status: 200, body: { transactions } };
  }
);

export const POST = withPostHandler(
  { schema: createTransactionSchema, idempotent: true },
  async (_request, { category, amount, description, locationId }, { user }) => {
    try {
      const transaction = await createExpenseTransaction(
        category,
        amount,
        description,
        locationId,
        user!.userId
      );
      return { status: 201, body: { transaction } };
    } catch (error) {
      if (error instanceof LocationNotFoundError) {
        return { status: 404, body: { error: "Location not found" } };
      }
      throw error;
    }
  }
);

export const OPTIONS = corsPreflightHandler();
