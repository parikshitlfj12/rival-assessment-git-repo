import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { FadeIn } from "@/components/motion/fade-in";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-35" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Rival Tasks</p>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Focused task management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Ship your work with clarity and calm.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Create, filter, and complete tasks with a polished interface built for fast daily use —
              search, sort, real-time updates, and attachments included.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button className="min-h-11 w-full px-6 sm:w-auto">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="min-h-11 w-full px-6 sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
            <ul className="mt-10 space-y-3">
              {[
                "Smart filters, search, and sorting",
                "Optimistic updates with live sync",
                "Activity history and file attachments",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.08} className="hidden lg:block">
            <HeroIllustration className="mx-auto w-full max-w-lg drop-shadow-md" />
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
