/** Client-side chiamate auth (cookie HttpOnly impostato dal server). */

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressZip?: string;
  addressProvince?: string;
  taxCode?: string;
};

export async function authMe(): Promise<PublicUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export async function authLogin(login: string, password: string): Promise<{ user?: PublicUser; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || 'Accesso non riuscito' };
  return { user: data.user };
}

export async function authRegister(body: {
  username?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  addressCity?: string;
  addressProvince?: string;
}): Promise<{ user?: PublicUser; error?: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || 'Registrazione non riuscita' };
  return { user: data.user };
}

export async function authLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export async function authDeleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/auth/delete-account', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || 'Eliminazione non riuscita' };
  return { ok: true };
}

export async function authUpdateProfile(profile: Partial<PublicUser>): Promise<{ user?: PublicUser; error?: string }> {
  const res = await fetch('/api/auth/profile', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || 'Salvataggio non riuscito' };
  return { user: data.user };
}
