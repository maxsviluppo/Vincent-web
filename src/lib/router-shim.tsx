'use client';

import { useRouter, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';
import React from 'react';

import { CATEGORIES, slugify } from './data';

// Traduttore di rotte: converte i percorsi Next.js (SEO ITA) in quelli attesi dall'app (ENG)
const translatePath = (path: string, toEng: boolean) => {
  if (toEng) {
    let result = path
      .replace(/^\/categoria\//, '/category/')
      .replace(/^\/prodotto\//, '/product/');
    
    // Se è una categoria, proviamo a ripristinare il casing originale dei dati (es. illuminazione -> Illuminazione)
    const parts = result.split('/');
    if (parts[1] === 'category' && parts[2]) {
      const decoded = decodeURIComponent(parts[2]);
      const match = CATEGORIES.find(c => slugify(c).toLowerCase() === decoded.toLowerCase());
      if (match) parts[2] = match; // Ripristiniamo il casing originale
      result = parts.join('/');
    }
    return result;
  } else {
    // Da logica interna (ENG) a URL SEO (ITA)
    const result = path
      .replace(/^\/category\//, '/categoria/')
      .replace(/^\/product\//, '/prodotto/');
    
    // Forziamo sempre il minuscolo per la SEO negli URL Next.js
    return result.toLowerCase();
  }
};

export function useNavigate() {
  const router = useRouter();
  return (path: string, options?: { replace?: boolean }) => {
    // Quando l'app chiede "/category/...", noi lo portiamo a "/categoria/..." per Next.js
    const targetPath = translatePath(path, false);
    if (options?.replace) {
      router.replace(targetPath);
    } else {
      router.push(targetPath);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  // Quando l'app legge il percorso attuale, gli facciamo credere di essere su "/category/..."
  const shimmedPathname = translatePath(pathname || '/', true);
  
  return {
    pathname: shimmedPathname,
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
  };
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  return [searchParams, () => {}];
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export function Link({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) {
  const target = translatePath(to, false);
  return <a href={target} {...props}>{children}</a>;
}

export function NavLink({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) {
  const target = translatePath(to, false);
  return <a href={target} {...props}>{children}</a>;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  if (typeof window !== 'undefined') {
    if (replace) window.location.replace(to);
    else window.location.href = to;
  }
  return null;
}

export function Outlet() {
  return null;
}

export function useParams() {
  return {};
}

