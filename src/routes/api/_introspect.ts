import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/_introspect")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.HOTEL_SUPABASE_URL!;
        const key = process.env.HOTEL_SUPABASE_SERVICE_ROLE_KEY!;
        const tables = ["restaurants", "menu_categories", "menu_items", "customers", "feedback"];
        const result: Record<string, unknown> = {};
        for (const t of tables) {
          const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          result[t] = { status: r.status, body: await r.json().catch(() => null) };
        }
        return Response.json(result);
      },
    },
  },
});
