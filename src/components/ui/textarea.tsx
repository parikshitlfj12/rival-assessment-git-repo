import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, disabled, ...props }, ref) => (
  <textarea
    ref={ref}
    disabled={disabled}
    className={cn(
      "flex min-h-28 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground",
      "placeholder:text-muted-foreground",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
