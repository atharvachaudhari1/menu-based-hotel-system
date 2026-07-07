// Server-only admin helper. Uses the service role client to verify that the
// signed-in user has a row in admin_users, and returns their assignment.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AdminInfo = {
  userId: string;
  role: "super_admin" | "hotel_admin";
  restaurantId: string | null;
};

export async function requireAdmin(userId: string): Promise<AdminInfo> {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, role, restaurant_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Response(error.message, { status: 500 });
  if (!data) throw new Response("Forbidden: not an admin", { status: 403 });
  return {
    userId,
    role: data.role as AdminInfo["role"],
    restaurantId: data.restaurant_id ?? null,
  };
}

/** Restrict a restaurant_id filter to what the admin is allowed to see. */
export function scopeRestaurant(
  admin: AdminInfo,
  requested: string | null | undefined,
): string | null {
  if (admin.role === "super_admin") return requested ?? null;
  // hotel_admin: always locked to their restaurant
  return admin.restaurantId;
}
