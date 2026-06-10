"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, History } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiClientError,
  activityApi,
  formatActivityMessage,
  formatDate,
  formatDateTime,
} from "@/lib/api-client";
import type { TaskActivityDto, TaskDto } from "@/lib/dto";
import { listContainer, listItem } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ActivityRowSkeleton } from "@/components/ui/skeleton";

type TaskActivityModalProps = {
  open: boolean;
  task: TaskDto | null;
  onClose: () => void;
};

export function TaskActivityModal({ open, task, onClose }: TaskActivityModalProps) {
  const [items, setItems] = useState<TaskActivityDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !task) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    activityApi
      .list(task.id)
      .then((response) => {
        if (!cancelled) setItems(response.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Failed to load activity");
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
      title="Activity history"
      description={task ? task.title : "Recent changes to this task."}
      size="lg"
      footer={
        <Button
          variant="outline"
          onClick={onClose}
          className="min-h-11 w-full sm:w-auto"
        >
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ActivityRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? <ErrorBanner message={error} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          compact
          title="No activity yet"
          description="Edits and status changes will appear here as they happen."
          icon={<History className="h-7 w-7" aria-hidden />}
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <motion.ol
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {items.map((entry) => (
            <motion.li
              key={entry.id}
              variants={listItem}
              className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {formatActivityMessage(entry)}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {entry.actorEmail}
                  </p>
                </div>
                <time className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(entry.createdAt)}
                </time>
              </div>

              {entry.changes?.length ? (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {entry.changes.map((change) => (
                    <li
                      key={`${entry.id}-${change.field}`}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground"
                    >
                      <span className="font-medium text-foreground">
                        {formatFieldLabel(change.field)}:
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="rounded-md bg-card px-1.5 py-0.5 text-xs text-foreground/80">
                          {formatChangeValue(change.field, change.from)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="rounded-md bg-accent/40 px-1.5 py-0.5 text-xs text-accent-foreground">
                          {formatChangeValue(change.field, change.to)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      ) : null}
    </Dialog>
  );
}

function formatFieldLabel(field: string): string {
  if (field === "dueDate") return "Due date";
  return field.replace("_", " ");
}

function formatChangeValue(field: string, value: string | null): string {
  if (value === null || value === "") return "empty";
  if (field === "dueDate" || fieldLooksLikeIsoDate(value)) {
    return formatDate(value);
  }
  return value.replace("_", " ");
}

function fieldLooksLikeIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value)) && value.includes("T");
}
