import { TaskPriority, TaskStatus } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  DELETE as deleteTask,
  GET as getTask,
  PATCH as patchTask,
} from "@/app/api/tasks/[id]/route";
import { GET as listTasks, POST as createTask } from "@/app/api/tasks/route";
import { prisma } from "@/lib/db";
import { createRequest, createTestUser, resetDatabase } from "./helpers";

describe("tasks API", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("creates a task scoped to the authenticated user", async () => {
    const { user, sessionId } = await createTestUser("creator@example.com");

    const response = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId,
        body: JSON.stringify({ title: "Write tests" }),
      }),
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.data.title).toBe("Write tests");

    const row = await prisma.task.findFirst({ where: { id: json.data.id } });
    expect(row?.userId).toBe(user.id);
  });

  it("prevents cross-user access, updates, and deletes", async () => {
    const userA = await createTestUser("a@example.com");
    const userB = await createTestUser("b@example.com");

    const taskB = await prisma.task.create({
      data: {
        userId: userB.user.id,
        title: "User B task",
      },
    });

    const getResponse = await getTask(
      createRequest(`http://localhost/api/tasks/${taskB.id}`, { sessionId: userA.sessionId }),
      { params: Promise.resolve({ id: taskB.id }) },
    );
    expect(getResponse.status).toBe(404);

    const patchResponse = await patchTask(
      createRequest(`http://localhost/api/tasks/${taskB.id}`, {
        method: "PATCH",
        sessionId: userA.sessionId,
        body: JSON.stringify({ title: "Hacked" }),
      }),
      { params: Promise.resolve({ id: taskB.id }) },
    );
    expect(patchResponse.status).toBe(404);

    const deleteResponse = await deleteTask(
      createRequest(`http://localhost/api/tasks/${taskB.id}`, {
        method: "DELETE",
        sessionId: userA.sessionId,
      }),
      { params: Promise.resolve({ id: taskB.id }) },
    );
    expect(deleteResponse.status).toBe(404);
  });

  it("filters, sorts by priority, and paginates the task list", async () => {
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
