"use client";

import { TaskStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskActivityModal } from "@/components/tasks/task-activity-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { TaskRowSkeleton } from "@/components/ui/skeleton";
import {
  ApiClientError,
  authApi,
  formatDate,
  tasksApi,
  type TasksListResponse,
} from "@/lib/api-client";
import type { TaskDto, UserDto } from "@/lib/dto";

const statusFilters = [
  { label: "All", value: "" },
  { label: "Todo", value: TaskStatus.todo },
  { label: "In Progress", value: TaskStatus.in_progress },
  { label: "Done", value: TaskStatus.done },
] as const;

function buildQueryString(params: URLSearchParams) {
  const query = new URLSearchParams();
  for (const key of ["status", "search", "sort", "order", "page", "limit"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  return query.toString();
}

export function TasksPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserDto | null>(null);
  const [data, setData] = useState<TasksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [deleteTask, setDeleteTask] = useState<TaskDto | null>(null);
  const [activityTask, setActivityTask] = useState<TaskDto | null>(null);

  const queryString = useMemo(() => buildQueryString(searchParams), [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      router.replace(`/tasks?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tasksApi.list(queryString);
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
  }, [queryString, router]);

  useEffect(() => {
    authApi
      .me()
      .then((response) => setUser(response.user))
      .catch(() => router.push("/login"));
  }, [router]);

  // Data fetch on query change — standard client-side request lifecycle.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/query-change
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchInput !== current) {
        updateParams({ search: searchInput || null, page: "1" });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, updateParams]);

  async function handleLogout() {
    await authApi.logout();
    router.push("/login");
    router.refresh();
  }

  async function handleCreate(payload: Record<string, unknown>) {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: TaskDto = {
      id: tempId,
      userId: user?.id ?? "",
      title: String(payload.title ?? ""),
      description: (payload.description as string | undefined) ?? null,
      status: (payload.status as TaskDto["status"]) ?? TaskStatus.todo,
      priority: (payload.priority as TaskDto["priority"]) ?? "medium",
      dueDate: (payload.dueDate as string | null) ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previous = data;
    if (previous) {
      setData({
        ...previous,
        items: [optimisticTask, ...previous.items],
        pagination: {
          ...previous.pagination,
          total: previous.pagination.total + 1,
        },
      });
    }

    try {
      const created = await tasksApi.create(payload);
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === tempId ? created : item)),
            }
          : current,
      );
      toast.success("Task created");
      return created;
    } catch (error) {
      if (previous) setData(previous);
      toast.error(error instanceof ApiClientError ? error.message : "Failed to create task");
      throw error;
    }
  }

  async function handleUpdate(payload: Record<string, unknown>) {
    if (!editingTask) throw new Error("No task selected");
    const updated = await tasksApi.update(editingTask.id, payload);
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => (item.id === updated.id ? updated : item)),
          }
        : current,
    );
    toast.success("Task updated");
    return updated;
  }

  async function handleMarkComplete(task: TaskDto) {
    if (task.status === TaskStatus.done) return;

    const previous = data;
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === task.id ? { ...item, status: TaskStatus.done } : item,
            ),
          }
        : current,
    );

    try {
      const updated = await tasksApi.update(task.id, { status: TaskStatus.done });
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current,
      );
      toast.success("Task marked complete");
    } catch (error) {
      if (previous) setData(previous);
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

  const page = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";
  const status = searchParams.get("status") ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Rival Tasks
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Your tasks</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user?.role === UserRole.admin ? (
              <Link href="/admin/tasks">
                <Button variant="outline">Admin view</Button>
              </Link>
            ) : null}
            <ThemeToggle />
            {user ? (
              <span className="max-w-[180px] truncate text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
            ) : null}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={status === filter.value ? "primary" : "outline"}
                  onClick={() => updateParams({ status: filter.value || null, page: "1" })}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <Button
              className="hidden min-h-11 sm:inline-flex"
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
            >
              New task
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <Input
              placeholder="Search by title…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Select
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value, page: "1" })}
            >
              <option value="created_at">Created date</option>
              <option value="due_date">Due date</option>
              <option value="priority">Priority</option>
            </Select>
            <Select
              value={order}
              onChange={(event) => updateParams({ order: event.target.value, page: "1" })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
            <Button
              className="md:hidden"
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
            >
              New task
            </Button>
          </div>
        </div>

        {error ? <ErrorBanner message={error} onRetry={loadTasks} /> : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <TaskRowSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!loading && !error && data?.items.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Create your first task to start tracking your work."
            actionLabel="Create your first task"
            onAction={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
          />
        ) : null}

        {!loading && !error && data && data.items.length > 0 ? (
          <div className="space-y-4">
            <div className="hidden overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 md:block">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-100 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Due
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {data.items.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Created {formatDate(task.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge kind="status" value={task.status} />
                      </td>
                      <td className="px-4 py-4">
                        <Badge kind="priority" value={task.priority} />
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {task.status !== TaskStatus.done ? (
                            <Button variant="outline" onClick={() => handleMarkComplete(task)}>
                              Complete
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            onClick={() => setActivityTask(task)}
                          >
                            History
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingTask(task);
                              setModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button variant="destructive" onClick={() => setDeleteTask(task)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {data.items.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Due {formatDate(task.dueDate)} · Created {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge kind="status" value={task.status} />
                    <Badge kind="priority" value={task.priority} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {task.status !== TaskStatus.done ? (
                      <Button variant="outline" onClick={() => handleMarkComplete(task)}>
                        Complete
                      </Button>
                    ) : null}
                    <Button variant="ghost" onClick={() => setActivityTask(task)}>
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingTask(task);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteTask(task)}>
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
          </div>
        ) : null}
      </main>

      <button
        type="button"
        aria-label="Create task"
        className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg sm:hidden"
        onClick={() => {
          setEditingTask(null);
          setModalOpen(true);
        }}
      >
        +
      </button>

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

      <Dialog open={Boolean(deleteTask)} onClose={() => setDeleteTask(null)} title="Delete task">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Delete this task? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTask(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
