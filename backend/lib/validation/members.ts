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

export const updateMemberSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    birthDate: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), { message: "birthDate must be a valid date" })
      .optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
