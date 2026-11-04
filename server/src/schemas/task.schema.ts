import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dueDate: z
    .string()
    .datetime({ message: "Invalid ISO datetime string" })
    .nullable()
    .optional(),
  completed: z.boolean().optional().default(false),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueDate: z
      .string()
      .datetime({ message: "Invalid ISO datetime string" })
      .nullable()
      .optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  );

export const taskQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).optional().default("all"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  search: z.string().trim().max(100, "Search query cannot exceed 100 characters").optional(),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid("Invalid task ID format"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
