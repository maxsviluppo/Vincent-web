import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES, slugify } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bespoint.it';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES
    .filter((c) => c !== 'Tutti')
    .map((cat) => ({
      url: `${baseUrl}/categoria/${slugify(cat)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${baseUrl}/prodotto/${p.id}/${slugify(p.name)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
