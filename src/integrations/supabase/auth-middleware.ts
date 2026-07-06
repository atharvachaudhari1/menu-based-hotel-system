// Server-function middleware: validates the bearer token from the request and
// attaches an RLS-scoped Supabase client + userId + claims to context.
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

const HOTEL_SUPABASE_URL = process.env.HOTEL_SUPABASE_URL;
const HOTEL_SUPABASE_PUBLISHABLE_KEY = process.env.HOTEL_SUPABASE_PUBLISHABLE_KEY;

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const authHeader = getRequestHeader("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Response("Unauthorized: No authorization header provided", {
        status: 401,
      });
    }
    const token = authHeader.slice("Bearer ".length);

    if (!HOTEL_SUPABASE_URL || !HOTEL_SUPABASE_PUBLISHABLE_KEY) {
      throw new Response("Server misconfigured: Supabase env missing", {
        status: 500,
      });
    }

    const supabase = createClient(
      HOTEL_SUPABASE_URL,
      HOTEL_SUPABASE_PUBLISHABLE_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          storage: undefined,
        },
      },
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Response("Unauthorized: Invalid token", { status: 401 });
    }

    return next({
      context: {
        supabase,
        userId: data.user.id,
        claims: data.user,
      },
    });
  },
);
