import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Rival Tasks
        </p>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Stay on top of your work with a focused task manager.
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Create, filter, and complete tasks with a clean interface built for fast daily use.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
