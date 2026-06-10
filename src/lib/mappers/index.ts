import type { Task, TaskActivity, TaskAttachment, User } from "@prisma/client";
import type { ActivityChangeDto, TaskActivityDto } from "@/types/activity";
import type { TaskAttachmentDto } from "@/types/attachment";
import type { AdminTaskDto, TaskDto } from "@/types/task";
import type { UserDto } from "@/types/user";

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

export function toTaskAttachmentDto(attachment: TaskAttachment): TaskAttachmentDto {
  return {
    id: attachment.id,
    taskId: attachment.taskId,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    createdAt: attachment.createdAt.toISOString(),
  };
}
