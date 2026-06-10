import type { UserRole } from "@prisma/client";

export type UserDto = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};
