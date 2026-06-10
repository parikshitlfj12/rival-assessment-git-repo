import type { Task, TaskActivity, User, UserRole } from "@prisma/client";

export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type TaskDto = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaskDto = TaskDto & {
  ownerEmail: string;
};

export type ActivityChangeDto = {
  field: "title" | "description" | "status" | "priority" | "dueDate";
  from: string | null;
  to: string | null;
};

export type TaskActivityDto = {
  id: string;
  taskId: string;
  userId: string;
  actorEmail: string;
  action: "created" | "updated" | "deleted";
  changes: ActivityChangeDto[] | null;
  createdAt: string;
};

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function toAdminTaskDto(task: Task, ownerEmail: string): AdminTaskDto {
  return {
    ...toTaskDto(task),
    ownerEmail,
  };
}

function parseActivityChanges(value: TaskActivity["changes"]): ActivityChangeDto[] | null {
  if (!value || !Array.isArray(value)) return null;
  return value as ActivityChangeDto[];
}

export function toTaskActivityDto(activity: TaskActivity, actorEmail: string): TaskActivityDto {
  return {
    id: activity.id,
    taskId: activity.taskId,
    userId: activity.userId,
    actorEmail,
    action: activity.action,
    changes: parseActivityChanges(activity.changes),
    createdAt: activity.createdAt.toISOString(),
  };
}
