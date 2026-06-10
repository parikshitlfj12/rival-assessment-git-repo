import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-4 w-4 border-2",
  lg: "h-5 w-5 border-2",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "spinner inline-block rounded-full border-current border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
