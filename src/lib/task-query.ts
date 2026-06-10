import {
  DEFAULT_TASK_LIMIT,
  DEFAULT_TASK_ORDER,
  DEFAULT_TASK_PAGE,
  DEFAULT_TASK_SORT,
  TASK_QUERY_KEYS,
} from "@/constants/tasks";

const FIXED_QUERY_KEYS = new Set(["sort", "order", "page", "limit"]);

export function buildTaskListQuery(params: URLSearchParams): string {
  const query = new URLSearchParams();

  query.set("sort", params.get("sort") ?? DEFAULT_TASK_SORT);
  query.set("order", params.get("order") ?? DEFAULT_TASK_ORDER);
  query.set("page", params.get("page") ?? String(DEFAULT_TASK_PAGE));
  query.set("limit", params.get("limit") ?? String(DEFAULT_TASK_LIMIT));

  for (const key of TASK_QUERY_KEYS) {
    if (FIXED_QUERY_KEYS.has(key)) continue;
    const value = params.get(key);
    if (value) query.set(key, value);
  }

  return query.toString();
}
