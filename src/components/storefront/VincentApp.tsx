'use client';

import dynamic from 'next/dynamic';

const OriginalAppInner = dynamic(
  () => import('./OriginalAppInner'),
  {
    ssr: false,
    loading: () => null,
  }
);

export function VincentApp() {
  return <OriginalAppInner />;
}
