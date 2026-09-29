'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface ChoiceBlocksProps {
  onSelect: (category: string) => void;
  items?: any[];
}

export function ChoiceBlocks({ onSelect }: ChoiceBlocksProps) {
  return (
    <section className="px-4 sm:px-8 mb-10 font-['Montserrat',sans-serif]">
      {/* Intestazione Sezione */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 bg-neutral-900 rounded-full" />
          <h2 className="text-lg sm:text-xl font-light text-neutral-950 uppercase tracking-[0.22em]">
            COLLEZIONE & CATEGORIE
          </h2>
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 hidden sm:inline">
          Esplora la selezione
        </span>
      </div>

      {/* 
        GEOMETRIA A INCASTRO SOTTILE & COMPATTA:
        - Box 1 (Sinistra): GRANDE a tutta altezza (col-span-4 row-span-2)
        - Box 2 e Box 3 (Alto Destra): 2 box affiancati di metà altezza (col-span-4 ciascuno)
        - Box 4 (Basso Destra): 1 LUNGA di metà altezza sotto i due sopra (col-span-8)
        - Altezza complessiva sottile e proporzionata (md:h-[390px])
      */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3.5 md:h-[390px]">
        
        {/* 1. GRANDE A TUTTA ALTEZZA (A SINISTRA) */}
        <div onClick={() => onSelect('Giubbini')}
          className="md:col-span-4 md:row-span-2 h-[260px] md:h-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 bg-neutral-900"
        >
          <img
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
            alt="Giubbini"
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 group-hover:via-black/35 transition-colors duration-300" />
          
          <div className="z-10 relative flex justify-between items-start">
            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.25em] px-3 py-0.5 rounded-full font-medium">
              Must-Have
            </span>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
          </div>

          <div className="z-10 relative mt-auto">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-300 block mb-0.5 drop-shadow-sm">
              Sartoria & Capispalla
            </span>
            <h3 className="text-white font-light text-xl sm:text-2xl uppercase tracking-[0.16em] leading-tight drop-shadow-md">
              GIUBBINI
            </h3>
          </div>
        </div>

        {/* 2. ALTO A DESTRA 1 (CAMICE - METÀ ALTEZZA) */}
        <div onClick={() => onSelect('Camice')}
          className="md:col-span-4 md:row-span-1 h-[140px] md:h-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 bg-neutral-900"
        >
          <img
            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"
            alt="Camice"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 group-hover:via-black/35 transition-colors duration-300" />
          
          <div className="z-10 relative flex justify-end">
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
          </div>

          <div className="z-10 relative mt-auto">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-300 block mb-0.5 drop-shadow-sm">
              Puro Lino & Popeline
            </span>
            <h3 className="text-white font-light text-base sm:text-lg uppercase tracking-[0.16em] leading-tight drop-shadow-md">
              CAMICE
            </h3>
          </div>
        </div>

        {/* 3. ALTO A DESTRA 2 (FELPE & SHIRT - METÀ ALTEZZA) */}
        <div onClick={() => onSelect('Felpe')}
          className="md:col-span-4 md:row-span-1 h-[140px] md:h-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 bg-neutral-900"
        >
          <img
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
            alt="Felpe & Shirt"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 group-hover:via-black/35 transition-colors duration-300" />
          
          <div className="z-10 relative flex justify-between items-start">
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onSelect('Shirt')}
                className="bg-white/20 hover:bg-white hover:text-black text-white text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md transition-all backdrop-blur-md"
              >
                Shirt
              </button>
              <button 
                onClick={() => onSelect('Felpe')}
                className="bg-white/20 hover:bg-white hover:text-black text-white text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md transition-all backdrop-blur-md"
              >
                Felpe
              </button>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
          </div>

          <div className="z-10 relative mt-auto">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-300 block mb-0.5 drop-shadow-sm">
              French Terry & Cotone 240g
            </span>
            <h3 className="text-white font-light text-base sm:text-lg uppercase tracking-[0.16em] leading-tight drop-shadow-md">
              FELPE & SHIRT
            </h3>
          </div>
        </div>

        {/* 4. BASSO A DESTRA (LUNGA DI METÀ ALTEZZA SOTTO I DUE BOX - SCARPE & PANTALONI) */}
        <div onClick={() => onSelect('Scarpe')}
          className="md:col-span-8 md:row-span-1 h-[150px] md:h-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 bg-neutral-900"
        >
          {/* Foto scarpe funzionante verificata */}
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80"
            alt="Scarpe, Sneakers e Pantaloni"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:via-black/40 transition-colors duration-300" />
          
          <div className="z-10 relative flex justify-between items-start">
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onSelect('Scarpe')}
                className="bg-white/20 hover:bg-white hover:text-black text-white text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all backdrop-blur-md"
              >
                Scarpe
              </button>
              <button 
                onClick={() => onSelect('Pantalone')}
                className="bg-white/20 hover:bg-white hover:text-black text-white text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all backdrop-blur-md"
              >
                Pantalone
              </button>
              <button 
                onClick={() => onSelect('Jeans')}
                className="bg-white/20 hover:bg-white hover:text-black text-white text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-all backdrop-blur-md"
              >
                Jeans
              </button>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
          </div>

          <div className="z-10 relative mt-auto">
            <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-300 block mb-0.5 drop-shadow-sm">
              Sneakers Artigianali, Denim & Chino
            </span>
            <h3 className="text-white font-light text-base sm:text-xl uppercase tracking-[0.16em] leading-tight drop-shadow-md">
              SCARPE, JEANS & PANTALONI
            </h3>
          </div>
        </div>

      </div>
    </section>
  );
}
