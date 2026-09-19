import { prisma } from "./prisma";
import { TransactionCategory } from "@prisma/client";

export class LocationNotFoundError extends Error {}

export async function createExpenseTransaction(
  category: TransactionCategory,
  amount: number,
  description: string | undefined,
  locationId: string,
  createdById: string
) {
  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location) throw new LocationNotFoundError();

  return prisma.transaction.create({
    data: {
      locationId,
      type: "EXPENSE",
      category,
      amount,
      description,
      createdById,
    },
  });
}
