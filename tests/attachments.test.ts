import { afterEach, describe, expect, it } from "vitest";
import {
  DELETE as deleteAttachment,
  GET as downloadAttachment,
} from "@/app/api/tasks/[id]/attachments/[attachmentId]/route";
import {
  GET as listAttachments,
  POST as uploadAttachment,
} from "@/app/api/tasks/[id]/attachments/route";
import { DELETE as deleteTask } from "@/app/api/tasks/[id]/route";
import { POST as createTask } from "@/app/api/tasks/route";
import { createRequest, createTestUser, resetDatabase } from "./helpers";

describe("task attachments", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("uploads, lists, downloads, and deletes attachments for a task", async () => {
    const { sessionId } = await createTestUser("user@example.com");

    const createResponse = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId,
        body: JSON.stringify({ title: "Attachment task" }),
      }),
    );
    expect(createResponse.status).toBe(201);
    const createdJson = await createResponse.json();
    const taskId = createdJson.data.id as string;

    const file = new File(["hello attachment"], "note.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, {
        method: "POST",
        sessionId,
        body: formData,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );
    expect(uploadResponse.status).toBe(201);
    const uploadJson = await uploadResponse.json();
    const attachmentId = uploadJson.data.id as string;
    expect(uploadJson.data.originalName).toBe("note.txt");

    const listResponse = await listAttachments(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, { sessionId }),
      { params: Promise.resolve({ id: taskId }) },
    );
    expect(listResponse.status).toBe(200);
    const listJson = await listResponse.json();
    expect(listJson.data.items).toHaveLength(1);

    const downloadResponse = await downloadAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments/${attachmentId}`, {
        sessionId,
      }),
      { params: Promise.resolve({ id: taskId, attachmentId }) },
    );
    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers.get("content-type")).toBe("text/plain");
    expect(await downloadResponse.text()).toBe("hello attachment");

    const deleteResponse = await deleteAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: "DELETE",
        sessionId,
      }),
      { params: Promise.resolve({ id: taskId, attachmentId }) },
    );
    expect(deleteResponse.status).toBe(204);

    const listAfterDelete = await listAttachments(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, { sessionId }),
      { params: Promise.resolve({ id: taskId }) },
    );
    const listAfterDeleteJson = await listAfterDelete.json();
    expect(listAfterDeleteJson.data.items).toHaveLength(0);
  });

  it("rejects unsupported file types", async () => {
    const { sessionId } = await createTestUser("user@example.com");

    const createResponse = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId,
        body: JSON.stringify({ title: "Attachment task" }),
      }),
    );
    const createdJson = await createResponse.json();
    const taskId = createdJson.data.id as string;

    const file = new File(["#!/bin/bash"], "script.sh", { type: "application/x-sh" });
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, {
        method: "POST",
        sessionId,
        body: formData,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );

    expect(uploadResponse.status).toBe(400);
  });

  it("returns 404 for another user's task attachments", async () => {
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

    const listResponse = await listAttachments(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, {
        sessionId: other.sessionId,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );

    expect(listResponse.status).toBe(404);
  });

  it("removes attachment files when the task is deleted", async () => {
    const { sessionId } = await createTestUser("user@example.com");

    const createResponse = await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId,
        body: JSON.stringify({ title: "Delete me" }),
      }),
    );
    const createdJson = await createResponse.json();
    const taskId = createdJson.data.id as string;

    const file = new File(["temporary"], "temp.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments`, {
        method: "POST",
        sessionId,
        body: formData,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );
    const uploadJson = await uploadResponse.json();
    const attachmentId = uploadJson.data.id as string;

    const deleteTaskResponse = await deleteTask(
      createRequest(`http://localhost/api/tasks/${taskId}`, {
        method: "DELETE",
        sessionId,
      }),
      { params: Promise.resolve({ id: taskId }) },
    );
    expect(deleteTaskResponse.status).toBe(204);

    const downloadResponse = await downloadAttachment(
      createRequest(`http://localhost/api/tasks/${taskId}/attachments/${attachmentId}`, {
        sessionId,
      }),
      { params: Promise.resolve({ id: taskId, attachmentId }) },
    );
    expect(downloadResponse.status).toBe(404);
  });
});
