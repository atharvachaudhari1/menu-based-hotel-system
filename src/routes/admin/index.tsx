import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Manage your hotels, menus, customers and feedback here.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Hotels" value="—" hint="Coming in Phase 2" />
        <Card title="Menu items" value="—" hint="Coming in Phase 3" />
        <Card title="Customers" value="—" hint="Coming in Phase 4" />
        <Card title="Avg rating" value="—" hint="Coming in Phase 4" />
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Phase 1 is live — auth is working. Next: I'll build the Hotels CRUD (add / edit / delete + copy WhatsApp link).
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2 text-3xl font-display font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
