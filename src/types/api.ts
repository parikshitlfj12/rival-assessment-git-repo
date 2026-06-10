import type { AdminTaskDto, TaskDto } from "@/types/task";
import type { TaskActivityDto } from "@/types/activity";
import type { TaskAttachmentDto } from "@/types/attachment";
import type { UserDto } from "@/types/user";

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiError | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AuthUserResponse = { user: UserDto };

export type TasksListResponse = {
  items: TaskDto[];
  pagination: PaginationMeta;
};

export type AdminTasksListResponse = {
  items: AdminTaskDto[];
  pagination: PaginationMeta;
};

export type TaskActivityListResponse = {
  items: TaskActivityDto[];
};

export type TaskAttachmentListResponse = {
  items: TaskAttachmentDto[];
};
