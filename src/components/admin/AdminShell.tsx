'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useApp } from '@/context/AppProvider';

// Admin panel is the same as original, loaded client-side only
const AdminPanel = dynamic(
  () => import('@/components/storefront/OriginalAppInner'),
  { ssr: false }
);

export function AdminShell() {
  const { setIsAdminOpen, setAdminActiveTab } = useApp();

  useEffect(() => {
    setIsAdminOpen(true);
    setAdminActiveTab('dashboard');
  }, [setIsAdminOpen, setAdminActiveTab]);

  return <AdminPanel onCategorySelect={() => {}} onProductSelect={() => {}} />;
}
