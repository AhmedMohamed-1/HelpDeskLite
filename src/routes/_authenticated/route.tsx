import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";
import { AppHeader } from "@/components/AppHeader";
import { useRoles, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return { user: undefined };
    }

    await auth.authStateReady();
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return { user: { id: firebaseUser.uid, email: firebaseUser.email ?? undefined } };
    }

    throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = useSession();
  const { roles } = useRoles(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    auth.authStateReady().then(() => {
      if (!auth.currentUser) {
        navigate({ to: "/auth", replace: true });
      }
    });
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader roles={roles} email={user?.email ?? undefined} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
