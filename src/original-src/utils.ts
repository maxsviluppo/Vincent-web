/**
 * Converte una stringa in Proper Case:
 * Ogni prima lettera di tutte le parole in maiuscolo, il resto in minuscolo.
 */
export const toProperCase = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
