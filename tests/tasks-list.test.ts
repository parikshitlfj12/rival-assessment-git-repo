import { TaskPriority, TaskStatus } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import { GET as listTasks } from "@/app/api/tasks/route";
import { prisma } from "@/lib/db";
import { createRequest, createTestUser, resetDatabase } from "./helpers";

describe("GET /api/tasks filtering and pagination", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("filters, sorts by priority, and paginates", async () => {
    const { user, sessionId } = await createTestUser("lister@example.com");

    const seed = [
      { title: "Todo high", status: TaskStatus.todo, priority: TaskPriority.high },
      { title: "Todo medium", status: TaskStatus.todo, priority: TaskPriority.medium },
      { title: "Todo low", status: TaskStatus.todo, priority: TaskPriority.low },
      { title: "Done task", status: TaskStatus.done, priority: TaskPriority.high },
      { title: "Another todo", status: TaskStatus.todo, priority: TaskPriority.medium },
    ];

    for (const task of seed) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: new Date("2026-06-01T12:00:00.000Z"),
        },
      });
    }

    const response = await listTasks(
      createRequest(
        "http://localhost/api/tasks?status=todo&sort=priority&order=desc&page=1&limit=2",
        { sessionId },
      ),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.items).toHaveLength(2);
    expect(json.data.items[0].priority).toBe("high");
    expect(json.data.items[1].priority).toBe("medium");
    expect(json.data.pagination.total).toBe(4);
    expect(json.data.pagination.totalPages).toBe(2);
  });
});
