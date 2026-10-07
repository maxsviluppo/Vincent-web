/**
 * Supabase Client & Service for Vincent Store
 * Seamless REST API integration with real-time sync for products, orders, and reviews.
 */

import { Product, Order, Review } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lpbowyoegmhhgtoksfwd.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1PCzvV9j1AfQSjGBf-RzJg_nmUWUbwc';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

/**
 * Fetch all products from Supabase
 */
export async function getSupabaseProducts(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[Supabase] Failed to fetch products:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((item: any): Product => ({
      id: String(item.id),
      name: item.name || '',
      brand: item.brand || 'Vincent Sartoria',
      price: Number(item.price) || 0,
      category: item.category || 'Abbigliamento',
      subcategory: item.subcategory || undefined,
      image: item.image || '',
      description: item.description || '',
      rating: Number(item.rating) || 5,
      reviews: Number(item.reviews) || 0,
      specs: typeof item.specs === 'object' && item.specs !== null ? item.specs : {},
      gallery: Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []),
      isFeatured: Boolean(item.is_featured ?? item.isFeatured),
      stock: item.stock !== undefined ? Number(item.stock) : 15,
      variants: Array.isArray(item.variants) ? item.variants : [],
      ean: item.ean || undefined,
      sku: item.sku || undefined,
      tags: Array.isArray(item.tags) ? item.tags : [],
      videoUrl: item.videoUrl || undefined,
      has3D: Boolean(item.has3D),
      isSpecialPromotion: Boolean(item.is_special_promotion ?? item.isSpecialPromotion),
    }));
  } catch (error) {
    console.error('[Supabase] getSupabaseProducts error:', error);
    return null;
  }
}

/**
 * Upsert a product into Supabase
 */
export async function syncProductToSupabase(product: Product): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: String(product.id),
      name: product.name,
      brand: product.brand || 'Vincent Sartoria',
      price: Number(product.price) || 0,
      category: product.category,
      subcategory: product.subcategory || null,
      image: product.image,
      description: product.description || '',
      rating: Number(product.rating) || 5,
      reviews: Number(product.reviews) || 0,
      specs: product.specs || {},
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
      is_featured: Boolean(product.isFeatured),
      stock: product.stock !== undefined ? Number(product.stock) : 15,
      variants: product.variants || [],
      ean: product.ean || null,
      sku: product.sku || null,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error('[Supabase] syncProductToSupabase error:', error);
    return false;
  }
}

/**
 * Delete a product from Supabase
 */
export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (error) {
    console.error('[Supabase] deleteProductFromSupabase error:', error);
    return false;
  }
}

/**
 * Fetch orders from Supabase
 */
export async function getSupabaseOrders(): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data.map((item: any): Order => ({
      id: String(item.id),
      date: item.date || item.created_at || new Date().toISOString(),
      status: item.status || 'pending',
      items: Array.isArray(item.items) ? item.items : [],
      total: Number(item.total) || 0,
      customer: item.customer || 'Cliente Vincent',
      address: item.address || '',
    }));
  } catch (error) {
    console.error('[Supabase] getSupabaseOrders error:', error);
    return null;
  }
}

/**
 * Create order in Supabase
 */
export async function createSupabaseOrder(order: Order): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: order.id,
      date: order.date,
      customer: order.customer || 'Cliente Vincent',
      total: order.total,
      status: order.status || 'pending',
      items: order.items || [],
      items_count: order.items?.length || 1,
      address: order.address || '',
      channel: 'website',
      is_paid: false,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error('[Supabase] createSupabaseOrder error:', error);
    return false;
  }
}

/**
 * Fetch reviews from Supabase
 */
export async function getSupabaseReviews(): Promise<Review[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data.map((item: any): Review => ({
      id: String(item.id),
      productId: String(item.product_id),
      customerName: item.user_name || 'Utente Vincent',
      rating: Number(item.rating) || 5,
      comment: item.comment || '',
      date: item.date || item.created_at || new Date().toISOString(),
      status: item.status || 'approved',
    }));
  } catch (error) {
    console.error('[Supabase] getSupabaseReviews error:', error);
    return null;
  }
}

/**
 * Create review in Supabase
 */
export async function createSupabaseReview(review: Review): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      product_id: review.productId,
      user_name: review.customerName,
      rating: review.rating,
      comment: review.comment,
      status: review.status || 'approved',
      date: review.date,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (error) {
    console.error('[Supabase] createSupabaseReview error:', error);
    return false;
  }
}
