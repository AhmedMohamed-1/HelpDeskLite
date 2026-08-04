import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "./AppHeader";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="aurora-blob animate-aurora -left-40 top-[-10rem] size-[32rem] opacity-25"
        aria-hidden
      />
      <div
        className="aurora-blob animate-aurora -right-40 top-[30rem] size-[26rem] opacity-15"
        aria-hidden
      />
      <div className="relative">
        <AppHeader />
        <main className="mx-auto max-w-6xl animate-fade-up px-4 py-8">{children}</main>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <AppShell>
        <div className="panel flex items-center justify-center gap-3 p-10 text-sm text-muted-foreground">
          <span className="size-2 animate-ping rounded-full bg-primary" />
          Loading…
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="panel mx-auto max-w-md animate-scale-in p-8 text-center">
          <h1 className="font-display text-lg font-semibold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to view the ticket workspace.
          </p>
          <Button className="mt-5 rounded-full hover-lift" asChild>
            <Link to="/auth" search={{ mode: "signin" }}>
              Sign in
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
