import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import { PRODUCTS, slugify } from '@/lib/data';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

// Generate static paths for all seed products
export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: p.id,
    slug: slugify(p.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return {};

  const title = product.metaTitle || `${product.name} — Acquista su BesPoint`;
  const description =
    product.metaDescription ||
    `${product.name} — ${product.description.replace(/<[^>]+>/g, '').substring(0, 155)}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description.replace(/<[^>]+>/g, ''),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `https://www.bespoint.it/prodotto/${product.id}/${slugify(product.name)}`,
    },
    aggregateRating: product.reviews > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviews,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.bespoint.it/prodotto/${id}/${slugify(product.name)}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: `https://www.bespoint.it/prodotto/${id}/${slugify(product.name)}`,
    },
    other: {
      'script:ld+json': JSON.stringify(productSchema),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  return <ProductPageClient productId={id} />;
}
