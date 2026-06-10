import { cn } from "@/lib/utils";

const statusStyles = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

const priorityStyles = {
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const labels = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  low: "Low",
  medium: "Medium",
  high: "High",
};

type BadgeProps = {
  kind: "status" | "priority";
  value: keyof typeof statusStyles | keyof typeof priorityStyles;
  className?: string;
};

export function Badge({ kind, value, className }: BadgeProps) {
  const styles =
    kind === "status"
      ? statusStyles[value as keyof typeof statusStyles]
      : priorityStyles[value as keyof typeof priorityStyles];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
    >
      {labels[value as keyof typeof labels]}
    </span>
  );
}

export function NeutralBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
