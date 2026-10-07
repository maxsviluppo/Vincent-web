import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'vincent_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export { COOKIE_NAME, MAX_AGE_SEC };

function secret(): string {
  return process.env.AUTH_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'vincent-dev-auth-secret';
}

export type SessionPayload = {
  userId: string;
  username: string;
  email: string;
  exp: number;
};

export function signSession(payload: Omit<SessionPayload, 'exp'>): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC })
  ).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.userId || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}`;
}

export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
