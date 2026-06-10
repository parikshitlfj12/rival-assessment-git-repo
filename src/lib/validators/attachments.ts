export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isAllowedAttachmentMimeType(mimeType: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType);
}

export function isAllowedAttachmentFile(file: File): boolean {
  if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) return false;
  return isAllowedAttachmentMimeType(file.type);
}
