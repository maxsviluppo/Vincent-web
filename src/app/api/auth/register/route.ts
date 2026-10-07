import { NextRequest } from 'next/server';
import {
  createAppUser,
  findUserByEmail,
  findUserByUsername,
  rowToPublicUser,
} from '@/lib/app-users-db';
import { authJsonResponse, jsonError } from '@/lib/auth-api-helpers';
import { hashPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  let body: {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    addressCity?: string;
    addressProvince?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError('Richiesta non valida', 400);
  }

  const username = (body.username || '').trim().toLowerCase();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!username || username.length < 3) return jsonError('Username: minimo 3 caratteri', 400);
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return jsonError('Username: solo lettere, numeri, . _ -', 400);
  }
  if (!email.includes('@')) return jsonError('Email non valida', 400);
  if (password.length < 6) return jsonError('Password: minimo 6 caratteri', 400);

  if (await findUserByEmail(email)) return jsonError('Email già registrata', 409);
  if (await findUserByUsername(username)) return jsonError('Username già in uso', 409);

  const name = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
  const row = await createAppUser({
    username,
    email,
    passwordHash: hashPassword(password),
    profile: {
      name: name || username,
      addressCity: body.addressCity || '',
      addressProvince: body.addressProvince || '',
    },
  });

  if (!row) return jsonError('Registrazione non riuscita (database)', 502);
  return authJsonResponse(rowToPublicUser(row), 201);
}
