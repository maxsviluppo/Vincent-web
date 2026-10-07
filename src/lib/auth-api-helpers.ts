import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  clearSessionCookieHeader,
  sessionCookieHeader,
  signSession,
  verifySession,
} from './auth-token';
import { findUserById, rowToPublicUser } from './app-users-db';
import type { PublicUser } from './auth-client';

export async function getSessionUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) return null;
  const row = await findUserById(session.userId);
  return row ? rowToPublicUser(row) : null;
}

export function authJsonResponse(user: PublicUser, status = 200) {
  const token = signSession({ userId: user.id, username: user.username, email: user.email });
  const res = NextResponse.json({ user }, { status });
  res.headers.set('Set-Cookie', sessionCookieHeader(token));
  return res;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function logoutResponse() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearSessionCookieHeader());
  return res;
}
