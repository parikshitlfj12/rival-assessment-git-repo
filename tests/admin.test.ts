import { UserRole } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as getAdminTasks } from "@/app/api/admin/tasks/route";
import { POST as createTask } from "@/app/api/tasks/route";
import { createRequest, createTestUser, resetDatabase } from "./helpers";

describe("admin RBAC", () => {
  const previousAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    process.env.ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(async () => {
    process.env.ADMIN_EMAILS = previousAdminEmails;
    await resetDatabase();
  });

  it("allows admins to list all users' tasks", async () => {
    const admin = await createTestUser("admin@example.com", "password123", UserRole.admin);
    const user = await createTestUser("user@example.com");

    await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId: user.sessionId,
        body: JSON.stringify({ title: "User task" }),
      }),
    );

    await createTask(
      createRequest("http://localhost/api/tasks", {
        method: "POST",
        sessionId: admin.sessionId,
        body: JSON.stringify({ title: "Admin task" }),
      }),
    );

    const response = await getAdminTasks(
      createRequest("http://localhost/api/admin/tasks", { sessionId: admin.sessionId }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.items).toHaveLength(2);
    expect(json.data.items.map((task: { title: string }) => task.title).sort()).toEqual([
      "Admin task",
      "User task",
    ]);
    expect(json.data.items.every((task: { ownerEmail: string }) => task.ownerEmail)).toBe(true);
  });

  it("forbids non-admin users from the admin tasks endpoint", async () => {
    const user = await createTestUser("user@example.com");

    const response = await getAdminTasks(
      createRequest("http://localhost/api/admin/tasks", { sessionId: user.sessionId }),
    );

    expect(response.status).toBe(403);
  });
});
