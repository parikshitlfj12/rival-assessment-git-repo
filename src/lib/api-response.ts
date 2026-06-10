import { NextResponse } from "next/server";

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiError | null;
};

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
