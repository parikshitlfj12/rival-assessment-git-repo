import { NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { deleteTask, getTaskById, updateTask } from "@/lib/tasks";
import { updateTaskSchema } from "@/lib/validators/tasks";
import { zodFieldErrors } from "@/lib/zod-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const task = await getTaskById(user.id, id);

    if (!task) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse(task);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid input", 400, zodFieldErrors(parsed.error));
    }

    const task = await updateTask(user.id, id, parsed.data);
    if (!task) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse(task);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const deleted = await deleteTask(user.id, id);

    if (!deleted) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
