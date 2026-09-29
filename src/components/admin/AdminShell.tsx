'use client';

import dynamic from 'next/dynamic';

// Admin panel is the same as original, loaded client-side only
const AdminPanel = dynamic(
  () => import('@/components/storefront/OriginalAppInner'),
  { ssr: false }
);

export function AdminShell() {
  return <AdminPanel onCategorySelect={() => {}} onProductSelect={() => {}} />;
}
