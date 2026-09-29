'use client';

/**
 * BesPointShell — the true client-side entry point.
 * This file runs ONLY in the browser (loaded via ssr: false from HomeClient).
 * It correctly passes initial state to StorefrontShell.
 */

import React from 'react';
import { AppProvider } from '@/context/AppProvider';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';

interface Props {
  initialCategory?: string;
  initialProductId?: string;
}

export default function BesPointShell({ initialCategory, initialProductId }: Props) {
  return (
    <AppProvider>
      <StorefrontShell 
        initialCategory={initialCategory} 
        initialProductId={initialProductId} 
      />
    </AppProvider>
  );
}
