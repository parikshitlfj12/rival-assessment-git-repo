import { Prisma, Task, TaskActivityAction } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toTaskActivityDto, type ActivityChangeDto, type TaskActivityDto } from "@/lib/dto";
import type { UpdateTaskInput } from "@/lib/validators/tasks";

function formatFieldValue(field: string, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (field === "dueDate" && value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") return value;
  return String(value);
}

export function buildTaskChanges(
  existing: Task,
  input: UpdateTaskInput,
): ActivityChangeDto[] {
  const changes: ActivityChangeDto[] = [];

  const checks: Array<{
    field: ActivityChangeDto["field"];
    next: unknown;
    current: unknown;
  }> = [
    { field: "title", next: input.title, current: existing.title },
    { field: "description", next: input.description, current: existing.description },
    { field: "status", next: input.status, current: existing.status },
    { field: "priority", next: input.priority, current: existing.priority },
    {
      field: "dueDate",
      next:
        input.dueDate === undefined
          ? undefined
          : input.dueDate
            ? new Date(input.dueDate)
            : null,
      current: existing.dueDate,
    },
  ];

  for (const check of checks) {
    if (check.next === undefined) continue;

    const from = formatFieldValue(check.field, check.current);
    const to = formatFieldValue(check.field, check.next);

    if (from === to) continue;

    changes.push({ field: check.field, from, to });
  }

  return changes;
}

export async function recordTaskActivity(
  taskId: string,
  userId: string,
  action: TaskActivityAction,
  changes?: ActivityChangeDto[],
  tx: Prisma.TransactionClient = prisma,
): Promise<void> {
  await tx.taskActivity.create({
    data: {
      taskId,
      userId,
      action,
      changes: changes?.length ? changes : Prisma.JsonNull,
    },
  });
}

export async function listTaskActivity(
  userId: string,
  taskId: string,
): Promise<TaskActivityDto[] | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });

  if (!task) return null;

  const activities = await prisma.taskActivity.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
    },
  });

  return activities.map((activity) => toTaskActivityDto(activity, activity.user.email));
}
