import { afterEach, describe, expect, it } from "vitest";
import {
  getTaskEventListenerCount,
  publishTaskEvent,
  resetTaskEventListeners,
  subscribeToTaskEvents,
} from "@/lib/task-events";

describe("task realtime events", () => {
  afterEach(() => {
    resetTaskEventListeners();
  });

  it("delivers published events to subscribed listeners for a user", () => {
    const userId = "user-1";
    const received: string[] = [];

    subscribeToTaskEvents(userId, (event) => {
      received.push(event.type);
    });

    expect(getTaskEventListenerCount(userId)).toBe(1);

    publishTaskEvent(userId, {
      type: "task:created",
      task: {
        id: "task-1",
        userId,
        title: "Example",
        description: null,
        status: "todo",
        priority: "medium",
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    expect(received).toEqual(["task:created"]);
  });

  it("does not deliver events to other users", () => {
    const received: string[] = [];

    subscribeToTaskEvents("user-a", (event) => {
      received.push(event.type);
    });

    publishTaskEvent("user-b", { type: "task:deleted", taskId: "task-2" });

    expect(received).toEqual([]);
  });
});
