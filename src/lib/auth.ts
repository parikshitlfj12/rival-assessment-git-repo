import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { toUserDto, type UserDto } from "@/lib/dto";
import { isAdminRole } from "@/lib/roles";
import {
  getClearSessionCookieOptions,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "@/lib/session";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return session.id;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function getSessionUserId(sessionId: string): Promise<string | null> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session.userId;
}

export function getSessionIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getSessionUserFromRequest(
  request: NextRequest,
): Promise<UserDto | null> {
  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) return null;

  const userId = await getSessionUserId(sessionId);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return toUserDto(user);
}

export async function requireUser(request: NextRequest): Promise<UserDto> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

export async function requireAdmin(request: NextRequest): Promise<UserDto> {
  const user = await requireUser(request);
  if (!isAdminRole(user.role)) {
    throw new AuthError("Forbidden");
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    sessionId,
    getSessionCookieOptions(Math.floor(SESSION_TTL_MS / 1000)),
  );
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", getClearSessionCookieOptions());
}

export function attachSessionCookie(response: Response, sessionId: string): Response {
  const headers = new Headers(response.headers);
  const options = getSessionCookieOptions(Math.floor(SESSION_TTL_MS / 1000));
  const secure = options.secure ? "; Secure" : "";
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${sessionId}; Path=${options.path}; HttpOnly; SameSite=Lax; Max-Age=${options.maxAge}${secure}`,
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function clearSessionCookieHeader(): string {
  const options = getClearSessionCookieOptions();
  const secure = options.secure ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=${options.path}; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
