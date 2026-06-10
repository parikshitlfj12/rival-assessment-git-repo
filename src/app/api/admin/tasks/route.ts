import { NextRequest } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { listAllTasksAdmin } from "@/lib/tasks";
import { adminListTasksQuerySchema } from "@/lib/validators/tasks";
import { zodFieldErrors } from "@/lib/zod-utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminListTasksQuerySchema.safeParse(params);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid query parameters", 400, zodFieldErrors(parsed.error));
    }

    const result = await listAllTasksAdmin(parsed.data);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message === "Forbidden") {
        return errorResponse("FORBIDDEN", "Admin access required", 403);
      }
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
