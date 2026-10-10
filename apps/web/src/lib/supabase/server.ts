import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Reads/writes the auth cookies through `next/headers`; `getAll`/`setAll` is
 * the cookie contract @supabase/ssr expects. `setAll` swallows the
 * read-only-cookie error because Server Components may not set cookies — the
 * proxy is what refreshes sessions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — the proxy refreshes instead.
          }
        },
      },
    },
  );
}
