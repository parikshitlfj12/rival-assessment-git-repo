import { afterEach, describe, expect, it } from "vitest";
import { POST as createTask } from "@/app/api/tasks/route";
import {
  DELETE as deleteTask,
  GET as getTask,
  PATCH as patchTask,
} from "@/app/api/tasks/[id]/route";
import { prisma } from "@/lib/db";
import {
  createRequest,
  createTestUser,
  resetDatabase,
} from "./helpers";

describe("task ownership and creation", () => {
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
});
