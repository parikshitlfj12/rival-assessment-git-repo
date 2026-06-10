"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const active = (theme as ThemeOption) ?? "system";
  const isDark = mounted && resolvedTheme === "dark";
  const TriggerIcon = isDark ? Moon : Sun;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!mounted}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-sm transition-all",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !mounted && "opacity-60",
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex"
          >
            <TriggerIcon className="h-4 w-4" />
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg shadow-black/5"
          >
            {OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = active === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setTheme(value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-muted",
                    selected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{label}</span>
                  {selected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
