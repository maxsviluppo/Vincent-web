import { adminHeaders, isAdminSupabaseReady } from './supabase-admin';
import type { PublicUser } from './auth-client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export type AppUserRow = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  profile: Record<string, unknown>;
  created_at?: string;
};

export function rowToPublicUser(row: AppUserRow): PublicUser {
  const p = row.profile || {};
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: (p.name as string) || undefined,
    phone: (p.phone as string) || undefined,
    addressStreet: (p.addressStreet as string) || undefined,
    addressCity: (p.addressCity as string) || undefined,
    addressZip: (p.addressZip as string) || undefined,
    addressProvince: (p.addressProvince as string) || undefined,
    taxCode: (p.taxCode as string) || undefined,
  };
}

export function publicUserToProfile(user: Partial<PublicUser>): Record<string, unknown> {
  return {
    name: user.name,
    phone: user.phone,
    addressStreet: user.addressStreet,
    addressCity: user.addressCity,
    addressZip: user.addressZip,
    addressProvince: user.addressProvince,
    taxCode: user.taxCode,
  };
}

async function fetchUsers(filter: string): Promise<AppUserRow[]> {
  if (!isAdminSupabaseReady()) return [];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?${filter}&select=*&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

export async function findUserByEmail(email: string): Promise<AppUserRow | null> {
  const rows = await fetchUsers(`email=eq.${encodeURIComponent(email.toLowerCase())}`);
  return rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<AppUserRow | null> {
  const rows = await fetchUsers(`username=eq.${encodeURIComponent(username.toLowerCase())}`);
  return rows[0] || null;
}

export async function findUserByLogin(login: string): Promise<AppUserRow | null> {
  const trimmed = login.trim().toLowerCase();
  if (trimmed.includes('@')) return findUserByEmail(trimmed);
  return findUserByUsername(trimmed);
}

export async function findUserById(id: string): Promise<AppUserRow | null> {
  const rows = await fetchUsers(`id=eq.${encodeURIComponent(id)}`);
  return rows[0] || null;
}

export async function createAppUser(input: {
  username: string;
  email: string;
  passwordHash: string;
  profile?: Record<string, unknown>;
}): Promise<AppUserRow | null> {
  if (!isAdminSupabaseReady()) return null;
  const payload = {
    username: input.username.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    password_hash: input.passwordHash,
    profile: input.profile || {},
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
    method: 'POST',
    headers: adminHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function updateAppUserProfile(id: string, profile: Record<string, unknown>): Promise<AppUserRow | null> {
  if (!isAdminSupabaseReady()) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

export async function deleteAppUser(id: string): Promise<boolean> {
  if (!isAdminSupabaseReady()) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return res.ok;
}
