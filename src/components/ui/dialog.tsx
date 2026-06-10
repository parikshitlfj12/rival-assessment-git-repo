"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId } from "react";
import { cn } from "@/lib/utils";

type DialogSize = "md" | "lg" | "xl";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  hideCloseButton?: boolean;
  contentClassName?: string;
};

const sizeClasses: Record<DialogSize, string> = {
  md: "sm:max-w-[34rem]",
  lg: "sm:max-w-[44rem]",
  xl: "sm:max-w-[54rem]",
};

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

const panelMotion = {
  initial: { opacity: 0, y: 18, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.6 },
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideCloseButton = false,
  contentClassName,
}: DialogProps) {
  const reactId = useId();
  const titleId = `dialog-title-${reactId}`;
  const descriptionId = `dialog-description-${reactId}`;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog overlay"
            {...overlayMotion}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            {...panelMotion}
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
              "max-h-[min(92dvh,48rem)]",
              sizeClasses[size],
            )}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-card px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0 flex-1">
                <h2
                  id={titleId}
                  className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl"
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              {!hideCloseButton ? (
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={onClose}
                  className={cn(
                    "-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
                    "hover:bg-muted hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </header>

            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6",
                contentClassName,
              )}
            >
              {children}
            </div>

            {footer ? (
              <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-5 py-4 sm:gap-3 sm:px-7 sm:py-5">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
