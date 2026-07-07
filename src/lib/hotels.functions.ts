import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function admin(userId: string) {
  const { requireAdmin } = await import("./admin-auth.server");
  return requireAdmin(userId);
}

export const listHotels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await admin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("restaurants")
      .select("id, name, is_active, created_at")
      .order("created_at", { ascending: false });
    if (a.role !== "super_admin" && a.restaurantId) q = q.eq("id", a.restaurantId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string }) => {
    if (!d?.name?.trim()) throw new Error("Name required");
    return { name: d.name.trim() };
  })
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    if (a.role !== "super_admin") throw new Error("Only super admins can create hotels");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("restaurants")
      .insert({ name: data.name, is_active: true })
      .select("id, name, is_active, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name?: string; is_active?: boolean }) => d)
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    if (a.role !== "super_admin" && a.restaurantId !== data.id)
      throw new Error("Forbidden");
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("restaurants")
      .update(patch)
      .eq("id", data.id)
      .select("id, name, is_active, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    if (a.role !== "super_admin") throw new Error("Only super admins can delete hotels");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Clear dependents explicitly; older DB constraints may not have ON DELETE CASCADE.
    const { data: custs, error: cErr } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("restaurant_id", data.id);
    if (cErr) throw new Error(cErr.message);
    const custIds = (custs ?? []).map((c: { id: string }) => c.id);

    // Delete bot_sessions that reference scan_sessions for this restaurant first.
    const { data: scansByRest, error: scansByRestErr } = await supabaseAdmin
      .from("scan_sessions")
      .select("id")
      .eq("restaurant_id", data.id);
    if (scansByRestErr) throw new Error(scansByRestErr.message);
    const scanIdsByRest = (scansByRest ?? []).map((r: { id: string }) => r.id);

    if (custIds.length) {
      const { data: scansByCust, error: scansByCustErr } = await supabaseAdmin
        .from("scan_sessions")
        .select("id")
        .in("customer_id", custIds);
      if (scansByCustErr) throw new Error(scansByCustErr.message);
      for (const r of scansByCust ?? []) scanIdsByRest.push((r as { id: string }).id);
    }

    if (scanIdsByRest.length) {
      const { error: botErr } = await supabaseAdmin
        .from("bot_sessions")
        .delete()
        .in("scan_session_id", scanIdsByRest);
      if (botErr) throw new Error(botErr.message);
    }

    const { error: scopedScanErr } = await supabaseAdmin
      .from("scan_sessions")
      .delete()
      .eq("restaurant_id", data.id);
    if (scopedScanErr) throw new Error(scopedScanErr.message);

    if (custIds.length) {
      const { error: sErr } = await supabaseAdmin
        .from("scan_sessions")
        .delete()
        .in("customer_id", custIds);
      if (sErr) throw new Error(sErr.message);

      const { error: fCustomerErr } = await supabaseAdmin
        .from("feedback")
        .delete()
        .in("customer_id", custIds);
      if (fCustomerErr) throw new Error(fCustomerErr.message);
    }

    const { error: feedbackErr } = await supabaseAdmin.from("feedback").delete().eq("restaurant_id", data.id);
    if (feedbackErr) throw new Error(feedbackErr.message);

    const { error: itemErr } = await supabaseAdmin.from("menu_items").delete().eq("restaurant_id", data.id);
    if (itemErr) throw new Error(itemErr.message);

    const { error: categoryErr } = await supabaseAdmin.from("menu_categories").delete().eq("restaurant_id", data.id);
    if (categoryErr) throw new Error(categoryErr.message);

    const { error: customerErr } = await supabaseAdmin.from("customers").delete().eq("restaurant_id", data.id);
    if (customerErr) throw new Error(customerErr.message);

    const { error } = await supabaseAdmin.from("restaurants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getHotel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const a = await admin(context.userId);
    if (a.role !== "super_admin" && a.restaurantId !== data.id)
      throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("restaurants")
      .select("id, name, is_active, created_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
