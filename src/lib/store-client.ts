/** Client: carica e salva configurazione negozio su Supabase (via API Next.js). */

export type StoreConfigPayload = {
  company_settings?: Record<string, unknown>;
  page_settings?: Record<string, unknown>;
  payment_settings?: Record<string, unknown>;
  return_requests?: unknown[];
  couriers?: unknown[];
};

export async function fetchStoreConfig(): Promise<StoreConfigPayload | null> {
  try {
    const res = await fetch('/api/store/config', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function pushStoreConfig(partial: StoreConfigPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/store/config', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    return res.ok;
  } catch {
    return false;
  }
}
