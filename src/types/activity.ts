export type ActivityChangeDto = {
  field: "title" | "description" | "status" | "priority" | "dueDate";
  from: string | null;
  to: string | null;
};

export type TaskActivityDto = {
  id: string;
  taskId: string;
  userId: string;
  actorEmail: string;
  action: "created" | "updated" | "deleted";
  changes: ActivityChangeDto[] | null;
  createdAt: string;
};
