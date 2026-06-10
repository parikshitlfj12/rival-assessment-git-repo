import type { ApiEnvelope } from "@/types/api";

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

async function parseUploadResponse<T>(response: Response): Promise<T> {
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

export { parseUploadResponse };
