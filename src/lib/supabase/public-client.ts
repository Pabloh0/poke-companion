import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Supabase client for PUBLIC data (Pokédex, types…), used on the server.
 *
 * - Uses the publishable key: it can only do what RLS allows the `anon` role,
 *   which for reference data means read-only.
 * - Has no user session (no cookies), so its results can be cached with
 *   `"use cache"` and shared by every visitor.
 *
 * For user data (phase 6) there will be a separate, cookie-aware client.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
