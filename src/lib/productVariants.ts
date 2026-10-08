/**
 * Utility per taglie e colori dei prodotti Vincent Store.
 * Fornisce palette swatch, codici colore e fallback intelligenti per categoria.
 */

import { Product } from './types';

export function getColorHex(name: string): string {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('nero') || n.includes('black')) return '#171717';
  if (n.includes('bianco') || n.includes('white')) return '#ffffff';
  if (n.includes('blu notte') || n.includes('navy')) return '#111827';
  if (n.includes('celeste') || n.includes('azzurro') || n.includes('sky')) return '#7dd3fc';
  if (n.includes('blu') || n.includes('blue')) return '#1e3a8a';
  if (n.includes('grigio') || n.includes('grey') || n.includes('gray')) return '#64748b';
  if (n.includes('antracite') || n.includes('charcoal')) return '#334155';
  if (n.includes('marrone') || n.includes('brown')) return '#5a3825';
  if (n.includes('cuoio') || n.includes('cognac')) return '#854d0e';
  if (n.includes('cammello') || n.includes('camel') || n.includes('beige') || n.includes('sabbia')) return '#d4b996';
  if (n.includes('salvia') || n.includes('sage')) return '#65a30d';
  if (n.includes('verde') || n.includes('green') || n.includes('kaki') || n.includes('khaki')) return '#2d4a3e';
  if (n.includes('bordeaux') || n.includes('burgundy')) return '#7f1d1d';
  if (n.includes('rosso') || n.includes('red')) return '#b91c1c';
  if (n.includes('denim scuro') || n.includes('dark denim')) return '#1e3a8a';
  if (n.includes('denim chiaro') || n.includes('light denim')) return '#60a5fa';
  if (n.includes('denim')) return '#2563eb';
  if (n.includes('giallo') || n.includes('yellow')) return '#ca8a04';
  if (n.includes('arancione') || n.includes('orange')) return '#c2410c';
  if (n.includes('rosa') || n.includes('pink')) return '#f472b6';
  return '#262626';
}

export function getDefaultProductSizes(category?: string): string[] {
  const cat = (category || '').toLowerCase();
  if (cat.includes('scarp')) {
    return ['40', '41', '42', '43', '44', '45'];
  }
  if (cat.includes('jean') || cat.includes('pantalon')) {
    return ['46', '48', '50', '52', '54'];
  }
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}

export function getDefaultProductColors(product?: { name?: string; category?: string }): string[] {
  const cat = (product?.category || '').toLowerCase();
  const name = (product?.name || '').toLowerCase();

  if (cat.includes('scarp')) {
    return ['Nero', 'Marrone', 'Cuoio', 'Bianco'];
  }
  if (cat.includes('jean') || name.includes('denim')) {
    return ['Denim Scuro', 'Denim Chiaro', 'Nero', 'Grigio'];
  }
  if (cat.includes('camic') || name.includes('camicia')) {
    return ['Bianco', 'Celeste', 'Blu Notte', 'Grigio'];
  }
  if (cat.includes('giubbin') || cat.includes('giubbotto') || name.includes('pelle')) {
    return ['Nero', 'Marrone', 'Cammello', 'Verde'];
  }
  if (cat.includes('felp') || cat.includes('tut')) {
    return ['Grigio', 'Nero', 'Antracite', 'Bianco'];
  }
  if (cat.includes('shirt') || cat.includes('polo')) {
    return ['Blu Notte', 'Nero', 'Bianco', 'Salvia'];
  }
  return ['Nero', 'Blu Notte', 'Grigio', 'Bianco'];
}

export function getProductVariantInfo(product?: Product | null) {
  if (!product) {
    return {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Nero', 'Bianco'],
      customGroups: {} as Record<string, any[]>
    };
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  
  // Raggruppa varianti per tipo
  const groups: Record<string, any[]> = {};
  variants.forEach((v: any) => {
    const t = v.type || 'Variante';
    if (!groups[t]) groups[t] = [];
    if (!groups[t].some((it: any) => it.value === v.value)) {
      groups[t].push(v);
    }
  });

  // Cerca se ci sono varianti tipo taglia o size
  const sizeTypeKey = Object.keys(groups).find(k => 
    k.toLowerCase().includes('tagli') || k.toLowerCase().includes('size')
  );
  const colorTypeKey = Object.keys(groups).find(k => 
    k.toLowerCase().includes('color')
  );

  const sizes = sizeTypeKey && groups[sizeTypeKey].length > 0
    ? groups[sizeTypeKey].map((v: any) => v.value)
    : getDefaultProductSizes(product.category);

  const colors = colorTypeKey && groups[colorTypeKey].length > 0
    ? groups[colorTypeKey].map((v: any) => v.value)
    : getDefaultProductColors(product);

  // Altre varianti custom che non siano taglia o colore
  const customGroups: Record<string, any[]> = {};
  Object.entries(groups).forEach(([type, opts]) => {
    if (type !== sizeTypeKey && type !== colorTypeKey) {
      customGroups[type] = opts;
    }
  });

  return { sizes, colors, customGroups };
}
