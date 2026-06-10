import type { Task } from "@prisma/client";

export type TaskDto = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaskDto = TaskDto & {
  ownerEmail: string;
};
