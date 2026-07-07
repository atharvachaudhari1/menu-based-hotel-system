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

  if (table === "customers") {
    let customerQ = supabaseAdmin
      .from("customers")
      .select("id, restaurant_id")
      .eq("id", id)
      .maybeSingle();
    if (a.role !== "super_admin") {
      if (!a.restaurantId) throw new Error("Forbidden");
      customerQ = customerQ.eq("restaurant_id", a.restaurantId);
    }
    const { data: customer, error: customerErr } = await customerQ;
    if (customerErr) throw new Error(customerErr.message);
    if (!customer) return { ok: true };

    // Clear all rows that can block deleting this customer.
    const { error: scanErr } = await supabaseAdmin
      .from("scan_sessions")
      .delete()
      .eq("customer_id", customer.id);
    if (scanErr) throw new Error(scanErr.message);

    const { error: feedbackErr } = await supabaseAdmin
      .from("feedback")
      .delete()
      .eq("customer_id", customer.id);
    if (feedbackErr) throw new Error(feedbackErr.message);

    const { error } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", customer.id)
      .eq("restaurant_id", customer.restaurant_id);
    if (error) throw new Error(error.message);
    return { ok: true };
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

