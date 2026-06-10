import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  attachSessionCookie,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { toUserDto } from "@/lib/dto";
import { isAdminEmail } from "@/lib/roles";
import { loginSchema } from "@/lib/validators/auth";
import { zodFieldErrors } from "@/lib/zod-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid input", 400, zodFieldErrors(parsed.error));
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return errorResponse("UNAUTHORIZED", "Invalid email or password", 401);
    }

    const shouldPromote =
      isAdminEmail(email) && user.role !== UserRole.admin;
    const activeUser = shouldPromote
      ? await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.admin },
        })
      : user;

    const sessionId = await createSession(activeUser.id);
    const response = successResponse({ user: toUserDto(activeUser) });
    return attachSessionCookie(response, sessionId);
  } catch {
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
