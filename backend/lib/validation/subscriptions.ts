import { z } from "zod";

export const listSubscriptionsQuerySchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRING_SOON", "EXPIRED"]).optional(),
  memberId: z.string().min(1).optional(),
});

export const createSubscriptionSchema = z.object({
  memberId: z.string().min(1, "memberId is required"),
  planType: z.enum(["ONE_MONTH", "TWO_MONTH"]),
});

export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
