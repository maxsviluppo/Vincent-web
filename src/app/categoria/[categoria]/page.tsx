import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES, slugify } from '@/lib/data';

interface Props {
  params: Promise<{ categoria: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.filter((c) => c !== 'Tutti').map((cat) => ({
    categoria: slugify(cat),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const decoded = decodeURIComponent(categoria);
  const match = CATEGORIES.find((c) => slugify(c).toLowerCase() === decoded.toLowerCase());
  if (!match) return {};
  return { title: `${match} — BesPoint` };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const decoded = decodeURIComponent(categoria);
  const match = CATEGORIES.find((c) => slugify(c).toLowerCase() === decoded.toLowerCase());
  if (!match || match === 'Tutti') notFound();

  // The layout StorefrontShell automatically renders ModularStorefront when on a category path.
  // We return null here to avoid duplication and keep the storefront component persistent.
  return null;
}
