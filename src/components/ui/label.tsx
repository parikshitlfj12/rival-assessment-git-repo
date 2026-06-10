import { cn } from "@/lib/utils";
import { LabelHTMLAttributes, forwardRef } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-foreground/90", className)}
      {...props}
    />
  ),
);

Label.displayName = "Label";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}
