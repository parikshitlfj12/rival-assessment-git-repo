"use client";

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  eyebrow: string;
  title: string;
  eyebrowClassName?: string;
  navLinks?: React.ReactNode;
  userEmail?: string | null;
  onLogout: () => void;
  children: React.ReactNode;
};

export function AppShell({
  eyebrow,
  title,
  eyebrowClassName,
  navLinks,
  userEmail,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Link href="/" className="inline-block">
              <p
                className={`text-xs font-bold uppercase tracking-[0.22em] ${eyebrowClassName ?? "text-primary"}`}
              >
                {eyebrow}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            </Link>
          </motion.div>
          <div className="flex flex-wrap items-center gap-2">
            {navLinks}
            <ThemeToggle />
            {userEmail ? (
              <span className="hidden max-w-[200px] truncate rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground sm:inline-block">
                {userEmail}
              </span>
            ) : null}
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
