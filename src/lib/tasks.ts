import { Prisma, TaskActivityAction, TaskPriority } from "@prisma/client";
import { buildTaskChanges, recordTaskActivity } from "@/lib/activity";
import { prisma } from "@/lib/db";
import { toAdminTaskDto, toTaskDto, type AdminTaskDto, type TaskDto } from "@/lib/dto";
import type { AdminListTasksQuery, CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "@/lib/validators/tasks";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

export type PaginatedTasks = {
  items: TaskDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PaginatedAdminTasks = {
  items: AdminTaskDto[];
  pagination: PaginatedTasks["pagination"];
};

function buildWhere(
  userId: string | undefined,
  query: Pick<ListTasksQuery, "status" | "search">,
): Prisma.TaskWhereInput {
  return {
    ...(userId ? { userId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? { title: { contains: query.search, mode: "insensitive" as const } }
      : {}),
  };
}

function getOrderBy(query: ListTasksQuery): Prisma.TaskOrderByWithRelationInput | undefined {
  if (query.sort === "created_at") {
    return { createdAt: query.order };
  }
  if (query.sort === "due_date") {
    return {
      dueDate: {
        sort: query.order,
        nulls: query.order === "asc" ? "last" : "first",
      },
    };
  }
  return undefined;
}

async function listTasksWithPrioritySort(
  userId: string,
  query: ListTasksQuery,
): Promise<PaginatedTasks> {
  const where = buildWhere(userId, query);
  const skip = (query.page - 1) * query.limit;

  const [allItems, total] = await prisma.$transaction([
    prisma.task.findMany({ where }),
    prisma.task.count({ where }),
  ]);

  const sorted = [...allItems].sort((a, b) => {
    const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (diff !== 0) {
      return query.order === "desc" ? diff : -diff;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const items = sorted.slice(skip, skip + query.limit);

  return {
    items: items.map(toTaskDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function listTasks(userId: string, query: ListTasksQuery): Promise<PaginatedTasks> {
  const where = buildWhere(userId, query);
  const skip = (query.page - 1) * query.limit;

  if (query.sort === "priority") {
    return listTasksWithPrioritySort(userId, query);
  }

  const orderBy = getOrderBy(query) ?? { createdAt: query.order };

  const [items, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    items: items.map(toTaskDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getTaskById(userId: string, taskId: string): Promise<TaskDto | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });
  return task ? toTaskDto(task) : null;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<TaskDto> {
  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });

    await recordTaskActivity(created.id, userId, TaskActivityAction.created, undefined, tx);
    return created;
  });

  return toTaskDto(task);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<TaskDto | null> {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return null;

  const changes = buildTaskChanges(existing, input);
  if (changes.length === 0) {
    return toTaskDto(existing);
  }

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueDate !== undefined
          ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
          : {}),
      },
    });

    await recordTaskActivity(taskId, userId, TaskActivityAction.updated, changes, tx);
    return updated;
  });

  return toTaskDto(task);
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!existing) return false;
  await prisma.task.delete({ where: { id: taskId } });
  return true;
}

async function listAdminTasksWithPrioritySort(
  query: AdminListTasksQuery,
): Promise<PaginatedAdminTasks> {
  const where = buildWhere(query.userId, query);
  const skip = (query.page - 1) * query.limit;

  const [allItems, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: { user: { select: { email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  const sorted = [...allItems].sort((a, b) => {
    const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (diff !== 0) {
      return query.order === "desc" ? diff : -diff;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const items = sorted.slice(skip, skip + query.limit);

  return {
    items: items.map((task) => toAdminTaskDto(task, task.user.email)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function listAllTasksAdmin(query: AdminListTasksQuery): Promise<PaginatedAdminTasks> {
  const where = buildWhere(query.userId, query);
  const skip = (query.page - 1) * query.limit;

  if (query.sort === "priority") {
    return listAdminTasksWithPrioritySort(query);
  }

  const orderBy = getOrderBy(query) ?? { createdAt: query.order };

  const [items, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: { user: { select: { email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    items: items.map((task) => toAdminTaskDto(task, task.user.email)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export { PRIORITY_ORDER };
