import { NextRequest } from "next/server";
import {
  clearSessionCookieHeader,
  deleteSession,
  getSessionIdFromRequest,
} from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromRequest(request);
    if (sessionId) {
      await deleteSession(sessionId);
    }

    const response = successResponse({ ok: true });
    response.headers.append("Set-Cookie", clearSessionCookieHeader());
    return response;
  } catch {
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
