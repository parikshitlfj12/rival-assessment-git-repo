import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { hashPassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function resetDatabase() {
  await prisma.taskActivity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(
  email: string,
  password = "password123",
  role: UserRole = UserRole.user,
) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role,
    },
  });
  const sessionId = await createSession(user.id);
  return { user, sessionId };
}

export function createRequest(
  url: string,
  init: RequestInit & { sessionId?: string } = {},
): NextRequest {
  const { sessionId, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);

  if (sessionId) {
    headers.set("Cookie", `${SESSION_COOKIE_NAME}=${sessionId}`);
  }

  return new NextRequest(url, {
    ...requestInit,
    headers,
  });
}

export function getSetCookieSessionId(response: Response): string | null {
  const cookie = response.headers.get("set-cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}
