import { z } from "zod";

export const loginSchema = z.object({
  name: z.string().min(1, "name is required"),
  password: z.string().min(1, "password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
