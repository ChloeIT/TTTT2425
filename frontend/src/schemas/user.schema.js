import { z } from "zod";
export const userSchema = {
  userRegistrationSchema: z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  }),

  userLoginSchema: z.object({
    username: z.string(),
    password: z.string().min(8),
  }),
};
