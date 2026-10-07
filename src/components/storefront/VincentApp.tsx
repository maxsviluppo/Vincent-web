'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useApp } from '@/context/AppProvider';
import { preloadLegacyAppBundle } from '@/lib/preloadLegacyApp';

const OriginalAppInner = dynamic(() => import('./OriginalAppInner'), {
  ssr: false,
  loading: () => null,
});

export function VincentApp() {
  const { isAdminOpen, isAuthOpen, isCheckoutOpen, isCartOpen, isSideMenuOpen } = useApp();
  const needLegacy = isAdminOpen || isAuthOpen || isCheckoutOpen || isCartOpen || isSideMenuOpen;

  useEffect(() => {
    preloadLegacyAppBundle();
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadLegacyAppBundle(), { timeout: 1200 });
    }
  }, []);

  if (!needLegacy) return null;

  return <OriginalAppInner />;
}
