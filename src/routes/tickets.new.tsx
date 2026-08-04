import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { createTicket } from "@/lib/use-tickets";
import { CATEGORIES, PRIORITIES, SLA_HOURS, type Category, type Priority } from "@/lib/tickets";

export const Route = createFileRoute("/tickets/new")({
  head: () => ({
    meta: [
      { title: "New ticket — HelpDesk Lite" },
      { name: "description", content: "Submit an internal support request with full context." },
      { property: "og:title", content: "New ticket — HelpDesk Lite" },
      { property: "og:description", content: "Submit an internal support request." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewTicket />
    </RequireAuth>
  ),
});

function NewTicket() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Hardware");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (title.trim().length < 5 || title.trim().length > 120) {
      toast.error("Title must be between 5 and 120 characters.");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Please describe what happened and what you tried.");
      return;
    }
    setBusy(true);
    try {
      const id = await createTicket(
        { title: title.trim(), description: description.trim(), category, priority },
        profile,
      );
      toast.success("Ticket submitted");
      navigate({ to: "/tickets/$ticketId", params: { ticketId: id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit ticket");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tickets
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">New support request</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Attachments are out of scope for v1 — paste links in the description.
      </p>

      <form className="panel mt-6 space-y-5 p-6" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary"
            maxLength={120}
            required
          />
          <p className="text-xs text-muted-foreground">{title.length}/120 · minimum 5 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened, and what you already tried"
            rows={7}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
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
          </div>
        </div>

        <div className="rounded-md bg-secondary p-4 text-xs text-muted-foreground">
          Submitter and ticket ID are captured automatically on submission.
        </div>

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Submitting…" : "Submit ticket"}
        </Button>
      </form>
    </div>
  );
}
