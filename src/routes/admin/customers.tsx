import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { listCustomers, deleteCustomer } from "@/lib/insights.functions";
import { listHotels } from "@/lib/hotels.functions";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CustomersPage,
});

type Customer = {
  id: string; restaurant_id: string; name: string | null;
  email: string | null; phone: string; birthdate: string | null; registered_at: string;
};
type Hotel = { id: string; name: string };

function CustomersPage() {
  const qc = useQueryClient();
  const listC = useServerFn(listCustomers);
  const listH = useServerFn(listHotels);
  const delC = useServerFn(deleteCustomer);
  const [hotelId, setHotelId] = useState<string>("");
  const [q, setQ] = useState("");

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"], queryFn: () => listH() as Promise<Hotel[]>,
  });
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", hotelId],
    queryFn: () => listC({ data: { restaurantId: hotelId || null } }) as Promise<Customer[]>,
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => delC({ data: { id } }),
    onSuccess: () => {
      toast.success("Customer deleted");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const nameById = useMemo(() => Object.fromEntries(hotels.map((h) => [h.id, h.name])), [hotels]);
  const filtered = customers.filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (c.name ?? "").toLowerCase().includes(s) || (c.email ?? "").toLowerCase().includes(s) || c.phone.includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Customers</h1>
        <p className="text-muted-foreground mt-1">Registered from the WhatsApp bot.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Select value={hotelId || "__all"} onValueChange={(v) => setHotelId(v === "__all" ? "" : v)}>
          <SelectTrigger className="w-64"><SelectValue placeholder="All hotels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All hotels</SelectItem>
            {hotels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Search name / email / phone" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Hotel</th>
              <th className="text-left p-3">Registered</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No customers.</td></tr>}
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.name ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{c.phone}</td>
                <td className="p-3">{c.email ?? "—"}</td>
                <td className="p-3">{nameById[c.restaurant_id] ?? c.restaurant_id.slice(0, 8)}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.registered_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (confirm(`Delete customer ${c.name ?? c.phone}?`)) deleteM.mutate(c.id);
                  }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
