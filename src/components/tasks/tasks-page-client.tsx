"use client";

import { TaskStatus, UserRole } from "@prisma/client";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  History,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { listContainer, listItem } from "@/components/motion/fade-in";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskActivityModal } from "@/components/tasks/task-activity-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Pagination } from "@/components/ui/pagination";
import { TaskRowSkeleton } from "@/components/ui/skeleton";
import {
  ApiClientError,
  authApi,
  formatDate,
  formatDateTime,
  tasksApi,
  type TasksListResponse,
} from "@/lib/api-client";
import type { TaskDto, UserDto } from "@/lib/dto";
import { TaskListToolbar } from "@/components/tasks/task-list-toolbar";
import { useTaskListParams } from "@/hooks/use-task-list-params";

export function TasksPageClient() {
  const router = useRouter();
  const {
    searchInput,
    setSearchInput,
    updateParams,
    page,
    sort,
    order,
    status,
    listQueryString,
  } = useTaskListParams({ basePath: "/tasks" });

  const [user, setUser] = useState<UserDto | null>(null);
  const [data, setData] = useState<TasksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [deleteTask, setDeleteTask] = useState<TaskDto | null>(null);
  const [activityTask, setActivityTask] = useState<TaskDto | null>(null);
  const hasActiveFilters = Boolean(status || searchInput.trim());

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tasksApi.list(listQueryString);
      if (result.pagination.total > 0 && page > result.pagination.totalPages) {
        updateParams({ page: String(result.pagination.totalPages) });
        return;
      }
      setData(result);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof ApiClientError ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [listQueryString, page, router, updateParams]);

  const refreshTasksQuietly = useCallback(async () => {
    try {
      const result = await tasksApi.list(listQueryString);
      setData(result);
    } catch {
      // Ignore background refresh errors; explicit loads still surface errors.
    }
  }, [listQueryString]);

  useEffect(() => {
    authApi
      .me()
      .then((response) => setUser(response.user))
      .catch(() => router.push("/login"));
  }, [router]);

  // Data fetch on query change — standard client-side request lifecycle.
  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!user) return;

    const source = new EventSource("/api/tasks/events");

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };
        if (payload.type === "connected") return;
        void refreshTasksQuietly();
      } catch {
        // Ignore malformed SSE payloads.
      }
    };

    return () => source.close();
  }, [user, refreshTasksQuietly]);

  async function handleLogout() {
    await authApi.logout();
    router.push("/login");
    router.refresh();
  }

  async function handleCreate(payload: Record<string, unknown>) {
    try {
      const created = await tasksApi.create(payload);
      toast.success("Task created");
      updateParams({ status: null, page: "1" });
      return created;
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to create task");
      throw error;
    }
  }

  async function handleUpdate(payload: Record<string, unknown>) {
    if (!editingTask) throw new Error("No task selected");
    const updated = await tasksApi.update(editingTask.id, payload);
    toast.success("Task updated");
    await refreshTasksQuietly();
    return updated;
  }

  async function handleMarkComplete(task: TaskDto) {
    if (task.status === TaskStatus.done) return;

    try {
      await tasksApi.update(task.id, { status: TaskStatus.done });
      toast.success("Task marked complete");
      await refreshTasksQuietly();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to update task");
    }
  }

  async function confirmDelete() {
    if (!deleteTask) return;
    const task = deleteTask;
    const previous = data;

    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== task.id),
            pagination: {
              ...current.pagination,
              total: Math.max(0, current.pagination.total - 1),
            },
          }
        : current,
    );
    setDeleteTask(null);

    try {
      await tasksApi.delete(task.id);
      toast.success("Task deleted");
      await loadTasks();
    } catch (error) {
      if (previous) setData(previous);
      toast.error(error instanceof ApiClientError ? error.message : "Failed to delete task");
    }
  }

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  return (
    <AppShell
      eyebrow="Rival Tasks"
      title="Your tasks"
      userEmail={user?.email}
      onLogout={handleLogout}
      navLinks={
        user?.role === UserRole.admin ? (
          <Link href="/admin/tasks">
            <Button variant="outline">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        ) : null
      }
    >
      <TaskListToolbar
        status={status}
        sort={sort}
        order={order}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onStatusChange={(value) => updateParams({ status: value, page: "1" })}
        onSortChange={(value) => updateParams({ sort: value, page: "1" })}
        onOrderChange={(value) => updateParams({ order: value, page: "1" })}
        trailing={
          <Button className="hidden sm:inline-flex" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        }
      />

      {error ? (
        <div className="mb-4">
          <ErrorBanner message={error} onRetry={loadTasks} />
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <TaskRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && !error && data?.items.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-18rem)] w-full flex-1 items-center justify-center py-8">
          <EmptyState
            className="w-full max-w-none"
            title={hasActiveFilters ? "No tasks found" : "No tasks yet"}
            description={
              hasActiveFilters
                ? "No tasks match the current filters."
                : "Create your first task to start tracking your work."
            }
            actionLabel={hasActiveFilters ? undefined : "Create your first task"}
            onAction={hasActiveFilters ? undefined : openCreateModal}
          />
        </div>
      ) : null}

      {!loading && !error && data && data.items.length > 0 ? (
        <div className="space-y-4">
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
            <table className="min-w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {["Task", "Status", "Priority", "Due", "Actions"].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${index === 4 ? "text-right" : ""}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((task) => (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Created {formatDateTime(task.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge kind="status" value={task.status} />
                    </td>
                    <td className="px-4 py-4">
                      <Badge kind="priority" value={task.priority} />
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1.5">
                        {task.status !== TaskStatus.done ? (
                          <Button
                            variant="outline"
                            className="min-h-9 px-3"
                            onClick={() => handleMarkComplete(task)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="min-h-9 px-3"
                          onClick={() => setActivityTask(task)}
                        >
                          <History className="h-4 w-4" />
                          History
                        </Button>
                        <Button
                          variant="ghost"
                          className="min-h-9 px-3"
                          onClick={() => {
                            setEditingTask(task);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          aria-label="Delete task"
                          title="Delete task"
                          className="h-9 w-9 min-h-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTask(task)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-3 md:hidden"
          >
            {data.items.map((task) => (
              <motion.article
                key={task.id}
                variants={listItem}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{task.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due {formatDate(task.dueDate)} · Created {formatDateTime(task.createdAt)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge kind="status" value={task.status} />
                  <Badge kind="priority" value={task.priority} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {task.status !== TaskStatus.done ? (
                    <Button variant="outline" onClick={() => handleMarkComplete(task)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </Button>
                  ) : null}
                  <Button variant="ghost" onClick={() => setActivityTask(task)}>
                    <History className="h-4 w-4" />
                    History
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingTask(task);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="Delete task"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteTask(task)}
                  >
                    <X className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </div>
      ) : null}

      <motion.button
        type="button"
        aria-label="Create task"
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg sm:hidden"
        onClick={openCreateModal}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        onSubmit={editingTask ? handleUpdate : handleCreate}
      />

      <TaskActivityModal
        open={Boolean(activityTask)}
        task={activityTask}
        onClose={() => setActivityTask(null)}
      />

      <Dialog
        open={Boolean(deleteTask)}
        onClose={() => setDeleteTask(null)}
        title="Delete task?"
        description="This action cannot be undone."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTask(null)}
              className="min-h-11 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="min-h-11 w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete task
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-base font-medium text-foreground">
            {deleteTask ? `Delete "${deleteTask.title}"?` : "Delete this task?"}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            All activity history and attachments associated with this task will be permanently removed.
          </p>
        </div>
      </Dialog>
    </AppShell>
  );
}
