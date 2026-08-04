import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/tickets";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search['mode'] === "signup" ? "signup" : "signin") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — HelpDesk Lite" },
      { name: "description", content: "Sign in or create your HelpDesk Lite account." },
      { property: "og:title", content: "Sign in — HelpDesk Lite" },
      { property: "og:description", content: "Access the internal support ticketing workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) navigate({ to: "/tickets" });
  }, [profile, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Please enter your full name.");
        await signUp(name.trim(), email.trim(), password, role);
        toast.success("Account created");
      } else {
        await signIn(email.trim(), password);
        toast.success("Signed in");
      }
      navigate({ to: "/tickets" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="panel p-8">
          <h1 className="text-xl font-semibold">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Pick the role that matches how you'll use the workspace."
              : "Welcome back to HelpDesk Lite."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await signInWithGoogle(mode === "signup" ? role : undefined);
                toast.success("Signed in with Google");
                navigate({ to: "/tickets" });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Google sign-in failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.5 5.5 0 0 1-2.4 3.6v3h3.88c2.27-2.09 3.57-5.17 3.57-8.78Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.29 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.28a12 12 0 0 0 0 10.74l4.01-3.1Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.1C6.23 6.87 8.88 4.76 12 4.76Z"
              />
            </svg>
            Continue with Google
          </Button>


          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "No account yet? "}
            <Link
              to="/auth"
              search={{ mode: mode === "signup" ? "signin" : "signup" }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
