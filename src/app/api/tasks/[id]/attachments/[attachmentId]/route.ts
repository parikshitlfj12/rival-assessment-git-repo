import { NextRequest, NextResponse } from "next/server";
import {
  deleteTaskAttachment,
  getTaskAttachmentFile,
} from "@/lib/attachments";
import { AuthError, requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";
import { isAdminRole } from "@/lib/roles";

type RouteContext = { params: Promise<{ id: string; attachmentId: string }> };

function contentDispositionFilename(name: string): string {
  const ascii = name.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(name);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id, attachmentId } = await context.params;
    const result = await getTaskAttachmentFile(user.id, id, attachmentId, {
      isAdmin: isAdminRole(user.role),
    });

    if (!result) {
      return errorResponse("NOT_FOUND", "Attachment not found", 404);
    }

    const { attachment, data } = result;
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(data.byteLength),
        "Content-Disposition": contentDispositionFilename(attachment.originalName),
        "Cache-Control": "private, no-store",
      },
    });
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
    const { id, attachmentId } = await context.params;
    const deleted = await deleteTaskAttachment(user.id, id, attachmentId);

    if (!deleted) {
      return errorResponse("NOT_FOUND", "Attachment not found", 404);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
    }
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
