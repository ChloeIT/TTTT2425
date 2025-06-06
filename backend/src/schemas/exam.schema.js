const { z } = require("zod");

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

const approveExamSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const rejectExamSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const openExamSchema = z.object({
  password: z.string().min(1, "Password is required to open exam"),
});

module.exports = {
  createExamSchema,
  approveExamSchema,
  rejectExamSchema,
  openExamSchema,
};
