'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppProvider';

export function CatalogFilters() {
  const {
    products,
    selectedBrand,
    setSelectedBrand,
    sortBy,
    setSortBy,
    isGlobalFiltersExpanded,
    setIsGlobalFiltersExpanded,
    isDesktop
  } = useApp();

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();

  return (
    <section className="px-4 mb-8">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
        {/* Mobile Toggle / Desktop Header */}
        <div 
          onClick={() => !isDesktop && setIsGlobalFiltersExpanded(!isGlobalFiltersExpanded)}
          className={`p-4 sm:p-6 flex items-center justify-between cursor-pointer md:cursor-default ${!isDesktop && "hover:bg-gray-50 active:bg-gray-100"}`}
        >
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-brand-yellow rounded-full"></div>
             <p className="text-[11px] font-black uppercase text-brand-dark tracking-[0.2em] pointer-events-none">
               {isDesktop ? "Affina la ricerca nel catalogo" : (isGlobalFiltersExpanded ? "Chiudi filtri avanzati" : "Affina la tua ricerca")}
             </p>
          </div>
          {!isDesktop && (
            <motion.div
              animate={{ rotate: isGlobalFiltersExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-brand-yellow"
            >
              <ChevronDown size={20} />
            </motion.div>
          )}
        </div>

        {/* Desktop Filters / Mobile Expanded Content */}
        <AnimatePresence>
          {(isDesktop || isGlobalFiltersExpanded) && (
            <motion.div
              initial={isDesktop ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="px-6 pb-8 md:pt-0 pt-2 flex flex-col md:flex-row items-center md:justify-between gap-6 border-t md:border-t-0 border-gray-50">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8 w-full md:w-auto">
                  {/* Brand Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                    <label htmlFor="brand-global" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Filtra Marca:</label>
                    <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                      <select 
                        id="brand-global"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 sm:py-2.5 pr-10 text-xs font-black text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm cursor-pointer transition-all"
                      >
                        <option value="Tutti">Tutti i Produttori</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-yellow">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-px h-6 bg-gray-100"></div>

                  {/* Sort Filter */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                    <label htmlFor="sort-global" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ordina Risultati:</label>
                    <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                      <select 
                        id="sort-global"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 sm:py-2.5 pr-10 text-xs font-black text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm cursor-pointer transition-all"
                      >
                        <option value="newest">Novità & Arrivi</option>
                        <option value="price-asc">Prezzo: decrescente</option>
                        <option value="price-desc">Prezzo: crescente</option>
                        <option value="rating">Migliori Recensioni</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-yellow">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
