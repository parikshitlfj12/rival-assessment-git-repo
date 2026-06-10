import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "ghost" | "destructive" | "outline" | "secondary";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)] focus-visible:ring-ring",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-ring",
  ghost:
    "bg-transparent text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 focus-visible:ring-destructive",
  outline:
    "border border-border bg-card text-foreground shadow-sm hover:bg-muted focus-visible:ring-ring",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      type = "button",
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          variants[variant],
          className,
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" className="shrink-0" /> : null}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = "Button";
