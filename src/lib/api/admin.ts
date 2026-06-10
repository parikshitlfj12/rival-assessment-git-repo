import { apiFetch } from "@/lib/api/client";
import type { AdminTasksListResponse } from "@/types/api";

export const adminApi = {
  list: (query: string) => apiFetch<AdminTasksListResponse>(`/api/admin/tasks?${query}`),
};
