/**
 * Server-side Supabase REST (preferisce service role, fallback anon).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function adminHeaders(extra?: Record<string, string>) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export function isAdminSupabaseReady() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

export type StoreConfigRow = {
  id: string;
  company_settings: Record<string, unknown>;
  page_settings: Record<string, unknown>;
  payment_settings: Record<string, unknown>;
  return_requests: unknown[];
  couriers: unknown[];
  updated_at?: string;
};

export async function fetchStoreConfigRow(): Promise<StoreConfigRow | null> {
  if (!isAdminSupabaseReady()) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/store_config?id=eq.main&select=*`,
    { headers: adminHeaders(), cache: 'no-store' }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function upsertStoreConfigRow(partial: Partial<StoreConfigRow>): Promise<boolean> {
  if (!isAdminSupabaseReady()) return false;
  const payload = {
    id: 'main',
    updated_at: new Date().toISOString(),
    ...partial,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/store_config`, {
    method: 'POST',
    headers: adminHeaders({ Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify(payload),
  });
  return res.ok;
}
