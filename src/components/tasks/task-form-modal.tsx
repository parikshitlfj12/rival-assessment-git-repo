"use client";

import { TaskPriority, TaskStatus } from "@prisma/client";
import { Calendar, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ApiClientError,
  fromDateInputValue,
  toDateInputValue,
} from "@/lib/api-client";
import type { TaskDto } from "@/lib/dto";
import { taskFormSchema } from "@/lib/validators/tasks";
import { TaskAttachmentsPanel } from "@/components/tasks/task-attachments-panel";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Label } from "@/components/ui/label";
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

const TASK_FORM_ID = "task-form";

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
    dueDate: toDateInputValue(task.dueDate),
  };
}

export function TaskFormModal({ open, onClose, task, onSubmit }: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() => getInitialValues(task));
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(task));
      setFields({});
      setFormError(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on open transition or task change
  }, [open, task?.id]);

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
        dueDate: fromDateInputValue(parsed.data.dueDate ?? ""),
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
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? "Edit task" : "New task"}
      description={
        task
          ? "Update task details, status, and attachments."
          : "Add a new task to your list."
      }
      size={task ? "xl" : "lg"}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={onClose}
            className="min-h-11 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={TASK_FORM_ID}
            loading={loading}
            loadingText="Saving…"
            className="min-h-11 w-full sm:w-auto"
          >
            {task ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form
        id={TASK_FORM_ID}
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {formError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="What needs to be done?"
            disabled={loading}
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
          />
          <FieldError message={fields.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add context, links, or acceptance criteria…"
            disabled={loading}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
          />
          <FieldError message={fields.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status" className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
              Status
            </Label>
            <Select
              id="status"
              disabled={loading}
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
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              disabled={loading}
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
          <Label htmlFor="dueDate" className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Due date
          </Label>
          <Input
            id="dueDate"
            type="date"
            disabled={loading}
            value={values.dueDate}
            onChange={(event) =>
              setValues((current) => ({ ...current, dueDate: event.target.value }))
            }
          />
          <FieldError message={fields.dueDate} />
        </div>

        {task ? (
          <div className="pt-2">
            <TaskAttachmentsPanel task={task} />
          </div>
        ) : null}
      </form>
    </Dialog>
  );
}
