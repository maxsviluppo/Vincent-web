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

export const ALPHA_SIZE_ORDER: Record<string, number> = {
  'XXXS': 1, '3XS': 1,
  'XXS': 2, '2XS': 2,
  'XS': 3,
  'S': 4,
  'M': 5,
  'L': 6,
  'XL': 7,
  'XXL': 8, '2XL': 8,
  'XXXL': 9, '3XL': 9,
  'XXXXL': 10, '4XL': 10,
  '5XL': 11,
  '6XL': 12,
  'TU': 98, 'TAGLIA UNICA': 98, 'ONE SIZE': 98, 'UNICA': 98, 'OVERSIZE': 99
};

export function isLikelySize(str?: string): boolean {
  if (!str) return false;
  const s = str.trim().toUpperCase();
  if (/^\d+(\.\d+)?$/.test(s)) return true; // es. 40, 42, 48, 50, 39.5
  if (/^(XXXS|3XS|XXS|2XS|XS|S|M|L|XL|XXL|2XL|XXXL|3XL|4XL|5XL|6XL|TU|TAGLIA UNICA|ONE SIZE|UNICA|OVERSIZE)$/i.test(s)) return true;
  if (/^W\d+\s*L\d+$/i.test(s)) return true; // Jeans standard W32 L34
  if (/^(TG\.?\s*\d+|TAGLIA\s*\d+|SIZE\s*\d+)$/i.test(s)) return true;
  return false;
}

/**
 * Pulisce una stringa di taglia rimuovendo prefissi inutili e qualsiasi colore accoppiato
 * es. "48 - Blu Navy" -> "48", "S - Bianco Ottico" -> "S", "Taglia: L" -> "L"
 */
export function cleanSizeName(raw?: string): string {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^(taglia|tg\.?|size)\s*[:\-]?\s*/i, '').trim();

  if (s.includes(' - ') || s.includes(' / ')) {
    const delimiter = s.includes(' - ') ? ' - ' : ' / ';
    const parts = s.split(delimiter).map(p => p.trim());
    if (isLikelySize(parts[0])) return cleanSizeName(parts[0]);
    if (isLikelySize(parts[1])) return cleanSizeName(parts[1]);
    return cleanSizeName(parts[0]);
  }

  return s;
}

/**
 * Pulisce una stringa di colore rimuovendo la taglia se concatenata
 * es. "48 - Blu Navy" -> "Blu Navy", "Colore: Nero" -> "Nero"
 */
export function cleanColorName(raw?: string): string {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^(colore|color)\s*[:\-]?\s*/i, '').trim();

  if (s.includes(' - ') || s.includes(' / ')) {
    const delimiter = s.includes(' - ') ? ' - ' : ' / ';
    const parts = s.split(delimiter).map(p => p.trim());
    if (isLikelySize(parts[0])) return parts[1]?.trim() || parts[0];
    if (isLikelySize(parts[1])) return parts[0]?.trim() || parts[1];
    return parts[1]?.trim() || parts[0];
  }

  return s;
}

/**
 * Ordina le taglie secondo standard sartoriali e di moda:
 * Prima numeriche crescenti (38, 40, 42, 44, 46, 48, 50, 52...),
 * poi taglie alfabetiche (XXS, XS, S, M, L, XL, XXL, 3XL...),
 * infine Taglia Unica / TU.
 */
export function sortSizes(sizes: string[]): string[] {
  const unique = Array.from(new Set(sizes.map(cleanSizeName).filter(Boolean)));

  return unique.sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const aIsNum = !isNaN(na) && /^\d+(\.\d+)?$/.test(a.trim());
    const bIsNum = !isNaN(nb) && /^\d+(\.\d+)?$/.test(b.trim());

    if (aIsNum && bIsNum) return na - nb;
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;

    const ua = a.trim().toUpperCase();
    const ub = b.trim().toUpperCase();
    const oa = ALPHA_SIZE_ORDER[ua];
    const ob = ALPHA_SIZE_ORDER[ub];
    if (oa && ob) return oa - ob;
    if (oa) return -1;
    if (ob) return 1;

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
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
  
  // Se non ci sono varianti specifiche, usiamo i valori di default ordinati
  if (variants.length === 0) {
    return {
      sizes: sortSizes(getDefaultProductSizes(product.category)),
      colors: getDefaultProductColors(product),
      customGroups: {} as Record<string, any[]>
    };
  }

  const extractedSizes: string[] = [];
  const extractedColors: string[] = [];
  const customGroups: Record<string, any[]> = {};

  variants.forEach((v: any) => {
    const rawType = (v.type || '').toLowerCase();
    const hasExplicitSize = Boolean(v.size);
    const hasExplicitColor = Boolean(v.color);
    const isCombinedType = rawType.includes('tagli') && rawType.includes('color');
    const isSizeType = rawType.includes('tagli') || rawType.includes('size');
    const isColorType = rawType.includes('color');

    // Estrazione taglia pulita (senza nome colore)
    if (hasExplicitSize) {
      extractedSizes.push(cleanSizeName(v.size));
    } else if (isCombinedType || isSizeType) {
      const parsed = cleanSizeName(v.value);
      if (parsed) extractedSizes.push(parsed);
    }

    // Estrazione colore pulito (senza taglia)
    if (hasExplicitColor) {
      extractedColors.push(cleanColorName(v.color));
    } else if (isCombinedType || isColorType) {
      const parsed = cleanColorName(v.value);
      if (parsed && !isLikelySize(parsed)) extractedColors.push(parsed);
    } else if (!isSizeType) {
      // Altra variante custom (es. "Modello", "Finitura")
      const t = v.type || 'Variante';
      if (!customGroups[t]) customGroups[t] = [];
      if (!customGroups[t].some((it: any) => it.value === v.value)) {
        customGroups[t].push(v);
      }
    }
  });

  const sizes = extractedSizes.length > 0
    ? sortSizes(extractedSizes)
    : sortSizes(getDefaultProductSizes(product.category));

  const colors = extractedColors.length > 0
    ? Array.from(new Set(extractedColors.filter(Boolean)))
    : getDefaultProductColors(product);

  return { sizes, colors, customGroups };
}

