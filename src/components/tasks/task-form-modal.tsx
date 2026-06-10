"use client";

import { TaskPriority, TaskStatus } from "@prisma/client";
import { useState } from "react";
import {
  ApiClientError,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/api-client";
import type { TaskDto } from "@/lib/dto";
import { taskFormSchema } from "@/lib/validators/tasks";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type TaskFormModalProps = {
  open: boolean;
  onClose: () => void;
  task?: TaskDto | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<TaskDto>;
};

type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

function getInitialValues(task?: TaskDto | null): TaskFormValues {
  if (!task) {
    return {
      title: "",
      description: "",
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: "",
    };
  }

  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: toDatetimeLocalValue(task.dueDate),
  };
}

function TaskFormBody({
  task,
  onClose,
  onSubmit,
}: {
  task?: TaskDto | null;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => Promise<TaskDto>;
}) {
  const [values, setValues] = useState(() => getInitialValues(task));
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFields({});

    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextFields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "_form";
        nextFields[key] = issue.message;
      }
      setFields(nextFields);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        status: parsed.data.status,
        priority: parsed.data.priority,
        dueDate: fromDatetimeLocalValue(parsed.data.dueDate ?? ""),
      });
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.fields) setFields(error.fields);
      } else {
        setFormError("Unable to save task. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {formError}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        />
        {fields.title ? <p className="text-sm text-rose-600">{fields.title}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
        />
        {fields.description ? <p className="text-sm text-rose-600">{fields.description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select
            id="status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as TaskStatus,
              }))
            }
          >
            <option value={TaskStatus.todo}>Todo</option>
            <option value={TaskStatus.in_progress}>In Progress</option>
            <option value={TaskStatus.done}>Done</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <Select
            id="priority"
            value={values.priority}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                priority: event.target.value as TaskPriority,
              }))
            }
          >
            <option value={TaskPriority.low}>Low</option>
            <option value={TaskPriority.medium}>Medium</option>
            <option value={TaskPriority.high}>High</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Due date
        </label>
        <Input
          id="dueDate"
          type="datetime-local"
          value={values.dueDate}
          onChange={(event) =>
            setValues((current) => ({ ...current, dueDate: event.target.value }))
          }
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

export function TaskFormModal({ open, onClose, task, onSubmit }: TaskFormModalProps) {
  return (
    <Dialog open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      {open ? (
        <TaskFormBody
          key={task?.id ?? "create"}
          task={task}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}
