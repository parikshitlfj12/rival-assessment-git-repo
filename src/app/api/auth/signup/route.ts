import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  attachSessionCookie,
  createSession,
  hashPassword,
} from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { toUserDto } from "@/lib/dto";
import { resolveRoleForEmail } from "@/lib/roles";
import { signupSchema } from "@/lib/validators/auth";
import { zodFieldErrors } from "@/lib/zod-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid input", 400, zodFieldErrors(parsed.error));
    }

    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("CONFLICT", "An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: resolveRoleForEmail(email),
      },
    });

    const sessionId = await createSession(user.id);
    const response = successResponse({ user: toUserDto(user) }, 201);
    return attachSessionCookie(response, sessionId);
  } catch {
    return errorResponse("INTERNAL_ERROR", "Something went wrong", 500);
  }
}
