import type { TaskActivityDto } from "@/types/activity";
import { ACTIVITY_FIELD_LABELS } from "@/constants/tasks";

export function formatActivityMessage(entry: TaskActivityDto): string {
  if (entry.action === "created") return "Task created";
  if (entry.action === "deleted") return "Task deleted";
  if (!entry.changes?.length) return "Task updated";

  const fields = entry.changes.map(
    (change) => ACTIVITY_FIELD_LABELS[change.field] ?? change.field,
  );
  if (fields.length === 1) return `Updated ${fields[0]}`;
  return `Updated ${fields.slice(0, -1).join(", ")} and ${fields.at(-1)}`;
}
