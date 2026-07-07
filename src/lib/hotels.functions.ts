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

    // Clear dependents that may lack ON DELETE CASCADE.
    // scan_sessions -> customers.id (blocks customer delete, which blocks hotel delete)
    const { data: custs, error: cErr } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("restaurant_id", data.id);
    if (cErr) throw new Error(cErr.message);
    const custIds = (custs ?? []).map((c: { id: string }) => c.id);
    if (custIds.length) {
      const { error: sErr } = await supabaseAdmin
        .from("scan_sessions")
        .delete()
        .in("customer_id", custIds);
      if (sErr) throw new Error(sErr.message);
    }
    // Also try to clear any scan_sessions scoped by restaurant_id (best-effort)
    await supabaseAdmin.from("scan_sessions").delete().eq("restaurant_id", data.id);

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
