import { NextRequest } from "next/server";
import { listTaskActivity } from "@/lib/activity";
import { AuthError, requireUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const activities = await listTaskActivity(user.id, id);

    if (!activities) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse({ items: activities });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
