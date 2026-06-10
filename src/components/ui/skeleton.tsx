import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
    />
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <Skeleton className="mb-3 h-5 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
