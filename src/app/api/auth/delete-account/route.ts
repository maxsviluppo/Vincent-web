import { deleteAppUser } from '@/lib/app-users-db';
import { getSessionUser, jsonError, logoutResponse } from '@/lib/auth-api-helpers';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return jsonError('Non autenticato', 401);

  const ok = await deleteAppUser(user.id);
  if (!ok) return jsonError('Eliminazione account non riuscita', 502);
  return logoutResponse();
}
