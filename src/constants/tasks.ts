import { TaskStatus } from "@prisma/client";

export const TASK_QUERY_KEYS = ["status", "search", "sort", "order", "page", "limit"] as const;

export const DEFAULT_TASK_SORT = "created_at";
export const DEFAULT_TASK_ORDER = "desc";
export const DEFAULT_TASK_PAGE = 1;
export const DEFAULT_TASK_LIMIT = 10;

export const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Todo", value: TaskStatus.todo },
  { label: "In Progress", value: TaskStatus.in_progress },
  { label: "Done", value: TaskStatus.done },
] as const;

export const SORT_OPTIONS = [
  { value: "created_at", label: "Created date" },
  { value: "due_date", label: "Due date" },
  { value: "priority", label: "Priority" },
] as const;

export const ORDER_OPTIONS = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
] as const;

export const ACTIVITY_FIELD_LABELS: Record<string, string> = {
  title: "title",
  description: "description",
  status: "status",
  priority: "priority",
  dueDate: "due date",
};
