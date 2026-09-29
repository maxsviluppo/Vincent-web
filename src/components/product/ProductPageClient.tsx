'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppProvider';

interface Props {
  productId: string;
}

/**
 * ProductPageClient — Handles the specific view for a product.
 * Since StorefrontShell is in the layout, this component just 
 * ensures the product is selected and provides the UI if needed.
 */
export function ProductPageClient({ productId }: Props) {
  const { products, setSelectedProduct, setSelectedCategory } = useApp();

  useEffect(() => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      // We DON'T change the category here, we let the shell handle it 
      // based on the product's own category if necessary, 
      // but primarily we want to stay in the user's current context.
    }
  }, [productId, products, setSelectedProduct]);

  // The actual rendering of the product details is handled by 
  // the legacy BespointApp layer or a modern ProductDetail component.
  // For now, we return null because StorefrontShell manages the visibility.
  return null;
}
