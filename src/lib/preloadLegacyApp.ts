/** Precarica carrello, menu laterale e modali legacy per apertura più rapida. */
export function preloadLegacyAppBundle() {
  void import('@/components/storefront/OriginalAppInner');
  void import('@vincent-src/App');
}
