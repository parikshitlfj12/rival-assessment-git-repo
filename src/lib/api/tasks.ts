import { apiFetch } from "@/lib/api/client";
import type { TaskDto, TasksListResponse } from "@/types";

export const tasksApi = {
  list: (query: string) => apiFetch<TasksListResponse>(`/api/tasks?${query}`),
  get: (id: string) => apiFetch<TaskDto>(`/api/tasks/${id}`),
  create: (body: Record<string, unknown>) =>
    apiFetch<TaskDto>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    apiFetch<TaskDto>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
