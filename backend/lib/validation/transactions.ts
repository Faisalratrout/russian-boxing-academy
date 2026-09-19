import { z } from "zod";

export const listTransactionsQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z
    .enum(["SUBSCRIPTION", "EQUIPMENT", "REPAIR", "GLOVES", "WRAPS", "OTHER"])
    .optional(),
  dateFrom: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "dateFrom must be a valid date" })
    .optional(),
  dateTo: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: "dateTo must be a valid date" })
    .optional(),
});

// Manual logging only covers expenses — SUBSCRIPTION/INCOME transactions
// are auto-logged by POST /api/subscriptions, never entered directly.
export const createTransactionSchema = z.object({
  type: z.literal("EXPENSE"),
  category: z.enum(["EQUIPMENT", "REPAIR", "GLOVES", "WRAPS", "OTHER"]),
  amount: z.number().positive("amount must be positive"),
  description: z.string().optional(),
  locationId: z.string().min(1, "locationId is required"),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
