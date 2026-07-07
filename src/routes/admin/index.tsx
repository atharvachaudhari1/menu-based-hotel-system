import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { dashboardStats, meAdmin } from "@/lib/insights.functions";

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
  const stats = useServerFn(dashboardStats);
  const me = useServerFn(meAdmin);
  const { data: s } = useSuspenseQuery({ queryKey: ["dashboard-stats"], queryFn: () => stats() });
  const { data: m } = useSuspenseQuery({ queryKey: ["me-admin"], queryFn: () => me() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Signed in as <strong>{m.role}</strong>
          {m.restaurantId ? " (scoped to one hotel)" : ""}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Hotels" value={String(s.hotels)} />
        <Card title="Menu items" value={String(s.items)} />
        <Card title="Customers" value={String(s.customers)} />
        <Card
          title="Avg rating"
          value={s.avgRating != null ? s.avgRating.toFixed(2) : "—"}
          hint={`${s.feedbackCount} reviews`}
        />
      </div>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2 text-3xl font-display font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
