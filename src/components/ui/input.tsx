import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, disabled, ...props }, ref) => (
    <input
      ref={ref}
      disabled={disabled}
      className={cn(
        "flex min-h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
