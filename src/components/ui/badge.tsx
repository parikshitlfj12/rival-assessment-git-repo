import { cn } from "@/lib/utils";

const statusStyles = {
  todo: "bg-muted text-muted-foreground ring-muted-foreground/20",
  in_progress: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  done: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground ring-muted-foreground/20",
  medium: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  high: "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
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
        "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-border",
        className,
      )}
    >
      {children}
    </span>
  );
}
