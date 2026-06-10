import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} />;
}

export function TaskRowSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <Skeleton className="mb-3 h-5 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-1/3" />
    </div>
  );
}

export function AttachmentRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

export function ActivityRowSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
