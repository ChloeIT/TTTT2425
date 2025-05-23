const { z } = require("zod");
const { Role } = require("../generated/prisma");

const userSchema = {
  registerSchema: z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string(),
    department: z.string(),
    role: z.nativeEnum(Role),
  }),

  loginSchema: z.object({
    username: z.string(),
    password: z.string().min(6),
  }),
};
module.exports = userSchema;
