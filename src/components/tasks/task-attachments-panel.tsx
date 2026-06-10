"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApiClientError,
  attachmentsApi,
  formatDate,
  formatFileSize,
} from "@/lib/api-client";
import type { TaskAttachmentDto, TaskDto } from "@/lib/dto";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { TaskRowSkeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Attachments</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Images and documents up to 5 MB
          </p>
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
            className="min-h-9 px-3 py-1.5 text-xs"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload file"}
          </Button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <TaskRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No attachments yet" description="Upload an image or document for this task." />
      ) : null}

      {!loading && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((attachment) => {
            const downloadUrl = attachmentsApi.downloadUrl(task.id, attachment.id);
            return (
              <li
                key={attachment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={downloadUrl}
                    className="truncate text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {attachment.originalName}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(attachment.sizeBytes)} · {formatDate(attachment.createdAt)}
                    {isImageMimeType(attachment.mimeType) ? " · image" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Download
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-300"
                    onClick={() => void handleDelete(attachment.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
