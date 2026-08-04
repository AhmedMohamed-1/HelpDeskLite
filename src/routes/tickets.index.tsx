import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { RequireAuth } from "@/components/AppShell";
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useTickets } from "@/lib/use-tickets";
import { STATUSES, isDelayed, ticketRef, timeAgo } from "@/lib/tickets";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "Tickets — HelpDesk Lite" },
      { name: "description", content: "Browse, filter and follow internal support tickets." },
      { property: "og:title", content: "Tickets — HelpDesk Lite" },
      { property: "og:description", content: "Every internal support request in one queue." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TicketsPage />
    </RequireAuth>
  ),
});

function TicketsPage() {
  const { profile } = useAuth();
  const all = useTickets();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const tickets = useMemo(() => {
    if (!all || !profile) return null;
    return all
      .filter((t) => profile.role === "employee" ? t.submitterId === profile.uid : true)
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) =>
        q.trim()
          ? (t.title + t.description + ticketRef(t.id)).toLowerCase().includes(q.toLowerCase())
          : true,
      );
  }, [all, profile, status, q]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.role === "employee"
              ? "Your submitted requests."
              : "Every request across the organisation."}
          </p>
        </div>
        <Button asChild>
          <Link to="/tickets/new">
            <Plus className="size-4" /> New ticket
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tickets"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="panel mt-6 divide-y divide-border">
        {!tickets && <div className="p-8 text-sm text-muted-foreground">Loading tickets…</div>}
        {tickets && tickets.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No tickets match this view yet.</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link to="/tickets/new">Submit a request</Link>
            </Button>
          </div>
        )}
        {tickets?.map((t) => (
          <Link
            key={t.id}
            to="/tickets/$ticketId"
            params={{ ticketId: t.id }}
            className="block px-5 py-4 transition-colors hover:bg-secondary/60"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{ticketRef(t.id)}</span>
              <StatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
              {isDelayed(t) && <DelayBadge />}
            </div>
            <div className="mt-1.5 font-medium">{t.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t.category} · {t.submitterName} · {timeAgo(t.createdAt)} ·{" "}
              {t.assigneeName ? `Assigned to ${t.assigneeName}` : "Unassigned"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
