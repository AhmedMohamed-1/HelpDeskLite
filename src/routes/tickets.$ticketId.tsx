import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/AppShell";
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useTicket, useUsers, updateTicket, addNote } from "@/lib/use-tickets";
import {
  TRANSITIONS,
  PRIORITIES,
  SLA_HOURS,
  canManage,
  isDelayed,
  ticketRef,
  timeAgo,
  type Priority,
  type Status,
} from "@/lib/tickets";

export const Route = createFileRoute("/tickets/$ticketId")({
  head: () => ({
    meta: [
      { title: "Ticket detail — HelpDesk Lite" },
      { name: "description", content: "Follow a support ticket through its workflow." },
      { property: "og:title", content: "Ticket detail — HelpDesk Lite" },
      { property: "og:description", content: "Status, ownership and notes for a support ticket." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TicketDetail />
    </RequireAuth>
  ),
});

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const { profile } = useAuth();
  const ticket = useTicket(ticketId);
  const users = useUsers();
  const [note, setNote] = useState("");

  if (ticket === undefined) {
    return <div className="panel p-8 text-sm text-muted-foreground">Loading ticket…</div>;
  }
  if (!ticket || !profile) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-muted-foreground">This ticket doesn't exist.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }
  if (profile.role === "employee" && ticket.submitterId !== profile.uid) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Employees can only view their own tickets.
        </p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  const editable = canManage(profile.role);
  const supportUsers = users.filter((u) => u.role === "support" || u.role === "manager");
  const notes = Object.entries(ticket.notes ?? {})
    .map(([id, n]) => ({ ...n, id }))
    .sort((a, b) => a.createdAt - b.createdAt);

  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to tickets
        </Link>
        <div className="panel mt-3 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {ticketRef(ticket.id)}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {isDelayed(ticket) && <DelayBadge />}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{ticket.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {ticket.category} · submitted by {ticket.submitterName} · {timeAgo(ticket.createdAt)} ·
            SLA {SLA_HOURS[ticket.priority]}h
          </p>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </div>

        <div className="panel mt-6 p-6">
          <h2 className="text-base font-semibold">Notes</h2>
          {notes.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No notes yet.</p>
          )}
          <ul className="mt-4 space-y-4">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border border-border bg-secondary/50 p-4">
                <div className="text-xs text-muted-foreground">
                  {n.authorName} · {timeAgo(n.createdAt)}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm">{n.body}</p>
              </li>
            ))}
          </ul>

          {editable && ticket.status !== "Closed" && (
            <div className="mt-5 space-y-3">
              <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a working note"
              />
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() =>
                  act(async () => {
                    await addNote(ticket.id, profile, note.trim());
                    setNote("");
                  }, "Note added")
                }
              >
                Add note
              </Button>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="panel p-5">
          <h2 className="text-sm font-semibold">Workflow</h2>
          {!editable ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Employees can't update a ticket after submission. Support will take it from here.
            </p>
          ) : TRANSITIONS[ticket.status].length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Closed is a final state — no further transitions.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {TRANSITIONS[ticket.status].map((s: Status) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === "Closed" ? "outline" : "default"}
                  onClick={() =>
                    act(() => updateTicket(ticket.id, { status: s }), `Moved to ${s}`)
                  }
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="panel space-y-4 p-5">
          <div>
            <Label className="text-xs text-muted-foreground">Assignee</Label>
            {editable ? (
              <Select
                value={ticket.assigneeId ?? "unassigned"}
                onValueChange={(v) => {
                  const u = supportUsers.find((x) => x.uid === v);
                  act(
                    () =>
                      updateTicket(ticket.id, {
                        assigneeId: u ? u.uid : null,
                        assigneeName: u ? u.name || u.email : null,
                        status: u && ticket.status === "New" ? "Assigned" : ticket.status,
                      }),
                    u ? `Assigned to ${u.name || u.email}` : "Unassigned",
                  );
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {supportUsers.map((u) => (
                    <SelectItem key={u.uid} value={u.uid}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm">{ticket.assigneeName ?? "Unassigned"}</p>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Priority</Label>
            {editable ? (
              <Select
                value={ticket.priority}
                onValueChange={(v) =>
                  act(
                    () => updateTicket(ticket.id, { priority: v as Priority }),
                    "Priority updated",
                  )
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p} — {SLA_HOURS[p]}h SLA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="mt-1 text-sm">{ticket.priority}</p>
            )}
          </div>

          <div className="border-t border-border pt-4 text-xs text-muted-foreground">
            Last updated {timeAgo(ticket.updatedAt)}
          </div>
        </div>

        {editable && ticket.assigneeId !== profile.uid && ticket.status !== "Closed" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              act(
                () =>
                  updateTicket(ticket.id, {
                    assigneeId: profile.uid,
                    assigneeName: profile.name || profile.email,
                    status: ticket.status === "New" ? "Assigned" : ticket.status,
                  }),
                "Assigned to you",
              )
            }
          >
            Take ownership
          </Button>
        )}
      </aside>
    </div>
  );
}
