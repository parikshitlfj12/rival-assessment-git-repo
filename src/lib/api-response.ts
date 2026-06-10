import { NextResponse } from "next/server";
import type { ApiEnvelope, ApiError } from "@/types/api";

export type { ApiEnvelope, ApiError };

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null } satisfies ApiEnvelope<T>, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { data: null, error: { code, message, ...(fields ? { fields } : {}) } } satisfies ApiEnvelope<null>,
    { status },
  );
}
