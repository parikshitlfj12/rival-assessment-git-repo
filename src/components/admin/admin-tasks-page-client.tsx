"use client";

import { UserRole } from "@prisma/client";
import { motion } from "framer-motion";
import { LayoutList, Paperclip } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminAttachmentsModal } from "@/components/admin/admin-attachments-modal";
import { AppShell } from "@/components/layout/app-shell";
import { listContainer, listItem } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Pagination } from "@/components/ui/pagination";
import { TaskRowSkeleton } from "@/components/ui/skeleton";
import {
  adminApi,
  ApiClientError,
  authApi,
  formatDate,
  type AdminTasksListResponse,
} from "@/lib/api-client";
import type { AdminTaskDto, UserDto } from "@/lib/dto";
import { TaskListToolbar } from "@/components/tasks/task-list-toolbar";
import { useTaskListParams } from "@/hooks/use-task-list-params";

export function AdminTasksPageClient() {
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
  } = useTaskListParams({ basePath: "/admin/tasks" });

  const [user, setUser] = useState<UserDto | null>(null);
  const [data, setData] = useState<AdminTasksListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachmentsTask, setAttachmentsTask] = useState<AdminTaskDto | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.list(listQueryString);
      if (result.pagination.total > 0 && page > result.pagination.totalPages) {
        updateParams({ page: String(result.pagination.totalPages) });
        return;
      }
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
  }, [listQueryString, page, router, updateParams]);

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
    void loadTasks();
  }, [loadTasks, user?.role]);

  async function handleLogout() {
    await authApi.logout();
    router.push("/login");
    router.refresh();
  }

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
      <TaskListToolbar
        status={status}
        sort={sort}
        order={order}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onStatusChange={(value) => updateParams({ status: value, page: "1" })}
        onSortChange={(value) => updateParams({ sort: value, page: "1" })}
        onOrderChange={(value) => updateParams({ order: value, page: "1" })}
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
      ) : !data?.items.length ? (
        <div className="flex min-h-[calc(100dvh-18rem)] w-full flex-1 items-center justify-center py-8">
          <EmptyState
            className="w-full max-w-none"
            title="No tasks found"
            description="No tasks match the current filters."
          />
        </div>
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
                      {task.attachmentCount > 0 ? (
                        <Button
                          variant="ghost"
                          className="min-h-9 px-3 text-xs"
                          onClick={() => setAttachmentsTask(task)}
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachments
                        </Button>
                      ) : null}
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
                  {task.attachmentCount > 0 ? (
                    <Button
                      variant="outline"
                      className="min-h-9 px-3 text-xs"
                      onClick={() => setAttachmentsTask(task)}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments
                    </Button>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div className="mt-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
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
