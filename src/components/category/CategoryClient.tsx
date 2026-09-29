'use client';

import dynamic from 'next/dynamic';

const BesPointShell = dynamic(
  () => import('@/components/storefront/BesPointShell'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-brand-dark font-black text-2xl italic">B</span>
        </div>
      </div>
    )
  }
);

interface Props {
  categoryName: string;
}

export function CategoryClient({ categoryName }: Props) {
  // Pass categoryName as initialCategory to BesPointShell
  return <BesPointShell initialCategory={categoryName} />;
}
