import { createClient } from "@supabase/supabase-js";

// These two values come from .env.local (see Section 5).
// The publishable key is safe in the browser because RLS protects the data.
// NEVER put the secret key (sb_secret_...) in frontend code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase settings. Check your .env.local file.");
}

// Check BEFORE createClient(): the client reads the login token from the
// URL and then removes it. A password reset link has "type=recovery" in it.
export const openedFromResetLink = window.location.hash.includes("type=recovery");

export const supabase = createClient(supabaseUrl, supabaseKey);

// For the security tests in Section 10 only: lets you use `supabase` in the
// browser console while running `npm run dev`. It is not included in the
// production build. (The URL and publishable key are public anyway.)
if (import.meta.env.DEV) {
  window.supabase = supabase;
}
