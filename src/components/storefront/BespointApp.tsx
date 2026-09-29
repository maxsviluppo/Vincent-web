'use client';

import dynamic from 'next/dynamic';

// Lazy-load the heavy original App to avoid SSR issues
// (it uses browser APIs like localStorage heavily)
const OriginalAppInner = dynamic(
  () => import('./OriginalAppInner'),
  {
    ssr: false,
    loading: () => null,
  }
);

export function BespointApp() {
  return <OriginalAppInner />;
}
