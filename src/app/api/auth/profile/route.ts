import { NextRequest } from 'next/server';
import {
  publicUserToProfile,
  rowToPublicUser,
  updateAppUserProfile,
} from '@/lib/app-users-db';
import { getSessionUser, jsonError } from '@/lib/auth-api-helpers';
import type { PublicUser } from '@/lib/auth-client';
import { NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return jsonError('Non autenticato', 401);

  let body: Partial<PublicUser>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Richiesta non valida', 400);
  }

  const merged: PublicUser = {
    ...sessionUser,
    ...body,
    id: sessionUser.id,
    username: sessionUser.username,
    email: sessionUser.email,
  };

  const row = await updateAppUserProfile(sessionUser.id, publicUserToProfile(merged));
  if (!row) return jsonError('Salvataggio profilo fallito', 502);
  return NextResponse.json({ user: rowToPublicUser(row) });
}
