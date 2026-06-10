import type { TaskDto } from "@/lib/dto";

export type TaskRealtimeEvent =
  | { type: "task:created"; task: TaskDto }
  | { type: "task:updated"; task: TaskDto }
  | { type: "task:deleted"; taskId: string };

type TaskEventListener = (event: TaskRealtimeEvent) => void;

const listenersByUser = new Map<string, Set<TaskEventListener>>();

export function subscribeToTaskEvents(userId: string, listener: TaskEventListener): () => void {
  let listeners = listenersByUser.get(userId);
  if (!listeners) {
    listeners = new Set();
    listenersByUser.set(userId, listeners);
  }

  listeners.add(listener);

  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      listenersByUser.delete(userId);
    }
  };
}

export function publishTaskEvent(userId: string, event: TaskRealtimeEvent): void {
  const listeners = listenersByUser.get(userId);
  if (!listeners) return;

  for (const listener of listeners) {
    listener(event);
  }
}

/** Test helper */
export function resetTaskEventListeners(): void {
  listenersByUser.clear();
}

export function getTaskEventListenerCount(userId: string): number {
  return listenersByUser.get(userId)?.size ?? 0;
}
