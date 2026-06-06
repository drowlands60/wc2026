import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client when Supabase isn't configured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signUp: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
        upsert: async () => ({ error: null }),
      }),
    } as any;
  }

  return createBrowserClient(url, key);
}
