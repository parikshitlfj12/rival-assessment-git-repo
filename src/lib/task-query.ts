import { TASK_QUERY_KEYS } from "@/constants/tasks";

export function buildTaskListQuery(params: URLSearchParams): string {
  const query = new URLSearchParams();
  for (const key of TASK_QUERY_KEYS) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  return query.toString();
}
