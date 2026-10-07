import { getSessionUser, jsonError } from '@/lib/auth-api-helpers';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError('Non autenticato', 401);
  return Response.json({ user });
}
