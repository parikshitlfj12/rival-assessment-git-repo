import { afterEach, describe, expect, it } from "vitest";
import { GET as getActivity } from "@/app/api/tasks/[id]/activity/route";
import { PATCH as updateTask } from "@/app/api/tasks/[id]/route";
import { POST as createTask } from "@/app/api/tasks/route";
import { createRequest, createTestUser, resetDatabase } from "./helpers";

describe("task activity log", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("records create and update events for a task", async () => {
    const { sessionId } = await createTestUser("user@example.com");

    const createResponse = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId,
        body: JSON.stringify({ title: "Initial title", priority: "low" }),
      }),
    );
    expect(createResponse.status).toBe(201);
    const createdJson = await createResponse.json();
    const taskId = createdJson.data.id as string;

    await updateTask(
      createRequest(`http://localhost/api/tasks/${taskId}`, {
        method: "PATCH",
        sessionId,
        body: JSON.stringify({ title: "Updated title", status: "in_progress" }),
      }),
      { params: Promise.resolve({ id: taskId }) },
    );

    const activityResponse = await getActivity(
      createRequest(`http://localhost/api/tasks/${taskId}/activity`, { sessionId }),
      { params: Promise.resolve({ id: taskId }) },
    );

    expect(activityResponse.status).toBe(200);
    const activityJson = await activityResponse.json();
    expect(activityJson.data.items).toHaveLength(2);

    const [latest, earliest] = activityJson.data.items;
    expect(latest.action).toBe("updated");
    expect(latest.changes).toEqual(
      expect.arrayContaining([
        { field: "title", from: "Initial title", to: "Updated title" },
        { field: "status", from: "todo", to: "in_progress" },
      ]),
    );
    expect(earliest.action).toBe("created");
    expect(earliest.actorEmail).toBe("user@example.com");
  });

  it("returns 404 for another user's task activity", async () => {
    const owner = await createTestUser("owner@example.com");
    const other = await createTestUser("other@example.com");

    const createResponse = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId: owner.sessionId,
        body: JSON.stringify({ title: "Private task" }),
      }),
    );
    const createdJson = await createResponse.json();
    const taskId = createdJson.data.id as string;

    const activityResponse = await getActivity(
      createRequest(`http://localhost/api/tasks/${taskId}/activity`, {
        sessionId: other.sessionId,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );

    expect(activityResponse.status).toBe(404);
  });
});
