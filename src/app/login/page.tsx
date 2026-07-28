"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";
import { Button } from "@/components/shared/Button";
import { Label } from "@/components/shared/FormFields";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h2 className="mb-2 text-2xl font-semibold">Adult Creator Lab sign in</h2>
      <p className="mb-6 text-sm text-muted">
        Invite-only adult access for Connected Mode. No public learner signup. Demo Mode
        remains available without an account.
      </p>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="next" value="/creator" />
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/" className="text-primary underline">
          Continue in Anonymous Demo Mode
        </Link>
      </p>
    </div>
  );
}
