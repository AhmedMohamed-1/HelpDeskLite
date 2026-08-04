import { Link, useNavigate } from "@tanstack/react-router";
import { LifeBuoy, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/tickets";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navLink =
    "relative rounded-full px-3.5 py-1.5 text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:flex">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <img
            src="/HD.png"
            alt="HelpDesk Lite"
            className="size-14 shrink-0 rounded-xl object-contain transition-transform duration-500 group-hover:rotate-12"
          />
          <span className="truncate font-display text-sm font-bold tracking-tight">
            HelpDesk Lite
          </span>
        </Link>

        {profile && (
          <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
            <Link to="/tickets" className={navLink} activeProps={{ className: "bg-secondary text-foreground" }}>
              Tickets
            </Link>
            {profile.role === "manager" && (
              <>
                <Link to="/insights" className={navLink} activeProps={{ className: "bg-secondary text-foreground" }}>
                  Insights
                </Link>
                <Link to="/team" className={navLink} activeProps={{ className: "bg-secondary text-foreground" }}>
                  Team
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {profile ? (
            <>
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-medium">{profile.name}</div>
                <div className="text-xs text-muted-foreground">{ROLE_LABEL[profile.role]}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                className="rounded-full hover-lift"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/auth" search={{ mode: "signin" }}>
                  Sign in
                </Link>
              </Button>
              <Button size="sm" className="rounded-full hover-lift glow-ring" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
