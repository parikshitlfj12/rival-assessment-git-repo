import { NextRequest } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUserFromRequest(request);
    if (!user) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return successResponse({ user });
  } catch {
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
