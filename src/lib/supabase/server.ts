import { cookies } from "next/headers";
import { createServerClient as createSSR } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// User-scoped (RLS as the user) — use in route handlers, server components
export function createServerClient() {
  const cookieStore = cookies();
  return createSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
        remove: (n, o) => { try { cookieStore.set({ name: n, value: "", ...o }); } catch {} },
      },
    }
  );
}

// Service role — bypasses RLS, server-only
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
