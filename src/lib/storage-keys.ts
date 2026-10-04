/** Prefisso chiavi localStorage Vincent Store (migrazione da bespoint_). */
export const STORAGE_PREFIX = 'vincent_';
const LEGACY_PREFIX = 'bespoint_';

export function storageKey(suffix: string): string {
  return `${STORAGE_PREFIX}${suffix}`;
}

export function legacyStorageKey(suffix: string): string {
  return `${LEGACY_PREFIX}${suffix}`;
}

export function readStorageRaw(suffix: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = storageKey(suffix);
  const legacy = legacyStorageKey(suffix);
  return localStorage.getItem(key) ?? localStorage.getItem(legacy);
}

export function writeStorageRaw(suffix: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(suffix), value);
}
