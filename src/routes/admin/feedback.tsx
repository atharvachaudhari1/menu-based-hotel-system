import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trash2 } from "lucide-react";
import { listFeedback, deleteFeedback } from "@/lib/insights.functions";
import { listHotels } from "@/lib/hotels.functions";

export const Route = createFileRoute("/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: FeedbackPage,
});

type Fb = { id: string; restaurant_id: string; customer_id: string | null; rating: number; comment: string | null; submitted_at: string };
type Hotel = { id: string; name: string };

function FeedbackPage() {
  const qc = useQueryClient();
  const listF = useServerFn(listFeedback);
  const listH = useServerFn(listHotels);
  const delF = useServerFn(deleteFeedback);
  const [hotelId, setHotelId] = useState("");

  const { data: hotels = [] } = useQuery({ queryKey: ["hotels"], queryFn: () => listH() as Promise<Hotel[]> });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["feedback", hotelId],
    queryFn: () => listF({ data: { restaurantId: hotelId || null } }) as Promise<Fb[]>,
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => delF({ data: { id } }),
    onSuccess: () => {
      toast.success("Feedback deleted");
      qc.invalidateQueries({ queryKey: ["feedback"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const nameById = useMemo(() => Object.fromEntries(hotels.map((h) => [h.id, h.name])), [hotels]);
  const avg = rows.length ? rows.reduce((a, b) => a + b.rating, 0) / rows.length : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Feedback</h1>
          <p className="text-muted-foreground mt-1">Ratings from your customers.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 min-w-[180px]">
          <div className="text-xs uppercase text-muted-foreground">Average rating</div>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-semibold">{avg != null ? avg.toFixed(2) : "—"}</span>
            <span className="text-xs text-muted-foreground">({rows.length})</span>
          </div>
        </div>
      </div>

      <Select value={hotelId || "__all"} onValueChange={(v) => setHotelId(v === "__all" ? "" : v)}>
        <SelectTrigger className="w-64"><SelectValue placeholder="All hotels" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All hotels</SelectItem>
          {hotels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Comment</th>
              <th className="text-left p-3">Hotel</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No feedback yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </td>
                <td className="p-3">{r.comment ?? <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{nameById[r.restaurant_id] ?? r.restaurant_id.slice(0, 8)}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.submitted_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (confirm("Delete this feedback?")) deleteM.mutate(r.id);
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
