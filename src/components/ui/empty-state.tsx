"use client";

import { motion } from "framer-motion";
import { EmptyTasksIllustration } from "@/components/illustrations/empty-tasks-illustration";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact
          ? "rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10"
          : "w-full max-w-lg rounded-2xl border border-border bg-card/80 px-8 py-12 shadow-sm backdrop-blur",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          {icon}
        </div>
      ) : compact ? null : (
        <EmptyTasksIllustration className="mb-5 h-28 w-auto" />
      )}
      <h3 className="text-base font-semibold text-foreground sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button className="mt-6 min-h-11" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
}
