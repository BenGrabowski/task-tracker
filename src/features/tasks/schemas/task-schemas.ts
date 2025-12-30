import { z } from "zod";

// UUID validation regex
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Task status enum
export const taskStatusEnum = z.enum(["todo", "in_progress", "done"]);

// Task priority enum
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

// Base task schema for creation
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  priority: taskPriorityEnum.default("medium"),
  dueDate: z.coerce.date().optional().nullable(),
  // User IDs are text (not UUID) in Better Auth
  assigneeId: z.string().min(1, "Invalid assignee ID").optional().nullable(),
  categoryId: z.string().regex(uuidRegex, "Invalid category ID").optional().nullable(),
  blockedByTaskId: z
    .string()
    .regex(uuidRegex, "Invalid blocking task ID")
    .optional()
    .nullable(),
});

// Task update schema - all fields optional except status which can be updated
export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusEnum.optional(),
});

// Task filter schema for search and filtering
export const taskFilterSchema = z.object({
  status: taskStatusEnum.optional(),
  assigneeId: z.string().regex(uuidRegex, "Invalid assignee ID").optional(),
  categoryId: z.string().regex(uuidRegex, "Invalid category ID").optional(),
  search: z.string().max(200, "Search query too long").optional(),
  dueDate: z.date().optional(),
  priority: taskPriorityEnum.optional(),
});

// Schema for task completion
export const completeTaskSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid task ID"),
});

// Schema for task dependency creation
export const createDependencySchema = z
  .object({
    taskId: z.string().regex(uuidRegex, "Invalid task ID"),
    blockedByTaskId: z.string().regex(uuidRegex, "Invalid blocking task ID"),
  })
  .refine((data) => data.taskId !== data.blockedByTaskId, {
    message: "A task cannot block itself",
    path: ["blockedByTaskId"],
  });

// Schema for task deletion
export const deleteTaskSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid task ID"),
});

// Type exports for use in components and actions
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type CreateDependencyInput = z.infer<typeof createDependencySchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type TaskPriority = z.infer<typeof taskPriorityEnum>;
