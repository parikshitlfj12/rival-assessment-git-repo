import { apiFetch } from "@/lib/api/client";
import type { TaskActivityListResponse } from "@/types/api";

export const activityApi = {
  list: (taskId: string) =>
    apiFetch<TaskActivityListResponse>(`/api/tasks/${taskId}/activity`),
};
