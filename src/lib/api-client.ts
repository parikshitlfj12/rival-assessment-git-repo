import type { ApiEnvelope } from "@/lib/api-response";
import type { AdminTaskDto, TaskActivityDto, TaskAttachmentDto, TaskDto, UserDto } from "@/lib/dto";

export class ApiClientError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string>;

  constructor(code: string, message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiEnvelope<T>;

  if (json.error) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      response.status,
      json.error.fields,
    );
  }

  return json.data as T;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
}

export type AuthUserResponse = { user: UserDto };
export type TasksListResponse = {
  items: TaskDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminTasksListResponse = {
  items: AdminTaskDto[];
  pagination: TasksListResponse["pagination"];
};

export const authApi = {
  signup: (email: string, password: string) =>
    apiFetch<AuthUserResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthUserResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch<AuthUserResponse>("/api/auth/me"),
};

export const tasksApi = {
  list: (query: string) => apiFetch<TasksListResponse>(`/api/tasks?${query}`),
  get: (id: string) => apiFetch<TaskDto>(`/api/tasks/${id}`),
  create: (body: Record<string, unknown>) =>
    apiFetch<TaskDto>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    apiFetch<TaskDto>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  list: (query: string) => apiFetch<AdminTasksListResponse>(`/api/admin/tasks?${query}`),
};

export type TaskActivityListResponse = {
  items: TaskActivityDto[];
};

export const activityApi = {
  list: (taskId: string) =>
    apiFetch<TaskActivityListResponse>(`/api/tasks/${taskId}/activity`),
};

export type TaskAttachmentListResponse = {
  items: TaskAttachmentDto[];
};

async function parseUploadResponse(response: Response): Promise<TaskAttachmentDto> {
  const json = (await response.json()) as ApiEnvelope<TaskAttachmentDto>;
  if (json.error) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      response.status,
      json.error.fields,
    );
  }
  return json.data as TaskAttachmentDto;
}

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
    return parseUploadResponse(response);
  },
  delete: (taskId: string, attachmentId: string) =>
    apiFetch<void>(`/api/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" }),
  downloadUrl: (taskId: string, attachmentId: string) =>
    `/api/tasks/${taskId}/attachments/${attachmentId}`,
};

const FIELD_LABELS: Record<string, string> = {
  title: "title",
  description: "description",
  status: "status",
  priority: "priority",
  dueDate: "due date",
};

export function formatActivityMessage(entry: TaskActivityDto): string {
  if (entry.action === "created") return "Task created";
  if (entry.action === "deleted") return "Task deleted";
  if (!entry.changes?.length) return "Task updated";

  const fields = entry.changes.map((change) => FIELD_LABELS[change.field] ?? change.field);
  if (fields.length === 1) return `Updated ${fields[0]}`;
  return `Updated ${fields.slice(0, -1).join(", ")} and ${fields.at(-1)}`;
};

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}
