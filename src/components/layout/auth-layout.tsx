import Link from "next/link";
import { AuthIllustration } from "@/components/illustrations/auth-illustration";
import { FadeIn } from "@/components/motion/fade-in";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
          Rival Tasks
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:px-6">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeIn className="hidden lg:block">
            <AuthIllustration className="mx-auto w-full max-w-md drop-shadow-sm" />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Organize work, track progress, and stay in sync.
            </p>
          </FadeIn>

          <FadeIn delay={0.05} className="mx-auto w-full max-w-md lg:max-w-lg">
            <div className="rounded-2xl border border-border bg-card/95 p-6 shadow-lg backdrop-blur sm:p-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              <div className="mt-6">{children}</div>
            </div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
