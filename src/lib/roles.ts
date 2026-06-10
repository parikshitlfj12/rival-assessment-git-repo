import { UserRole } from "@prisma/client";

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string): boolean {
  return parseAdminEmails().has(email.trim().toLowerCase());
}

export function resolveRoleForEmail(email: string): UserRole {
  return isAdminEmail(email) ? UserRole.admin : UserRole.user;
}

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.admin;
}
