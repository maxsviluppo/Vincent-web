import { NextRequest } from 'next/server';
import { findUserByEmail } from '@/lib/app-users-db';
import { jsonError } from '@/lib/auth-api-helpers';

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError('Richiesta non valida', 400);
  }
  const email = (body.email || '').trim().toLowerCase();
  if (!email.includes('@')) return jsonError('Email non valida', 400);
  const existing = await findUserByEmail(email);
  return Response.json({ exists: Boolean(existing) });
}
