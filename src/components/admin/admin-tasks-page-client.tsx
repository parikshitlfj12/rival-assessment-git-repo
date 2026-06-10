"use client";

import { TaskStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { TaskRowSkeleton } from "@/components/ui/skeleton";
import {
  adminApi,
  ApiClientError,
  authApi,
  formatDate,
  type AdminTasksListResponse,
} from "@/lib/api-client";
import type { UserDto } from "@/lib/dto";

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

export function AdminTasksPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserDto | null>(null);
  const [data, setData] = useState<AdminTasksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const queryString = useMemo(() => buildQueryString(searchParams), [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      router.replace(`/admin/tasks?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.list(queryString);
      setData(result);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        router.push("/login?from=/admin/tasks");
        return;
      }
      if (err instanceof ApiClientError && err.status === 403) {
        router.push("/tasks");
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
      .then((response) => {
        if (response.user.role !== UserRole.admin) {
          router.push("/tasks");
          return;
        }
        setUser(response.user);
      })
      .catch(() => router.push("/login?from=/admin/tasks"));
  }, [router]);

  useEffect(() => {
    if (user?.role !== UserRole.admin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-query-change
    void loadTasks();
  }, [loadTasks, user?.role]);

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

  const page = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";
  const status = searchParams.get("status") ?? "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              Admin
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              All users&apos; tasks
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tasks">
              <Button variant="outline">My tasks</Button>
            </Link>
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

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
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
          </div>
        </div>

        {error ? <ErrorBanner message={error} onRetry={loadTasks} /> : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <TaskRowSkeleton key={index} />
            ))}
          </div>
        ) : !data?.items.length ? (
          <EmptyState title="No tasks found" description="No tasks match the current filters." />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 md:block">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-100/80 dark:bg-zinc-900/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Due
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {data.items.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {task.ownerEmail}
                      </td>
                      <td className="px-4 py-3">
                        <Badge kind="status" value={task.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge kind="priority" value={task.priority} />
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {formatDate(task.dueDate)}
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
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.ownerEmail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge kind="status" value={task.status} />
                    <Badge kind="priority" value={task.priority} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">Due {formatDate(task.dueDate)}</p>
                </article>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
          </>
        )}
      </main>
    </div>
  );
}
