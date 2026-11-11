import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Returns a server-only Supabase admin client with Next.js fetch caching disabled
 * so admin panel mutations reflect immediately across all serverless instances.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }

  return _supabaseAdmin;
}

export function isSupabaseServerReady(): boolean {
  return Boolean(supabaseUrl && supabaseSecretKey);
}

/**
 * Reads a JSON payload stored under a key in public.website_settings.
 */
export async function getSupabaseSettingJson<T>(key: string): Promise<T | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb
    .from("website_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.value) return null;
  try {
    return JSON.parse(data.value) as T;
  } catch {
    return null;
  }
}

/**
 * Writes a JSON payload into public.website_settings.
 */
export async function setSupabaseSettingJson<T>(
  key: string,
  value: T,
  isPublic: boolean,
  description: string
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;

  const { error } = await sb.from("website_settings").upsert(
    {
      key,
      value: JSON.stringify(value),
      is_public: isPublic,
      description,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error(`[Supabase setSettingJson(${key}) Error]:`, error);
    return false;
  }
  return true;
}
