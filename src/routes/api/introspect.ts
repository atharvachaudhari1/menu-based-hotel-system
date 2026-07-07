import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/introspect")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.HOTEL_SUPABASE_URL!;
        const key = process.env.HOTEL_SUPABASE_SERVICE_ROLE_KEY!;
        const tables = ["menu_categories", "menu_items"];
        const result: Record<string, unknown> = {};
        for (const t of tables) {
          const r = await fetch(`${url}/rest/v1/${t}?select=zzznope`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          result[t] = await r.json().catch(() => null);
        }
        return Response.json(result);
      },
    },
  },
});
