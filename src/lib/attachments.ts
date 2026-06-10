import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { toTaskAttachmentDto, type TaskAttachmentDto } from "@/lib/dto";
import {
  buildStorageKey,
  deleteAttachmentFile,
  deleteTaskUploadDirectory,
  readAttachmentFile,
  saveAttachmentFile,
} from "@/lib/uploads";
import {
  isAllowedAttachmentFile,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/validators/attachments";

type AttachmentAccess = { userId: string; isAdmin?: boolean };

async function canAccessTask(taskId: string, access: AttachmentAccess): Promise<boolean> {
  if (access.isAdmin) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });
    return Boolean(task);
  }
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: access.userId },
    select: { id: true },
  });
  return Boolean(task);
}

function bufferFromDbData(data: Buffer | Uint8Array | null | undefined): Buffer | null {
  if (data == null) return null;
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

export async function listTaskAttachments(
  userId: string,
  taskId: string,
  options: { isAdmin?: boolean } = {},
): Promise<TaskAttachmentDto[] | null> {
  const allowed = await canAccessTask(taskId, { userId, isAdmin: options.isAdmin });
  if (!allowed) return null;

  const attachments = await prisma.taskAttachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  return attachments.map(toTaskAttachmentDto);
}

export async function uploadTaskAttachment(
  userId: string,
  taskId: string,
  file: File,
): Promise<{ attachment?: TaskAttachmentDto; error?: string }> {
  const ownsTask = await canAccessTask(taskId, { userId });
  if (!ownsTask) {
    return { error: "NOT_FOUND" };
  }

  if (!isAllowedAttachmentFile(file)) {
    return {
      error:
        file.size > MAX_ATTACHMENT_BYTES
          ? "File exceeds the 5 MB limit"
          : "Unsupported file type. Upload an image or document (PDF, Word, plain text).",
    };
  }

  const attachmentId = randomUUID();
  const storageKey = buildStorageKey(taskId, attachmentId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const attachment = await prisma.taskAttachment.create({
    data: {
      id: attachmentId,
      taskId,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      data: buffer,
    },
  });

  try {
    await saveAttachmentFile(storageKey, buffer);
  } catch {
    // Filesystem is optional (local/Docker cache). Bytes in Postgres are the source of truth.
  }

  return { attachment: toTaskAttachmentDto(attachment) };
}

export async function getTaskAttachmentFile(
  userId: string,
  taskId: string,
  attachmentId: string,
  options: { isAdmin?: boolean } = {},
): Promise<{ attachment: TaskAttachmentDto; data: Buffer } | null> {
  const allowed = await canAccessTask(taskId, { userId, isAdmin: options.isAdmin });
  if (!allowed) return null;

  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, taskId },
  });
  if (!attachment) return null;

  const fromDb = bufferFromDbData(attachment.data);
  if (fromDb) {
    return { attachment: toTaskAttachmentDto(attachment), data: fromDb };
  }

  try {
    const data = await readAttachmentFile(attachment.storageKey);
    return { attachment: toTaskAttachmentDto(attachment), data };
  } catch {
    return null;
  }
}

export async function deleteTaskAttachment(
  userId: string,
  taskId: string,
  attachmentId: string,
): Promise<boolean> {
  const ownsTask = await canAccessTask(taskId, { userId });
  if (!ownsTask) return false;

  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, taskId },
  });
  if (!attachment) return false;

  await prisma.taskAttachment.delete({ where: { id: attachment.id } });
  await deleteAttachmentFile(attachment.storageKey);
  return true;
}

export async function removeTaskAttachmentFiles(taskId: string): Promise<void> {
  await deleteTaskUploadDirectory(taskId);
}
