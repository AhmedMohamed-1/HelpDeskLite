import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireAuth } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useUsers, setUserRole } from "@/lib/use-tickets";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/tickets";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team & roles — HelpDesk Lite" },
      { name: "description", content: "Managers assign employee, support and manager roles." },
      { property: "og:title", content: "Team & roles — HelpDesk Lite" },
      { property: "og:description", content: "Manage who can view, assign and resolve tickets." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Team />
    </RequireAuth>
  ),
});

function Team() {
  const { profile } = useAuth();
  const users = useUsers();

  if (profile?.role !== "manager") {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-muted-foreground">Only managers can manage user roles.</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/tickets">Back to tickets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Team &amp; roles</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Roles decide what each person can view, assign and resolve.
      </p>

      <div className="panel mt-6 divide-y divide-border">
        {users.map((u) => (
          <div key={u.uid} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <Select
              value={u.role}
              onValueChange={async (v) => {
                try {
                  await setUserRole(u.uid, v as Role);
                  toast.success(`${u.name || u.email} is now ${ROLE_LABEL[v as Role]}`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not update role");
                }
              }}
            >
              <SelectTrigger className="w-44">
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
        ))}
        {users.length === 0 && (
          <div className="p-8 text-sm text-muted-foreground">No users yet.</div>
        )}
      </div>
    </div>
  );
}
