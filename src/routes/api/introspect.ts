import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/introspect")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.HOTEL_SUPABASE_URL!;
        const key = process.env.HOTEL_SUPABASE_SERVICE_ROLE_KEY!;
        const r = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/openapi+json" },
        });
        const spec: any = await r.json();
        const out: Record<string, any> = {};
        for (const t of ["menu_categories", "menu_items"]) {
          out[t] = spec.definitions?.[t]?.properties;
        }
        return Response.json(out);
      },
    },
  },
});
