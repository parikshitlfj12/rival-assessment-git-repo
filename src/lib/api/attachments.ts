import { apiFetch, parseUploadResponse } from "@/lib/api/client";
import type { TaskAttachmentDto, TaskAttachmentListResponse } from "@/types";

export const attachmentsApi = {
  list: (taskId: string) =>
    apiFetch<TaskAttachmentListResponse>(`/api/tasks/${taskId}/attachments`),
  upload: async (taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`/api/tasks/${taskId}/attachments`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    return parseUploadResponse<TaskAttachmentDto>(response);
  },
  delete: (taskId: string, attachmentId: string) =>
    apiFetch<void>(`/api/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" }),
  downloadUrl: (taskId: string, attachmentId: string) =>
    `/api/tasks/${taskId}/attachments/${attachmentId}`,
};
