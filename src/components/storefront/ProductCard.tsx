'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: (p: Product) => void;
  index: number;
  reviews?: any[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onShare?: (p: Product) => void;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80";

export function ProductCard({
  product,
  onClick,
  onAddToCart,
  index,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  const displayPrice = product.price || 0;
  const imageSrc = (product.image && product.image.trim().length > 10) ? product.image : FALLBACK_IMG;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.03, 0.3),
        ease: [0.21, 1.02, 0.73, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 relative group cursor-pointer font-['Montserrat',sans-serif]"
    >
      {/* Immagine con dimensione uniforme identica per tutti i prodotti */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-100 flex-shrink-0">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        
        {/* Pulsante preferiti in alto a destra */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-red-50 text-red-500'
                : 'bg-white/85 text-neutral-600 hover:text-red-500 hover:bg-white shadow-sm'
            }`}
            title="Aggiungi ai preferiti"
          >
            <Heart className={`w-3.5 h-3.5 stroke-[1.5] ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {product.isFeatured && (
          <span className="absolute bottom-2.5 left-2.5 bg-neutral-950 text-white text-[9px] font-normal uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-sm">
            Esclusivo
          </span>
        )}
      </div>

      {/* Fascia bianca inferiore con informazioni prodotto */}
      <div className="p-4 bg-white flex flex-col flex-1 justify-between border-t border-neutral-100">
        <div>
          {product.brand && (
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-[0.22em] mb-1">
              {product.brand}
            </p>
          )}

          <h3 className="text-xs sm:text-sm font-normal text-neutral-900 line-clamp-2 mb-2 tracking-wide group-hover:text-black transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[11px] font-light text-neutral-500 mr-0.5">€</span>
            <span className="text-base font-semibold text-neutral-950 tracking-tight">
              {displayPrice.toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-8 h-8 rounded-full bg-neutral-950 hover:bg-black text-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer group/btn"
            aria-label="Aggiungi al carrello"
            title="Aggiungi al carrello"
          >
            <ShoppingCart className="w-3.5 h-3.5 stroke-[1.5] group-hover/btn:scale-110 transition-transform text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
