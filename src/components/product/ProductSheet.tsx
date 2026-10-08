'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Share2,
  Maximize,
  Box,
  Zap,
  FileText,
  ExternalLink,
  FileSpreadsheet,
  Compass,
  Play,
  Minus,
  Plus,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Product } from '@/lib/types';
import { PRODUCTS } from '@/lib/data';
import { getColorHex, getProductVariantInfo, findMatchingVariant, isSizeAvailableInColor, getProductMaxStock } from '@/lib/productVariants';
import { useApp } from '@/context/AppProvider';

interface ProductSheetProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  isDesktop?: boolean;
  reviews?: any[];
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  onShare?: (p: Product) => void;
  onSelectProduct?: (p: Product) => void;
  allProducts?: Product[];
}

export const PdfViewerModal = ({ url, title, onClose }: { url: string; title: string; onClose: () => void }) => {
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    if (url && url.startsWith('data:application/pdf')) {
      const fetchBlob = async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const bUrl = URL.createObjectURL(blob);
          setBlobUrl(bUrl);
        } catch (err) {
          console.error('Error creating PDF blob:', err);
          setBlobUrl(url);
        }
      };
      fetchBlob();
    } else {
      setBlobUrl(url);
    }

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (!url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-10 bg-white rounded-[2rem] shadow-2xl z-[1001] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-neutral-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">{title}</h3>
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Documento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-neutral-900 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 bg-gray-50 relative">
          <iframe src={blobUrl} className="w-full h-full border-none" title={title} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export function ProductSheet({
  product,
  onClose,
  onAddToCart,
  reviews = [],
  favorites = [],
  toggleFavorite,
  onShare,
  onSelectProduct,
  allProducts = [],
}: ProductSheetProps) {
  const { cart, addToast } = useApp();
  const [quantity, setQuantity] = useState(1);
  const variantInfo = useMemo(() => getProductVariantInfo(product), [product]);
  const [selectedColor, setSelectedColor] = useState<string>(() => variantInfo.colors[0] || 'Nero');
  const [selectedSize, setSelectedSize] = useState<string>(() => variantInfo.sizes[0] || 'M');

  const maxStock = useMemo(() => {
    return getProductMaxStock(product, selectedSize, selectedColor);
  }, [product, selectedSize, selectedColor]);

  // Se cambia variante e la quantità selezionata supera la giacenza massima, adattala
  useEffect(() => {
    if (maxStock > 0 && quantity > maxStock) {
      setQuantity(Math.max(1, maxStock));
    }
  }, [maxStock]);

  useEffect(() => {
    if (variantInfo.colors.length > 0 && !variantInfo.colors.includes(selectedColor)) {
      setSelectedColor(variantInfo.colors[0]);
    }
    if (variantInfo.sizes.length > 0 && !variantInfo.sizes.includes(selectedSize)) {
      const firstAvailable = variantInfo.sizes.find(sz => isSizeAvailableInColor(product, sz, selectedColor));
      setSelectedSize(firstAvailable || variantInfo.sizes[0]);
    }
  }, [variantInfo, selectedColor, product]);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (!initial[v.type]) initial[v.type] = v.value;
    });
    return initial;
  });
  const [activeImage, setActiveImage] = useState(product.image);
  const isFavorite = favorites.includes(product.id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [corniceTouchStartY, setCorniceTouchStartY] = useState<number | null>(null);
  const [corniceDragOffset, setCorniceDragOffset] = useState<number>(0);

  const handleCorniceTouchStart = (e: React.TouchEvent) => {
    setCorniceTouchStartY(e.touches[0].clientY);
  };

  const handleCorniceTouchMove = (e: React.TouchEvent) => {
    if (corniceTouchStartY === null) return;
    const diff = e.touches[0].clientY - corniceTouchStartY;
    if (diff > 0) {
      setCorniceDragOffset(diff);
      if (diff > 60) {
        setCorniceTouchStartY(null);
        setCorniceDragOffset(0);
        onClose();
      }
    }
  };

  const handleCorniceTouchEnd = () => {
    if (corniceDragOffset > 35) {
      onClose();
    }
    setCorniceTouchStartY(null);
    setCorniceDragOffset(0);
  };

  const variantsByType = useMemo(() => {
    const groups: Record<string, any[]> = {};
    product.variants?.forEach((v) => {
      if (!groups[v.type]) groups[v.type] = [];
      if (!groups[v.type].some((item) => item.value === v.value)) {
        groups[v.type].push(v);
      }
    });
    return groups;
  }, [product.variants]);

  const selectedVariantObject = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return findMatchingVariant(product.variants, selectedSize, selectedColor);
  }, [product.variants, selectedSize, selectedColor]);

  // Disponibilità effettiva della combinazione taglia + colore
  const isAvailable = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariantObject) return false;
      return Number(selectedVariantObject.webStock ?? selectedVariantObject.stock ?? 0) > 0;
    }
    return Number(product.stock ?? 1) > 0;
  }, [product.variants, product.stock, selectedVariantObject]);

  useEffect(() => {
    if (selectedVariantObject?.image) {
      setActiveImage(selectedVariantObject.image);
    } else {
      setActiveImage(product.image);
    }
  }, [selectedVariantObject, product.image]);

  const displayPrice = useMemo(() => {
    const basePrice = product.price || 0;
    if (selectedVariantObject) {
      if (selectedVariantObject.costType === 'fixed') return selectedVariantObject.costValue || basePrice;
      if (selectedVariantObject.costType === 'delta') return basePrice + (selectedVariantObject.costValue || 0);
      if (selectedVariantObject.costType === 'percent')
        return basePrice * (1 + (selectedVariantObject.costValue || 0) / 100);
    }
    return basePrice;
  }, [product.price, selectedVariantObject]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const relatedProducts = useMemo(() => {
    if (product.relatedProductIds && product.relatedProductIds.length > 0) {
      return allProducts.filter((p) => product.relatedProductIds?.includes(p.id));
    }
    const pool = allProducts.length > 0 ? allProducts : PRODUCTS;
    return pool.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 8);
  }, [product, allProducts]);

  return (
    <>
      {/* Sfondo scuro semitrasparente */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] transition-opacity cursor-pointer"
      />

      {/* Box modale perfettamente centrato sia su desktop che su mobile */}
      <div
        style={{
          transform: corniceDragOffset > 0 ? `translateY(${corniceDragOffset}px)` : undefined,
          transition: corniceDragOffset === 0 ? 'transform 0.25s ease-out' : 'none',
        }}
        className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto z-[100] bg-white rounded-t-[28px] md:rounded-[36px] shadow-2xl flex flex-col h-[92vh] md:h-[86vh] w-full md:w-[92vw] md:max-w-5xl lg:max-w-6xl overflow-hidden transition-all duration-300 ease-out font-['Montserrat',sans-serif]"
      >
        {/* Maniglia trascinamento per mobile e chiusura */}
        <div
          onTouchStart={handleCorniceTouchStart}
          onTouchMove={handleCorniceTouchMove}
          onTouchEnd={handleCorniceTouchEnd}
          onClick={onClose}
          className="w-full pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center touch-none select-none hover:bg-neutral-50 transition-colors"
          title="Trascina verso il basso per chiudere"
          aria-label="Chiudi finestra dettaglio"
        >
          <div className="w-14 h-1.5 bg-neutral-300 hover:bg-neutral-400 rounded-full transition-colors shadow-sm" />
          <span className="text-[9px] uppercase tracking-widest text-neutral-400 mt-1 font-light">
            Trascina verso il basso per chiudere
          </span>
        </div>

        <div className="overflow-y-auto pb-32 px-5 sm:px-8 lg:p-10 flex-1">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            {/* COLUMN 1: PHOTOS (5/12) */}
            <div className="lg:col-span-5 lg:sticky lg:top-0">
              <div
                className="relative aspect-square rounded-3xl overflow-hidden mb-4 bg-gray-50 border border-gray-100 cursor-pointer group"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Maximize className="w-5 h-5 text-neutral-900" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite?.(product.id);
                    }}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${
                      isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/80 text-neutral-700 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  {onShare && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(product);
                      }}
                      className="p-2.5 rounded-full bg-white/80 backdrop-blur-md text-neutral-700 hover:text-neutral-950 transition-all hover:scale-110 active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnails con scroll */}
              <div className="relative mb-6">
                <div
                  className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
                >
                  <button
                    onClick={() => setActiveImage(product.image)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      activeImage === product.image ? 'border-neutral-950 shadow-sm' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {product.image && (
                      <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </button>
                  {(product?.gallery || [])
                    .filter((img) => img !== product.image)
                    .map((img, idx) => (
                      <button
                        key={`gallery-${idx}`}
                        onClick={() => setActiveImage(img)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          activeImage === img ? 'border-neutral-950 shadow-sm' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        {img && <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </button>
                    ))}
                  {product.has3D && (
                    <button className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-900 flex flex-col items-center justify-center text-white flex-shrink-0 hover:bg-black transition-colors cursor-pointer">
                      <Box className="w-5 h-5 mb-0.5" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">3D</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: DESCRIPTION & TECH SPECS (4/12) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em]">
                    {product.category}
                  </p>
                  {product.brand && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <p className="text-[10px] font-bold text-neutral-900 uppercase tracking-[0.2em]">
                        {product.brand}
                      </p>
                    </>
                  )}
                </div>
                {Boolean(product.name) && (
                  <h2 className="text-xl lg:text-2xl font-bold text-neutral-950 leading-snug">
                    {product.name}
                  </h2>
                )}
                {selectedVariantObject?.note && (
                  <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <p className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">NOTA</p>
                    <p className="text-xs text-neutral-800 mt-0.5">{selectedVariantObject.note}</p>
                  </div>
                )}
              </div>

              {/* Dettagli Sartoriali (Materiale, Manifattura, Vestibilità) - Mostrati solo se compilati */}
              {(Boolean(product.material?.trim()) || Boolean(product.manufacturing?.trim()) || Boolean(product.fit?.trim())) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-neutral-900 border-l-3 border-neutral-950 pl-3">
                    Dettagli Sartoriali
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.material?.trim() && (
                      <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/60">
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Materiale</p>
                        <p className="text-xs font-semibold text-neutral-900">{product.material.trim()}</p>
                      </div>
                    )}
                    {product.manufacturing?.trim() && (
                      <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/60">
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Manifattura</p>
                        <p className="text-xs font-semibold text-neutral-900">{product.manufacturing.trim()}</p>
                      </div>
                    )}
                    {product.fit?.trim() && (
                      <div className="bg-neutral-50/80 p-3 rounded-xl border border-neutral-200/60 sm:col-span-2">
                        <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">Vestibilità</p>
                        <p className="text-xs font-semibold text-neutral-900">{product.fit.trim()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description - Mostrata solo se presente e non vuota */}
              {Boolean(product.description && product.description.replace(/<[^>]*>/g, '').trim().length > 0) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-neutral-900 border-l-3 border-neutral-950 pl-3">
                    Descrizione
                  </h4>
                  <div className="text-neutral-600 text-xs sm:text-sm leading-relaxed space-y-3">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} className="rich-content" />
                  </div>
                </div>
              )}

              {/* Caratteristiche / Specifiche - Mostrate solo se presenti */}
              {(Boolean(product.features?.trim()) || (product?.specs && Object.keys(product.specs).length > 0) || ((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || (!selectedVariantObject && product.showEan && product.ean))) && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-neutral-900 border-l-3 border-neutral-950 pl-3">
                    Caratteristiche
                  </h4>
                  {product.features?.trim() && (
                    <div className="p-3.5 bg-neutral-50/90 rounded-xl border border-neutral-200/70 text-xs text-neutral-700 leading-relaxed font-medium">
                      {product.features.trim()}
                    </div>
                  )}
                  {(((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || (!selectedVariantObject && product.showEan && product.ean)) || (product?.specs && Object.keys(product.specs).length > 0)) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) ||
                        (!selectedVariantObject && product.showEan && product.ean)) && (
                        <div className="bg-neutral-950 text-white p-3 rounded-xl border border-neutral-800 shadow-sm col-span-2">
                          <p className="text-[9px] text-white/60 uppercase font-semibold mb-0.5">Codice EAN</p>
                          <p className="text-xs font-mono tracking-widest">{selectedVariantObject?.ean || product.ean}</p>
                        </div>
                      )}
                      {product?.specs && Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <p className="text-[9px] text-neutral-400 uppercase font-medium mb-0.5">{key}</p>
                          <p className="text-xs font-semibold text-neutral-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              {(product.techSheet || product.manual) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-neutral-900 border-l-3 border-neutral-950 pl-3">
                    Documentazione
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {product.techSheet && (
                      <button
                        onClick={() => setActivePdf({ url: product.techSheet!, title: 'Scheda Tecnica' })}
                        className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-4 h-4 text-neutral-700" />
                          <span className="text-xs font-medium text-neutral-900 uppercase tracking-tight">
                            Scheda Tecnica
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                    {product.manual && (
                      <button
                        onClick={() => setActivePdf({ url: product.manual!, title: "Manuale d'Uso" })}
                        className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Compass className="w-4 h-4 text-neutral-700" />
                          <span className="text-xs font-medium text-neutral-900 uppercase tracking-tight">
                            Manuale d'Uso (PDF)
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: PRICE & VARIANTS (3/12) */}
            <div className="lg:col-span-3 lg:bg-neutral-50/70 lg:p-7 lg:rounded-3xl lg:border lg:border-neutral-200/70 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 line-through">
                      €{((displayPrice || 0) * 1.2).toFixed(2)}
                    </span>
                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Promo
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                    €{(displayPrice || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">SKU:</span>
                  <span className="text-[10px] font-mono text-neutral-700">
                    {selectedVariantObject?.sku || product.sku || 'N/A'}
                  </span>
                </div>

                {/* Selettore Colori (Pallini rotondi senza testo) */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-medium text-[11px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span>Colore</span>
                    <span className="text-neutral-500 font-normal">— {selectedColor}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {variantInfo.colors.map((col) => {
                      const isSelected = selectedColor === col;
                      const hex = getColorHex(col);
                      const isWhite = hex.toLowerCase() === '#ffffff';

                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          title={col}
                          aria-label={`Colore ${col}`}
                          className={`w-7 h-7 rounded-full transition-all cursor-pointer shrink-0 ${
                            isWhite ? 'border border-neutral-300' : 'border border-black/10'
                          } ${
                            isSelected
                              ? 'ring-2 ring-neutral-950 ring-offset-2 ring-offset-white scale-110 shadow-sm'
                              : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Selettore Taglie Minimal */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[11px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <span>Taglia</span>
                      <span className="text-neutral-500 font-normal">— {selectedSize}</span>
                    </h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                      isAvailable
                        ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200'
                        : 'text-red-600 bg-red-50/90 border-red-200'
                    }`}>
                      {isAvailable ? 'Disponibile' : 'Non disponibile'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {variantInfo.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      const isSzAvailable = isSizeAvailableInColor(product, sz, selectedColor);

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`relative min-w-[44px] h-10 px-3.5 rounded-xl text-xs uppercase tracking-wider font-medium transition-all border cursor-pointer select-none flex items-center justify-center ${
                            isSelected
                              ? isSzAvailable
                                ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                                : 'border-neutral-900 bg-neutral-900 text-neutral-200 shadow-xs ring-1 ring-red-400/50'
                              : isSzAvailable
                                ? 'border-neutral-200 hover:border-neutral-900 text-neutral-800 bg-white hover:bg-neutral-50'
                                : 'border-dashed border-neutral-300 bg-neutral-100/70 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'
                          }`}
                          title={isSzAvailable ? `Taglia ${sz} — Disponibile` : `Taglia ${sz} — Non disponibile in ${selectedColor}`}
                        >
                          <span className={!isSzAvailable && !isSelected ? 'line-through decoration-neutral-400 decoration-[1.5px]' : ''}>
                            {sz}
                          </span>
                          {!isSzAvailable && (
                            <span
                              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Eventuali Altre Varianti Personalizzate */}
                {Object.entries(variantInfo.customGroups).map(([type, options]) => (
                  <div key={type} className="space-y-2 pt-2">
                    <h4 className="font-semibold text-[10px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      {type}
                      {selectedVariants[type] && (
                        <span className="text-neutral-500 font-normal">— {selectedVariants[type]}</span>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt: any) => (
                        <button
                          key={opt.id || opt.value}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [type]: opt.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-tight transition-all border cursor-pointer ${
                            selectedVariants[type] === opt.value
                              ? 'border-neutral-950 bg-neutral-950 text-white font-semibold shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-400 text-neutral-600 bg-white font-normal'
                          }`}
                        >
                          {opt.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {isAvailable ? (
                  <div className="flex items-center justify-between gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Disponibile in pronta consegna</span>
                    </div>
                    {maxStock > 0 && (
                      <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                        maxStock <= 5 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {maxStock <= 5 ? `Solo ${maxStock} pz rimasti` : `${maxStock} pz disp.`}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50/90 p-3 rounded-xl border border-red-200">
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Non disponibile in questa combinazione</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-neutral-200/80">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-neutral-900 border-l-3 border-neutral-950 pl-3">
                  Potrebbe interessarti anche
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scroll('left')}
                    className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                ref={carouselRef}
                className="flex overflow-x-auto no-scrollbar gap-4 pb-3 snap-x snap-mandatory scroll-smooth"
              >
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct?.(p)}
                    className="flex-shrink-0 w-40 sm:w-48 snap-start bg-white border border-neutral-200/80 rounded-2xl p-3 shadow-xs group cursor-pointer hover:shadow-md transition-all active:scale-95"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2.5 bg-neutral-100">
                      {p.image && (
                        <img
                          src={p.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <h5 className="text-[11px] font-medium text-neutral-900 line-clamp-1">{p.name}</h5>
                    <p className="text-xs font-semibold text-neutral-950 mt-1">€{(p.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Inferiore */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/80 p-4 sm:p-5 lg:px-10 flex items-center justify-between gap-3 sm:gap-6 z-20">
          <div className="flex items-center bg-neutral-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-xs hover:bg-neutral-50 active:scale-90 transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base">{quantity}</span>
            <button
              disabled={quantity >= maxStock || maxStock <= 0}
              onClick={() => {
                if (quantity >= maxStock) {
                  addToast(`Disponibilità massima raggiunta: solo ${maxStock} pezzi disponibili per questa variante.`, 'info');
                  return;
                }
                setQuantity(quantity + 1);
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-xs transition-all ${
                quantity >= maxStock || maxStock <= 0
                  ? 'opacity-35 cursor-not-allowed text-neutral-400'
                  : 'hover:bg-neutral-50 active:scale-90 text-neutral-900 cursor-pointer'
              }`}
              title={quantity >= maxStock ? `Disponibilità massima raggiunta (${maxStock} pz)` : 'Aumenta quantità'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end flex-1 pr-4 border-r border-neutral-200">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Totale</span>
              <span className="text-xl font-bold text-neutral-950">€{(displayPrice * quantity).toFixed(2)}</span>
            </div>

            <button
              disabled={!isAvailable || maxStock <= 0}
              onClick={() => {
                if (!isAvailable || maxStock <= 0) return;
                const cartItemId = `${product.id}__${selectedSize}__${selectedColor}`;
                const inCart = cart?.find((i) => (i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`) === cartItemId);
                const currentInCartQty = inCart ? inCart.quantity : 0;

                if (currentInCartQty >= maxStock) {
                  addToast(`Hai già aggiunto il massimo disponibile (${maxStock} pz) di questo articolo nel carrello!`, 'error');
                  return;
                }

                const allowedToAdd = Math.min(quantity, maxStock - currentInCartQty);
                if (allowedToAdd < quantity) {
                  addToast(`Aggiunti ${allowedToAdd} pezzi: limite massimo di ${maxStock} pezzi raggiunto nel carrello.`, 'info');
                }

                const itemToAddToCart = {
                  ...product,
                  price: displayPrice,
                  sku: selectedVariantObject?.sku || product.sku,
                  name: product.name,
                  selectedSize,
                  selectedColor,
                  cartItemId,
                };
                for (let i = 0; i < allowedToAdd; i++) onAddToCart(itemToAddToCart as any);
                onClose();
              }}
              className={`flex-1 sm:flex-[2] h-12 sm:h-14 rounded-xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all uppercase text-xs tracking-widest px-3 ${
                isAvailable && maxStock > 0
                  ? 'bg-neutral-950 hover:bg-black text-white active:scale-95 shadow-lg cursor-pointer'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart className="w-4 h-4 hidden sm:block" />
              <span className="text-[11px] sm:text-xs font-semibold sm:font-bold tracking-wider sm:tracking-widest whitespace-nowrap">
                {isAvailable && maxStock > 0 ? 'Aggiungi al carrello' : 'Non disponibile'}
              </span>
            </button>

            {/* Piccolo pulsante icona con la X dello stesso stile che chiude la scheda del dettaglio */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-950 hover:bg-black text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer flex-shrink-0"
              aria-label="Chiudi scheda prodotto"
              title="Chiudi scheda prodotto"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="absolute top-6 right-6 flex gap-4">
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-2xl"
            >
              {activeImage && (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain bg-black"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>

            <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar max-w-full px-4">
              {[product.image, ...(product.gallery || [])].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImage === img ? 'border-white shadow-md' : 'border-white/20'
                  }`}
                >
                  {img && <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      {activePdf && (
        <PdfViewerModal
          url={activePdf.url}
          title={activePdf.title}
          onClose={() => setActivePdf(null)}
        />
      )}
    </>
  );
}
