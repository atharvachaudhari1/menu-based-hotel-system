// Server-only Supabase client using the service role key. NEVER import from
// client code. The .server.ts suffix is enforced by the bundler.
import { createClient } from "@supabase/supabase-js";

const url = process.env.HOTEL_SUPABASE_URL;
const serviceRoleKey = process.env.HOTEL_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "HOTEL_SUPABASE_URL and HOTEL_SUPABASE_SERVICE_ROLE_KEY must be set as server secrets.",
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storage: undefined,
  },
});
