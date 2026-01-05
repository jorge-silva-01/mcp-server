import { z } from "zod";

export const AuthSchema = z
  .object({
    authToken: z.string().min(1).optional(),
    organizationToken: z.string().min(1).optional(),
    cookie: z.string().min(1).optional(),
    organizationId: z.string().min(1).optional(),
  })
  .strict()
  .optional();

export type AuthContext = z.infer<typeof AuthSchema>;
