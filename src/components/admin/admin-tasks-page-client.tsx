"use client";

import { TaskStatus, UserRole } from "@prisma/client";
import { motion } from "framer-motion";
import { LayoutList, Paperclip, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAttachmentsModal } from "@/components/admin/admin-attachments-modal";
import { AppShell } from "@/components/layout/app-shell";
import { listContainer, listItem } from "@/components/motion/fade-in";
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
import type { AdminTaskDto, UserDto } from "@/lib/dto";

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
  const [attachmentsTask, setAttachmentsTask] = useState<AdminTaskDto | null>(null);

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
    <AppShell
      eyebrow="Admin"
      title="All users' tasks"
      eyebrowClassName="text-amber-600 dark:text-amber-400"
      userEmail={user?.email}
      onLogout={handleLogout}
      navLinks={
        <Link href="/tasks">
          <Button variant="outline">
            <LayoutList className="h-4 w-4" />
            My tasks
          </Button>
        </Link>
      }
    >
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {statusFilters.map((filter) => (
            <Button
              key={filter.label}
              variant={status === filter.value ? "primary" : "ghost"}
              className="min-h-9 rounded-xl"
              onClick={() => updateParams({ status: filter.value || null, page: "1" })}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by title…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
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
      ) : !data?.items.length ? (
        <EmptyState title="No tasks found" description="No tasks match the current filters." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
            <table className="min-w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  {["Title", "Owner", "Status", "Priority", "Due", ""].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{task.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{task.ownerEmail}</td>
                    <td className="px-4 py-3">
                      <Badge kind="status" value={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge kind="priority" value={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        className="min-h-9 px-3 text-xs"
                        onClick={() => setAttachmentsTask(task)}
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Attachments
                      </Button>
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
                <h2 className="font-semibold text-foreground">{task.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{task.ownerEmail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge kind="status" value={task.status} />
                  <Badge kind="priority" value={task.priority} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Due {formatDate(task.dueDate)}</p>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="min-h-9 px-3 text-xs"
                    onClick={() => setAttachmentsTask(task)}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attachments
                  </Button>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
          </div>
        </>
      )}

      <AdminAttachmentsModal
        open={attachmentsTask !== null}
        task={attachmentsTask}
        onClose={() => setAttachmentsTask(null)}
      />
    </AppShell>
  );
}
