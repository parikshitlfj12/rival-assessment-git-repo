import { Suspense } from "react";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";
import { TaskRowSkeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
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
      <TasksPageClient />
    </Suspense>
  );
}
