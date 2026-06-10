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

async function assertTaskOwnership(userId: string, taskId: string): Promise<boolean> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  return Boolean(task);
}

export async function listTaskAttachments(
  userId: string,
  taskId: string,
): Promise<TaskAttachmentDto[] | null> {
  const ownsTask = await assertTaskOwnership(userId, taskId);
  if (!ownsTask) return null;

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
  const ownsTask = await assertTaskOwnership(userId, taskId);
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
    },
  });

  try {
    await saveAttachmentFile(storageKey, buffer);
  } catch {
    await prisma.taskAttachment.delete({ where: { id: attachment.id } });
    return { error: "Failed to store attachment" };
  }

  return { attachment: toTaskAttachmentDto(attachment) };
}

export async function getTaskAttachmentFile(
  userId: string,
  taskId: string,
  attachmentId: string,
): Promise<{ attachment: TaskAttachmentDto; data: Buffer } | null> {
  const ownsTask = await assertTaskOwnership(userId, taskId);
  if (!ownsTask) return null;

  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, taskId },
  });
  if (!attachment) return null;

  const data = await readAttachmentFile(attachment.storageKey);
  return { attachment: toTaskAttachmentDto(attachment), data };
}

export async function deleteTaskAttachment(
  userId: string,
  taskId: string,
  attachmentId: string,
): Promise<boolean> {
  const ownsTask = await assertTaskOwnership(userId, taskId);
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
