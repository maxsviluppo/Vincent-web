'use client';

// This file bridges the original Vite App.tsx with Next.js.
// BrowserRouter is imported statically from the router-shim alias.
// AppComponent is memoised outside the component to avoid re-mounting loops.

import React, { Suspense, memo } from 'react';

// Lazy-import the heavy original App ONCE, outside the component.
const AppComponent = React.lazy(() =>
  import('@vincent-src/App').then((mod) => ({ default: mod.default }))
);

interface Props {
  onCategorySelect?: (cat: string, sub?: string) => void;
  onProductSelect?: (p: any) => void;
}

function OriginalAppInner({ onCategorySelect, onProductSelect }: Props) {
  return (
    <Suspense fallback={null}>
      <AppComponent hideStorefront={true} />
    </Suspense>
  );
}

export default memo(OriginalAppInner);
