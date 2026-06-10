"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      aria-label="Toggle theme"
      className="min-w-11 px-3"
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span suppressHydrationWarning>{isDark ? "☀️" : "🌙"}</span>
    </Button>
  );
}
