import { cn } from "@/lib/utils";
import type { Status, Priority } from "@/lib/tickets";

const STATUS_STYLES: Record<Status, string> = {
  New: "bg-primary/15 text-primary-glow border-primary/30",
  Assigned: "bg-accent/60 text-accent-foreground border-border",
  "In Progress": "bg-warning/15 text-warning border-warning/30",
  "On Hold": "bg-muted text-muted-foreground border-border",
  Resolved: "bg-success/15 text-success border-success/30",
  Closed: "bg-secondary text-muted-foreground border-border",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-primary/12 text-primary-glow border-primary/25",
  High: "bg-destructive/15 text-destructive border-destructive/30",
};

const BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn(BASE, STATUS_STYLES[status], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return <span className={cn(BASE, PRIORITY_STYLES[priority], className)}>{priority}</span>;
}

export function DelayBadge() {
  return (
    <span
      className={cn(
        BASE,
        "border-destructive/40 bg-destructive/15 text-destructive animate-pulse-ring",
      )}
    >
      Delayed
    </span>
  );
}
