'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// We load the ClientWrapper (which has the Provider and the Shell) 
// ONLY on the client to avoid SSR issues with localStorage and legacy code.
const ClientWrapper = dynamic(
  () => import('./ClientWrapper').then(mod => mod.ClientWrapper),
  { ssr: false }
);

export function StorefrontLauncher({ children }: { children: React.ReactNode }) {
  return <ClientWrapper>{children}</ClientWrapper>;
}
