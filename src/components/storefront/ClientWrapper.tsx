'use client';

import React from 'react';
import { AppProvider } from '@/context/AppProvider';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <StorefrontShell>
        {children}
      </StorefrontShell>
    </AppProvider>
  );
}
