'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppProvider';

interface Props {
  productId: string;
}

/** Route SEO /prodotto/... — imposta lo stato; la UI è in StorefrontShell (ProductSheet). */
export function ProductPageClient({ productId }: Props) {
  const { products, setSelectedProduct } = useApp();

  useEffect(() => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  }, [products, productId, setSelectedProduct]);

  return null;
}
