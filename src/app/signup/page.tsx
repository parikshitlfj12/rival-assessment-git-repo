import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-6">
        <Link href="/" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Rival Tasks
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-md px-4 pb-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Create account</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start organizing your tasks in minutes.
          </p>
          <div className="mt-6">
            <SignupForm />
          </div>
        </div>
      </main>
    </div>
  );
}
