import { NextRequest, NextResponse } from 'next/server';
import { fetchStoreConfigRow, upsertStoreConfigRow } from '@/lib/supabase-admin';

export async function GET() {
  const row = await fetchStoreConfigRow();
  if (!row) {
    return NextResponse.json({
      company_settings: {},
      page_settings: {},
      payment_settings: {},
      return_requests: [],
      couriers: [],
    });
  }
  return NextResponse.json({
    company_settings: row.company_settings,
    page_settings: row.page_settings,
    payment_settings: row.payment_settings,
    return_requests: row.return_requests,
    couriers: row.couriers,
    updated_at: row.updated_at,
  });
}

export async function PUT(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
  }

  const existing = await fetchStoreConfigRow();
  const merged = {
    company_settings:
      body.company_settings !== undefined
        ? body.company_settings
        : (existing?.company_settings ?? {}),
    page_settings:
      body.page_settings !== undefined ? body.page_settings : (existing?.page_settings ?? {}),
    payment_settings:
      body.payment_settings !== undefined
        ? body.payment_settings
        : (existing?.payment_settings ?? {}),
    return_requests:
      body.return_requests !== undefined
        ? body.return_requests
        : (existing?.return_requests ?? []),
    couriers: body.couriers !== undefined ? body.couriers : (existing?.couriers ?? []),
  };

  const ok = await upsertStoreConfigRow(merged as Parameters<typeof upsertStoreConfigRow>[0]);
  if (!ok) {
    return NextResponse.json({ error: 'Salvataggio configurazione fallito' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
