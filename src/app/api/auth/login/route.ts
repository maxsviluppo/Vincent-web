import { NextRequest } from 'next/server';
import { findUserByLogin, rowToPublicUser } from '@/lib/app-users-db';
import { authJsonResponse, jsonError } from '@/lib/auth-api-helpers';
import { verifyPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  let body: { login?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError('Richiesta non valida', 400);
  }

  const login = (body.login || '').trim();
  const password = body.password || '';
  if (!login || !password) return jsonError('Credenziali mancanti', 400);

  const row = await findUserByLogin(login);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return jsonError('Username/email o password non corretti', 401);
  }

  return authJsonResponse(rowToPublicUser(row));
}
