import { NextRequest } from "next/server";
import {
  listTaskAttachments,
  uploadTaskAttachment,
} from "@/lib/attachments";
import { AuthError, requireUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const attachments = await listTaskAttachments(user.id, id);

    if (!attachments) {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    return successResponse({ items: attachments });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("VALIDATION_ERROR", "A file is required", 400);
    }

    const result = await uploadTaskAttachment(user.id, id, file);

    if (result.error === "NOT_FOUND") {
      return errorResponse("NOT_FOUND", "Task not found", 404);
    }

    if (result.error) {
      return errorResponse("VALIDATION_ERROR", result.error, 400);
    }

    return successResponse(result.attachment, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
