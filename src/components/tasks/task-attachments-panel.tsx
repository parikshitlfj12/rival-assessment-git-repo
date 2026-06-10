"use client";

import { motion } from "framer-motion";
import { Download, Paperclip, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ApiClientError,
  attachmentsApi,
  formatDateTime,
  formatFileSize,
} from "@/lib/api-client";
import type { TaskAttachmentDto, TaskDto } from "@/lib/dto";
import { listContainer, listItem } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { AttachmentRowSkeleton } from "@/components/ui/skeleton";

type TaskAttachmentsPanelProps = {
  task: TaskDto;
};

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function TaskAttachmentsPanel({ task }: TaskAttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<TaskAttachmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAttachments() {
    setLoading(true);
    setError(null);
    try {
      const response = await attachmentsApi.list(task.id);
      setItems(response.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttachments();
  }, [task.id]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const attachment = await attachmentsApi.upload(task.id, file);
      setItems((current) => [attachment, ...current]);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: string) {
    setError(null);
    try {
      await attachmentsApi.delete(task.id, attachmentId);
      setItems((current) => current.filter((item) => item.id !== attachmentId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete attachment");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Paperclip className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Attachments</h3>
            <p className="text-xs text-muted-foreground">Images and documents up to 5 MB</p>
          </div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx,application/pdf,text/plain"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-10 px-3.5 text-xs"
            loading={uploading}
            loadingText="Uploading…"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload file
          </Button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <AttachmentRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          compact
          icon={<Paperclip className="h-6 w-6" aria-hidden />}
          title="No attachments yet"
          description="Upload an image or document to keep relevant files with this task."
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <motion.ul variants={listContainer} initial="hidden" animate="show" className="space-y-2">
          {items.map((attachment) => {
            const downloadUrl = attachmentsApi.downloadUrl(task.id, attachment.id);
            return (
              <motion.li
                key={attachment.id}
                variants={listItem}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={downloadUrl}
                    className="truncate text-sm font-semibold text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {attachment.originalName}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.sizeBytes)} · {formatDateTime(attachment.createdAt)}
                    {isImageMimeType(attachment.mimeType) ? " · image" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 text-xs text-destructive hover:text-destructive"
                    onClick={() => void handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : null}
    </div>
  );
}
