import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertHotelAccess(userId: string, restaurantId: string) {
  const { requireAdmin } = await import("./admin-auth.server");
  const a = await requireAdmin(userId);
  if (a.role !== "super_admin" && a.restaurantId !== restaurantId)
    throw new Error("Forbidden");
  return a;
}

export const listMenu = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [cats, items] = await Promise.all([
      supabaseAdmin
        .from("menu_categories")
        .select("id, name, display_order")
        .eq("restaurant_id", data.restaurantId)
        .order("display_order", { ascending: true }),
      supabaseAdmin
        .from("menu_items")
        .select("id, category_id, name, description, price, is_available, is_veg")
        .eq("restaurant_id", data.restaurantId)
        .order("name", { ascending: true }),
    ]);
    if (cats.error) throw new Error(cats.error.message);
    if (items.error) throw new Error(items.error.message);
    return { categories: cats.data ?? [], items: items.data ?? [] };
  });

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string; name: string; display_order?: number }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("menu_categories")
      .insert({
        restaurant_id: data.restaurantId,
        name: data.name.trim(),
        display_order: data.display_order ?? 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string; id: string; name?: string; display_order?: number }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.display_order !== undefined) patch.display_order = data.display_order;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("menu_categories")
      .update(patch)
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string; id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Cascade items first (in case FK doesn't cascade)
    await supabaseAdmin.from("menu_items").delete().eq("category_id", data.id);
    const { error } = await supabaseAdmin
      .from("menu_categories")
      .delete()
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    restaurantId: string;
    category_id: string;
    name: string;
    description?: string | null;
    price: number;
    is_available?: boolean;
    is_veg?: boolean;
  }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("menu_items")
      .insert({
        restaurant_id: data.restaurantId,
        category_id: data.category_id,
        name: data.name.trim(),
        description: data.description ?? null,
        price: data.price,
        is_available: data.is_available ?? true,
        is_veg: data.is_veg ?? true,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    restaurantId: string;
    id: string;
    category_id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    is_available?: boolean;
    is_veg?: boolean;
  }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { id, restaurantId, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const k of Object.keys(rest) as (keyof typeof rest)[]) {
      if (rest[k] !== undefined) patch[k] = rest[k];
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("menu_items")
      .update(patch)
      .eq("id", id)
      .eq("restaurant_id", restaurantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string; id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("menu_items")
      .delete()
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type BulkRow = {
  category: string;
  name: string;
  description?: string | null;
  price: number;
  is_veg?: boolean;
  is_available?: boolean;
};

export const bulkImportMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { restaurantId: string; rows: BulkRow[] }) => d)
  .handler(async ({ context, data }) => {
    await assertHotelAccess(context.userId, data.restaurantId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch existing categories for this hotel
    const { data: existing, error: catErr } = await supabaseAdmin
      .from("menu_categories")
      .select("id, name, display_order")
      .eq("restaurant_id", data.restaurantId);
    if (catErr) throw new Error(catErr.message);

    const byName = new Map<string, string>();
    for (const c of existing ?? []) byName.set(c.name.trim().toLowerCase(), c.id);
    let nextOrder = (existing ?? []).reduce((m, c) => Math.max(m, c.display_order ?? 0), 0) + 1;

    // Create any missing categories
    const missing: string[] = [];
    for (const r of data.rows) {
      const key = r.category.trim().toLowerCase();
      if (!byName.has(key) && !missing.includes(key)) missing.push(key);
    }
    for (const key of missing) {
      const original = data.rows.find((r) => r.category.trim().toLowerCase() === key)!.category.trim();
      const { data: created, error } = await supabaseAdmin
        .from("menu_categories")
        .insert({ restaurant_id: data.restaurantId, name: original, display_order: nextOrder++ })
        .select("id")
        .single();
      if (error) throw new Error(`Category "${original}": ${error.message}`);
      byName.set(key, created.id);
    }

    // Insert items
    const inserts = data.rows.map((r) => ({
      restaurant_id: data.restaurantId,
      category_id: byName.get(r.category.trim().toLowerCase())!,
      name: r.name.trim(),
      description: r.description ?? null,
      price: Number(r.price),
      is_veg: r.is_veg ?? true,
      is_available: r.is_available ?? true,
    }));

    if (inserts.length === 0) return { inserted: 0, categoriesCreated: missing.length };

    const { error: itemErr } = await supabaseAdmin.from("menu_items").insert(inserts);
    if (itemErr) throw new Error(itemErr.message);

    return { inserted: inserts.length, categoriesCreated: missing.length };
  });

