"use client";

import { useEffect, useState } from "react";
import { ApiClientError, activityApi, formatDate, formatActivityMessage } from "@/lib/api-client";
import type { TaskActivityDto, TaskDto } from "@/lib/dto";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { TaskRowSkeleton } from "@/components/ui/skeleton";

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
    <Dialog open={open} onClose={onClose} title={task ? `Activity · ${task.title}` : "Activity"}>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <TaskRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? <ErrorBanner message={error} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Changes to this task will appear here."
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ol className="max-h-[24rem] space-y-4 overflow-y-auto pr-1">
          {items.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatActivityMessage(entry)}
                </p>
                <time className="text-xs text-zinc-500">{formatDate(entry.createdAt)}</time>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{entry.actorEmail}</p>
              {entry.changes?.length ? (
                <ul className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {entry.changes.map((change) => (
                    <li key={`${entry.id}-${change.field}`}>
                      <span className="font-medium capitalize">{formatFieldLabel(change.field)}</span>
                      {": "}
                      {formatChangeValue(change.from)} → {formatChangeValue(change.to)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}

function formatFieldLabel(field: string): string {
  if (field === "dueDate") return "Due date";
  return field.replace("_", " ");
}

function formatChangeValue(value: string | null): string {
  if (value === null || value === "") return "empty";
  if (fieldLooksLikeIsoDate(value)) {
    return formatDate(value);
  }
  return value.replace("_", " ");
}

function fieldLooksLikeIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value)) && value.includes("T");
}
