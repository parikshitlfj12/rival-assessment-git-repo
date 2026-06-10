"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiClientError,
  attachmentsApi,
  formatDateTime,
  formatFileSize,
} from "@/lib/api-client";
import type { AdminTaskDto, TaskAttachmentDto } from "@/lib/dto";
import { listContainer, listItem } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { AttachmentRowSkeleton } from "@/components/ui/skeleton";

type AdminAttachmentsModalProps = {
  open: boolean;
  task: AdminTaskDto | null;
  onClose: () => void;
};

export function AdminAttachmentsModal({ open, task, onClose }: AdminAttachmentsModalProps) {
  const [items, setItems] = useState<TaskAttachmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !task) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    attachmentsApi
      .list(task.id)
      .then((response) => {
        if (!cancelled) setItems(response.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Failed to load attachments");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, task]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Attachments"
      description={task ? `${task.title} · ${task.ownerEmail}` : "Files attached to this task."}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose} className="min-h-11 w-full sm:w-auto">
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <AttachmentRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? <ErrorBanner message={error} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          compact
          title="No attachments"
          description="This task does not have any uploaded files."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <motion.ul
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {items.map((attachment) => {
            const downloadUrl = task
              ? attachmentsApi.downloadUrl(task.id, attachment.id)
              : "#";
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
                  </p>
                </div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : null}
    </Dialog>
  );
}
