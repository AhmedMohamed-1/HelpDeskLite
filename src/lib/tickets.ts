export type Role = "employee" | "support" | "manager";

export const ROLES: Role[] = ["employee", "support", "manager"];

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employee",
  support: "Support Staff",
  manager: "Manager",
};

export type Status = "New" | "Assigned" | "In Progress" | "On Hold" | "Resolved" | "Closed";
export const STATUSES: Status[] = [
  "New",
  "Assigned",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];

export const TRANSITIONS: Record<Status, Status[]> = {
  New: ["Assigned", "In Progress", "Closed"],
  Assigned: ["In Progress", "On Hold", "Closed"],
  "In Progress": ["On Hold", "Resolved", "Closed"],
  "On Hold": ["In Progress", "Closed"],
  Resolved: ["Closed", "In Progress"],
  Closed: [],
};

export type Category = "Hardware" | "Software" | "Network" | "Access" | "Facilities" | "Other";
export const CATEGORIES: Category[] = [
  "Hardware",
  "Software",
  "Network",
  "Access",
  "Facilities",
  "Other",
];

export type Priority = "Low" | "Medium" | "High";
export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

/** Delay thresholds in hours, from submission, while still open. */
export const SLA_HOURS: Record<Priority, number> = { High: 8, Medium: 24, Low: 72 };

export interface Note {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  submitterId: string;
  submitterName: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  createdAt: number;
  updatedAt: number;
  notes?: Record<string, Note>;
}

export const OPEN_STATUSES: Status[] = ["New", "Assigned", "In Progress", "On Hold"];

export const isOpen = (t: Ticket) => OPEN_STATUSES.includes(t.status);

export function isDelayed(t: Ticket, now = Date.now()) {
  if (!isOpen(t)) return false;
  return now - t.createdAt > SLA_HOURS[t.priority] * 3600_000;
}

export function ticketRef(id: string) {
  return `HD-${id.slice(-6).toUpperCase()}`;
}

export function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const canResolve = (role: Role) => role === "support" || role === "manager";
export const canManage = (role: Role) => role === "support" || role === "manager";
