import { NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createTask, listTasks } from "@/lib/tasks";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validators/tasks";
import { zodFieldErrors } from "@/lib/zod-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = listTasksQuerySchema.safeParse(params);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid query parameters", 400, zodFieldErrors(parsed.error));
    }

    const result = await listTasks(user.id, parsed.data);
    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid input", 400, zodFieldErrors(parsed.error));
    }

    const task = await createTask(user.id, parsed.data);
    return successResponse(task, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
