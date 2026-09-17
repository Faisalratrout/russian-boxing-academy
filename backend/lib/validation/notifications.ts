import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  status: z.enum(["EXPIRING_SOON", "EXPIRED"]).optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
