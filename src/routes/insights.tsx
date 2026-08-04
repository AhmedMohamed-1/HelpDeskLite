import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTickets, useUsers } from "@/lib/use-tickets";
import { OPEN_STATUSES, STATUSES, isDelayed, isOpen, ticketRef, timeAgo } from "@/lib/tickets";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — HelpDesk Lite" },
      {
        name: "description",
        content: "Manager dashboard: open work by status, delayed tickets and support workload.",
      },
      { property: "og:title", content: "Insights — HelpDesk Lite" },
      { property: "og:description", content: "Open work, delays and workload at a glance." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Insights />
    </RequireAuth>
  ),
});

function Insights() {
  const { profile } = useAuth();
  const tickets = useTickets();
  const users = useUsers();

  if (profile?.role !== "manager") {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-muted-foreground">The insights dashboard is manager-only.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  if (!tickets) return <div className="panel p-8 text-sm text-muted-foreground">Loading…</div>;

  const open = tickets.filter(isOpen);
  const delayed = tickets.filter((t) => isDelayed(t));
  const resolved = tickets.filter((t) => t.status === "Resolved");
  const closed = tickets.filter((t) => t.status === "Closed");
  const supportUsers = users.filter((u) => u.role === "support" || u.role === "manager");

  const stats = [
    { label: "Open tickets", value: open.length },
    { label: "Delayed", value: delayed.length },
    { label: "Resolved", value: resolved.length },
    { label: "Closed", value: closed.length },
  ];

  const maxLoad = Math.max(
    1,
    ...supportUsers.map((u) => open.filter((t) => t.assigneeId === u.uid).length),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Insights</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Delay thresholds: High 8h, Medium 24h, Low 72h from submission while still open.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-mono text-3xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-base font-semibold">Open tickets by status</h2>
          <ul className="mt-4 space-y-3">
            {STATUSES.map((s) => {
              const count = tickets.filter((t) => t.status === s).length;
              const total = Math.max(1, tickets.length);
              return (
                <li key={s}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <StatusBadge status={s} />
                      {!OPEN_STATUSES.includes(s) && (
                        <span className="text-xs text-muted-foreground">final</span>
                      )}
                    </span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel p-6">
          <h2 className="text-base font-semibold">Open workload per support member</h2>
          {supportUsers.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No support members yet.</p>
          )}
          <ul className="mt-4 space-y-3">
            {supportUsers.map((u) => {
              const count = open.filter((t) => t.assigneeId === u.uid).length;
              return (
                <li key={u.uid}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{u.name || u.email}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full bg-chart-2"
                      style={{ width: `${(count / maxLoad) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
            <li className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Unassigned open</span>
              <span className="font-mono">{open.filter((t) => !t.assigneeId).length}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="panel mt-6 p-6">
        <h2 className="text-base font-semibold">Delayed tickets</h2>
        {delayed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing past its SLA. Good state.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {delayed.map((t) => (
              <li key={t.id}>
                <Link
                  to="/tickets/$ticketId"
                  params={{ ticketId: t.id }}
                  className="-mx-2 block rounded-md px-2 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {ticketRef(t.id)}
                    </span>
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    <DelayBadge />
                  </div>
                  <div className="mt-1 text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    open since {timeAgo(t.createdAt)} ·{" "}
                    {t.assigneeName ?? "unassigned"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