/**
 * Trova l'oggetto variante corrispondente a taglia e/o colore selezionati
 */
export function findMatchingVariant(
  variants: any[] | undefined,
  selectedSize?: string,
  selectedColor?: string
): any | null {
  if (!variants || variants.length === 0) return null;

  const targetSize = selectedSize ? cleanSizeName(selectedSize).toLowerCase() : '';
  const targetColor = selectedColor ? cleanColorName(selectedColor).toLowerCase() : '';

  // 1. Corrispondenza esatta su entrambi se entrambi presenti
  if (targetSize && targetColor) {
    const exact = variants.find((v) => {
      const vSize = cleanSizeName(v.size || v.value).toLowerCase();
      const vColor = cleanColorName(v.color || v.value).toLowerCase();
      return vSize === targetSize && vColor === targetColor;
    });
    if (exact) return exact;

    // Controllo su stringa value/title composta
    const composite = variants.find((v) => {
      const val = (v.value || v.title || '').toLowerCase();
      return val.includes(targetSize) && val.includes(targetColor);
    });
    if (composite) return composite;
  }

  // 2. Corrispondenza solo per taglia se non c'è colore o non c'è match combinato
  if (targetSize) {
    const sizeOnly = variants.find((v) => {
      const vSize = cleanSizeName(v.size || v.value).toLowerCase();
      return vSize === targetSize;
    });
    if (sizeOnly && (!targetColor || !variants.some(v => Boolean(v.color) || (v.type || '').toLowerCase().includes('color')))) {
      return sizeOnly;
    }
  }

  // 3. Corrispondenza solo per colore se le varianti sono solo colori
  if (targetColor) {
    const colorOnly = variants.find((v) => {
      const vColor = cleanColorName(v.color || v.value).toLowerCase();
      return vColor === targetColor;
    });
    if (colorOnly && (!targetSize || !variants.some(v => Boolean(v.size) || (v.type || '').toLowerCase().includes('tagli')))) {
      return colorOnly;
    }
  }

  return null;
}

/**
 * Verifica se una taglia specifica è disponibile nel colore selezionato
 */
export function isSizeAvailableInColor(
  product: Product | null | undefined,
  size: string,
  color: string
): boolean {
  if (!product) return false;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length === 0) {
    return Number(product.stock ?? 1) > 0;
  }

  const variant = findMatchingVariant(variants, size, color);
  if (!variant) {
    // Se le varianti nel prodotto non differenziano i colori, verifica solo la taglia
    const hasColorVariants = variants.some(v => Boolean(v.color) || (v.type || '').toLowerCase().includes('color'));
    if (!hasColorVariants) {
      const sizeVariant = findMatchingVariant(variants, size, undefined);
      if (sizeVariant) {
        return Number(sizeVariant.webStock ?? sizeVariant.stock ?? 0) > 0;
      }
    }
    return false;
  }

  const stock = Number(variant.webStock ?? variant.stock ?? 0);
  return stock > 0;
}

/**
 * Calcola la giacenza massima effettiva per un prodotto o specifica variante (taglia e colore).
 * Se il prodotto o la variante ha uno stock impostato (es. 5 pz), restituisce quel valore numerico.
 */
export function getProductMaxStock(
  product: Product | null | undefined,
  size?: string,
  color?: string
): number {
  if (!product) return 0;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length > 0) {
    const variant = findMatchingVariant(variants, size, color);
    if (variant) {
      const stock = Number(variant.webStock ?? (variant as any).stock);
      if (!isNaN(stock) && stock >= 0) return stock;
    }
    // Fallback: se le varianti non differenziano i colori, cerca solo la taglia
    const hasColorVariants = variants.some(v => Boolean(v.color) || (v.type || '').toLowerCase().includes('color'));
    if (!hasColorVariants && size) {
      const sizeVariant = findMatchingVariant(variants, size, undefined);
      if (sizeVariant) {
        const stock = Number(sizeVariant.webStock ?? (sizeVariant as any).stock);
        if (!isNaN(stock) && stock >= 0) return stock;
      }
    }
    // Se ha varianti ma questa combinazione non è tra di esse
    if (variant === null) {
      // Se product.stock globale è esplicitamente indicato
      if (product.stock !== undefined && product.stock !== null) {
        const pStock = Number(product.stock);
        if (!isNaN(pStock) && pStock >= 0) return pStock;
      }
      return 0;
    }
  }

  // Prodotto semplice senza varianti
  if (product.stock !== undefined && product.stock !== null) {
    const pStock = Number(product.stock);
    if (!isNaN(pStock) && pStock >= 0) return pStock;
  }

  return 15; // default fallback
}
