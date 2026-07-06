// Browser Supabase client — points at the hotel-menu-fi Supabase project.
// The publishable key is safe to ship to the browser (that's what it's for).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qdxdruwsnapccgccvacw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_3m3CvO80b31waC_cgV3nMg_I7kQ70qu";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
});

export const SUPABASE_STORAGE_KEY = `sb-qdxdruwsnapccgccvacw-auth-token`;
