import { Suspense } from "react";
import { AdminTasksPageClient } from "@/components/admin/admin-tasks-page-client";
import { TaskRowSkeleton } from "@/components/ui/skeleton";

export default function AdminTasksPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <TaskRowSkeleton key={index} />
          ))}
        </div>
      }
    >
      <AdminTasksPageClient />
    </Suspense>
  );
}
