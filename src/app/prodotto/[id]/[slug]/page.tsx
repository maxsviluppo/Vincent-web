import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import { PRODUCTS, slugify } from '@/lib/data';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

// Generate static paths for production builds only
export async function generateStaticParams() {
  if (process.env.NODE_ENV !== 'production') return [];
  return PRODUCTS.map((p) => ({
    id: p.id,
    slug: slugify(p.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  const formattedTitle = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Dettaglio Prodotto';
  const title = product?.name || `${formattedTitle} — Vincent Store`;

  return {
    title: `${title} | Collezione Moda Uomo`,
    description: product?.description || 'Scopri i dettagli sartoriali di Vincent Store.',
    alternates: {
      canonical: `https://www.vincentstore.it/prodotto/${id}/${slug || ''}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductPageClient productId={id} />;
}
