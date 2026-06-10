import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskStatusEnum = z.nativeEnum(TaskStatus);
export const taskPriorityEnum = z.nativeEnum(TaskPriority);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
  description: z.string().max(5000, "Description must be at most 5000 characters").optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z
    .union([z.string().datetime({ offset: true }), z.string().datetime(), z.null()])
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["due_date", "priority", "created_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const adminListTasksQuerySchema = listTasksQuerySchema.extend({
  userId: z.string().uuid().optional(),
});

export type AdminListTasksQuery = z.infer<typeof adminListTasksQuerySchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
  description: z.string().max(5000, "Description must be at most 5000 characters").optional(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  dueDate: z.string().optional(),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
