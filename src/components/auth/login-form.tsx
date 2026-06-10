"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiClientError, authApi } from "@/lib/api-client";
import { loginSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFields({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextFields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "_form";
        nextFields[key] = issue.message;
      }
      setFields(nextFields);
      return;
    }

    setLoading(true);
    try {
      await authApi.login(parsed.data.email, parsed.data.password);
      router.push("/tasks");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.fields) setFields(error.fields);
      } else {
        setFormError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={loading}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FieldError message={fields.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={loading}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <FieldError message={fields.password} />
      </div>
      <Button type="submit" className="w-full" loading={loading} loadingText="Signing in…">
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
