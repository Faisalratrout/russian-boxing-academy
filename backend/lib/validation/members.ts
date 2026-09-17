import { z } from "zod";

export const listMembersQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  search: z.string().min(1).optional(),
});

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "firstName is required"),
  lastName: z.string().min(1, "lastName is required"),
  birthDate: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: "birthDate must be a valid date",
  }),
  locationId: z.string().min(1, "locationId is required"),
});

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
