import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — Vincent Store',
  description: 'Pannello di amministrazione Vincent Store.',
  robots: { index: false, follow: false },
};

// Admin is a client-heavy page, loaded dynamically
import { AdminShell } from '@/components/admin/AdminShell';

export default function AdminPage() {
  return <AdminShell />;
}
