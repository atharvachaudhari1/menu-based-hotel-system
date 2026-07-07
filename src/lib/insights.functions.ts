import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function admin(userId: string) {
  const { requireAdmin } = await import("./admin-auth.server");
  return requireAdmin(userId);
}

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await admin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const scope = a.role === "super_admin" ? null : a.restaurantId;

    const hotelsQ = supabaseAdmin.from("restaurants").select("id", { count: "exact", head: true });
    if (scope) hotelsQ.eq("id", scope);

    const itemsQ = supabaseAdmin.from("menu_items").select("id", { count: "exact", head: true });
    if (scope) itemsQ.eq("restaurant_id", scope);

    const custQ = supabaseAdmin.from("customers").select("id", { count: "exact", head: true });
    if (scope) custQ.eq("restaurant_id", scope);

    const fbQ = supabaseAdmin.from("feedback").select("rating");
    if (scope) fbQ.eq("restaurant_id", scope);

    const [h, i, c, f] = await Promise.all([hotelsQ, itemsQ, custQ, fbQ]);
    const ratings = (f.data ?? []).map((r: { rating: number }) => r.rating).filter((n) => typeof n === "number");
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    return {
      hotels: h.count ?? 0,
      items: i.count ?? 0,
      customers: c.count ?? 0,
      feedbackCount: ratings.length,
      avgRating: avg,
    };
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId?: string | null }) => d ?? {})
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("customers")
      .select("id, restaurant_id, name, email, phone, birthdate, registered_at")
      .order("registered_at", { ascending: false })
      .limit(500);
    const scope = a.role === "super_admin" ? data.restaurantId ?? null : a.restaurantId;
    if (scope) q = q.eq("restaurant_id", scope);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId?: string | null }) => d ?? {})
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("feedback")
      .select("id, restaurant_id, customer_id, rating, comment, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(500);
    const scope = a.role === "super_admin" ? data.restaurantId ?? null : a.restaurantId;
    if (scope) q = q.eq("restaurant_id", scope);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const meAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await admin(context.userId);
    return a;
  });

async function deleteScoped(userId: string, table: "customers" | "feedback", id: string) {
  const a = await admin(userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Clear dependent scan_sessions first (FK: scan_sessions.customer_id -> customers.id)
  if (table === "customers") {
    const { error: sErr } = await supabaseAdmin
      .from("scan_sessions")
      .delete()
      .eq("customer_id", id);
    if (sErr) throw new Error(sErr.message);
  }

  let q = supabaseAdmin.from(table).delete().eq("id", id);
  if (a.role !== "super_admin") {
    if (!a.restaurantId) throw new Error("Forbidden");
    q = q.eq("restaurant_id", a.restaurantId);
  }
  const { error } = await q;
  if (error) throw new Error(error.message);
  return { ok: true };
}

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(({ context, data }) => deleteScoped(context.userId, "customers", data.id));

export const deleteFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(({ context, data }) => deleteScoped(context.userId, "feedback", data.id));

