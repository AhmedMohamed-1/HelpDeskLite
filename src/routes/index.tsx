import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  GaugeCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/badges";
import { STATUSES, TRANSITIONS, SLA_HOURS } from "@/lib/tickets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HelpDesk Lite — Internal Support Ticketing" },
      {
        name: "description",
        content:
          "Employees submit requests, support staff take ownership, managers see delays and workload. Internal support ticketing, v1.",
      },
      { property: "og:title", content: "HelpDesk Lite — Internal Support Ticketing" },
      {
        property: "og:description",
        content:
          "Employees submit requests, support staff take ownership, managers see delays and workload. Internal support ticketing, v1.",
      },
    ],
  }),
  component: Landing,
});

const ROLE_CARDS = [
  {
    icon: ClipboardList,
    role: "Employee",
    rows: [
      ["View", "only their own tickets"],
      ["Create", "new support requests"],
      ["Update", "nothing after submission"],
      ["Assign", "no"],
      ["Resolve", "no"],
    ],
  },
  {
    icon: ShieldCheck,
    role: "Support Staff",
    rows: [
      ["View", "all tickets and details"],
      ["Create", "tickets (own or on behalf)"],
      ["Update", "status, priority, notes"],
      ["Assign", "to self or another support member"],
      ["Resolve", "yes — resolve and close"],
    ],
  },
  {
    icon: GaugeCircle,
    role: "Manager",
    rows: [
      ["View", "all tickets plus the insights dashboard"],
      ["Create", "tickets"],
      ["Update", "everything support staff can"],
      ["Assign", "yes, including reassignment"],
      ["Resolve", "yes, plus manage user roles"],
    ],
  },
];

const FIELDS = [
  ["Title", "Required · short summary, 5–120 characters"],
  ["Description", "Required · what happened and what was tried"],
  ["Category", "Required · Hardware, Software, Network, Access, Facilities, Other"],
  ["Priority", "Required · Low, Medium, High (drives the SLA)"],
  ["Submitter & ticket ID", "Automatic · captured on submission"],
  ["Attachments", "Out of scope for v1 — links can be pasted in the description"],
];

const PREVIEW_ROWS = [
  { id: "HD-1042", title: "Laptop won't boot after update", status: "In Progress" as const, priority: "High" as const, delayed: true },
  { id: "HD-1041", title: "VPN access for new contractor", status: "Assigned" as const, priority: "Medium" as const, delayed: false },
  { id: "HD-1039", title: "Meeting room display flickering", status: "New" as const, priority: "Low" as const, delayed: false },
  { id: "HD-1035", title: "Payroll export permissions", status: "Resolved" as const, priority: "Medium" as const, delayed: false },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="aurora-blob animate-aurora -left-32 -top-40 size-[34rem] opacity-20" aria-hidden />
      <div className="aurora-blob animate-aurora right-[-14rem] top-24 size-[28rem] opacity-15" aria-hidden />

      <div className="relative">
        <AppHeader />

        {/* Split-screen hero */}
        <section className="relative border-b border-border/70">
          <div
            className="grid-bg pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary-glow">
                <Sparkles className="size-3.5" />
                Internal support ticketing · v1
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                One place for every{" "}
                <span className="text-gradient">internal support request.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Employees submit requests with the information support actually needs. Support staff
                take ownership and move tickets through a clear workflow. Managers see open work,
                delays, and who is carrying the load.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="lg" className="group rounded-full glow-ring hover-lift" asChild>
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full hover-lift" asChild>
                  <Link to="/auth" search={{ mode: "signin" }}>
                    Sign in
                  </Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-4">
                {[
                  ["6", "workflow states"],
                  ["3", "permission roles"],
                  ["8h", "high-priority SLA"],
                ].map(([v, k], i) => (
                  <div
                    key={k}
                    className="animate-fade-up"
                    style={{ animationDelay: `${300 + i * 120}ms` }}
                  >
                    <dt className="font-display text-2xl font-bold text-gradient">{v}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{k}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Live-looking queue preview */}
            <div className="animate-scale-in [animation-delay:200ms]">
              <div className="panel animate-float overflow-hidden p-1.5">
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="size-2.5 rounded-full bg-destructive/70" />
                  <span className="size-2.5 rounded-full bg-warning/70" />
                  <span className="size-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 font-mono text-xs text-muted-foreground">ticket queue</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-2">
                  {PREVIEW_ROWS.map((r, i) => (
                    <div
                      key={r.id}
                      className="animate-fade-up rounded-lg px-3 py-3.5 transition-colors hover:bg-secondary/60"
                      style={{ animationDelay: `${400 + i * 120}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                        <PriorityBadge priority={r.priority} />
                        {r.delayed && <DelayBadge />}
                      </div>
                      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <span className="truncate text-sm">{r.title}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Roles &amp; permissions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {ROLE_CARDS.map(({ icon: Icon, role, rows }, i) => (
              <div
                key={role}
                className="panel panel-hover animate-fade-up p-6"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold">{role}</h3>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-16 shrink-0 font-medium text-muted-foreground">{k}</dt>
                      <dd className="min-w-0">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <h2 className="text-2xl font-semibold sm:text-3xl">Ticket workflow</h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              Initial status New · working statuses Assigned, In Progress, On Hold · final status
              Closed (with Resolved as the pre-closure state).
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STATUSES.map((s, i) => (
                <div
                  key={s}
                  className="panel panel-hover animate-fade-up p-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <StatusBadge status={s} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {TRANSITIONS[s].length
                      ? `Can move to: ${TRANSITIONS[s].join(", ")}`
                      : "Final state — no further transitions"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-semibold sm:text-3xl">Required ticket information</h2>
              <dl className="mt-7 divide-y divide-border border-y border-border">
                {FIELDS.map(([k, v]) => (
                  <div key={k} className="group py-3.5 transition-colors hover:bg-secondary/40">
                    <dt className="text-sm font-medium">{k}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="animate-fade-up [animation-delay:150ms]">
              <h2 className="text-2xl font-semibold sm:text-3xl">Manager visibility</h2>
              <ul className="mt-7 space-y-3.5 text-sm">
                {[
                  "Open tickets by status",
                  "Delayed tickets (past the priority SLA)",
                  "Resolved and closed volume",
                  "Open workload per support member",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                    {i}
                  </li>
                ))}
              </ul>
              <div className="panel mt-7 p-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Timer className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    Delay thresholds
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(["High", "Medium", "Low"] as const).map((p) => (
                    <div key={p} className="rounded-xl border border-border bg-background/50 p-3">
                      <div className="font-display text-xl font-bold text-gradient">
                        {SLA_HOURS[p]}h
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{p}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Measured from submission while the ticket is still open.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/70 bg-card/40">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground">
            <span>HelpDesk Lite — internal support ticketing workspace</span>
            <Link to="/auth" search={{ mode: "signup" }} className="story-link text-foreground">
              Create an account
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
