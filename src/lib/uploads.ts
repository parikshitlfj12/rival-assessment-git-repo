import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export function getUploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return path.resolve(configured || path.join(process.cwd(), ".uploads"));
}

export function getAttachmentAbsolutePath(storageKey: string): string {
  const root = getUploadRoot();
  const resolved = path.resolve(root, storageKey);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Invalid storage path");
  }
  return resolved;
}

export function buildStorageKey(taskId: string, attachmentId: string, originalName: string): string {
  const safeName = sanitizeFilename(originalName);
  return path.join(taskId, `${attachmentId}-${safeName}`);
}

export function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^\w.\-() +]/g, "_").trim();
  return base.slice(0, 200) || "file";
}

export async function ensureUploadRoot(): Promise<void> {
  await mkdir(getUploadRoot(), { recursive: true });
}

export async function saveAttachmentFile(
  storageKey: string,
  data: Buffer,
): Promise<void> {
  await ensureUploadRoot();
  const absolutePath = getAttachmentAbsolutePath(storageKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data);
}

export async function readAttachmentFile(storageKey: string): Promise<Buffer> {
  return readFile(getAttachmentAbsolutePath(storageKey));
}

export async function deleteAttachmentFile(storageKey: string): Promise<void> {
  try {
    await rm(getAttachmentAbsolutePath(storageKey), { force: true });
  } catch {
    // Ignore missing files during cleanup.
  }
}

export async function deleteTaskUploadDirectory(taskId: string): Promise<void> {
  try {
    await rm(getAttachmentAbsolutePath(taskId), { recursive: true, force: true });
  } catch {
    // Ignore missing directories during cleanup.
  }
}
