'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppProvider';
import { Hero } from './Hero';
import { SectionTitle } from './SectionTitle';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_PAGE_SETTINGS } from '@/lib/data';
import { HomeSlideSection } from '@/components/storefront/HomeSlideSection';

export function ModularStorefront() {
  const {
    products,
    pageSettings,
    handleProductSelect,
    addToCart,
    favorites,
    toggleFavorite,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredProducts,
    handleCategorySelect,
  } = useApp();

  // Assicura che le slide hero ci siano sempre
  const topSlides = useMemo(() => {
    const list = (pageSettings.homeSlides || [])
      .filter((s: any) => s.position === 'home_top' || !s.position)
      .filter((s: any) => s.url);
    return list.length > 0 ? list : DEFAULT_PAGE_SETTINGS.homeSlides.filter(
      (s: any) => s.position === 'home_top' || !s.position
    );
  }, [pageSettings.homeSlides]);

  const middleSlides = useMemo(() => {
    const fromSettings = (pageSettings.homeSlides || []).filter(
      (s: any) => s.position === 'home_middle' && s.url
    );
    if (fromSettings.length > 0) return fromSettings;
    return DEFAULT_PAGE_SETTINGS.homeSlides.filter(
      (s: any) => s.position === 'home_middle' && s.url
    );
  }, [pageSettings.homeSlides]);

  const bottomSlides = useMemo(() => {
    const fromSettings = (pageSettings.homeSlides || []).filter(
      (s: any) => s.position === 'home_bottom' && s.url
    );
    if (fromSettings.length > 0) return fromSettings;
    return DEFAULT_PAGE_SETTINGS.homeSlides.filter(
      (s: any) => s.position === 'home_bottom' && s.url
    );
  }, [pageSettings.homeSlides]);

  const featuredProducts = useMemo(() => {
    return products.filter((p: any) => p.isFeatured).slice(0, pageSettings.maxFeatured || 8);
  }, [products, pageSettings.maxFeatured]);

  const specialCategoryProducts = useMemo(() => {
    if (!pageSettings.isSpecialCategoryEnabled) return [];
    return products.filter((p: any) => p.isSpecialPromotion)
      .slice(0, pageSettings.specialCategoryMax || 4);
  }, [products, pageSettings.isSpecialCategoryEnabled, pageSettings.specialCategoryMax]);

  const newArrivals = useMemo(() => {
    return [...products].reverse().slice(0, pageSettings.maxNewArrivals || 15);
  }, [products, pageSettings.maxNewArrivals]);

  // Se è attiva la ricerca, mostra i risultati
  if (searchQuery !== '') {
    return (
      <div className="px-4 sm:px-8 py-10 font-['Montserrat',sans-serif]">
        <SectionTitle title="Risultati della ricerca" subtitle={`Trovati ${filteredProducts.length} prodotti per "${searchQuery}"`} />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {filteredProducts.map((product: any, index: number) => (
            <ProductCard 
              key={`search-${product.id}`} 
              product={product} 
              onClick={() => handleProductSelect(product)} 
              onAddToCart={addToCart}
              index={index}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    );
  }

  // Verifica se un filtro categoria o sottocategoria è attivo sulla home
  const isFilterActive = selectedCategory !== 'Tutti' || selectedSubcategory !== 'Tutti';
  const availableSubcategories = pageSettings.subcategories?.[selectedCategory] || [];

  return (
    <div className="flex flex-col gap-10 pt-0 pb-24 font-['Montserrat',sans-serif]">
      {/* 1. HERO SLIDE */}
      {pageSettings.isHeroEnabled !== false && (
        <Hero slides={topSlides} overlayEnabled={pageSettings.slidesOverlayEnabled} />
      )}

      {!isFilterActive &&
        pageSettings.isMiddleSlidesEnabled !== false &&
        middleSlides.length > 0 && (
          <HomeSlideSection
            slides={middleSlides}
            darken={pageSettings.slidesOverlayEnabled}
          />
        )}

      {/* 3. VETRINA DELLA HOME: FILTRABILE CON TASTO RAPIDO PER TOGLIERE IL FILTRO */}
      <section className="px-4 sm:px-8" id="vetrina-home">
        {/* Barra Filtro Attivo con tasto rapido per toglierlo */}
        {isFilterActive ? (
          <div className="mb-8">
            <div className="bg-neutral-950 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-xs uppercase tracking-widest">
                  <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.6]" />
                  <span>Filtro Vetrina:</span>
                </div>

                {/* Categoria attiva */}
                <span className="bg-white text-neutral-950 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  {selectedCategory === 'Preferiti' && <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />}
                  {selectedCategory === 'Preferiti' ? 'I Tuoi Preferiti' : selectedCategory}
                </span>

                {/* Sottocategoria attiva */}
                {selectedSubcategory && selectedSubcategory !== 'Tutti' && (
                  <span className="bg-neutral-800 text-neutral-200 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedSubcategory}
                  </span>
                )}

                <span className="text-[11px] text-neutral-400 ml-1">
                  ({filteredProducts.length} {filteredProducts.length === 1 ? 'capo trovato' : 'capi trovati'})
                </span>
              </div>

              {/* Tasto rapido per togliere il filtro */}
              <button
                onClick={() => {
                  setSelectedCategory('Tutti');
                  setSelectedSubcategory('Tutti');
                }}
                className="self-start sm:self-auto flex items-center gap-2 bg-white hover:bg-neutral-200 text-neutral-950 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-95"
                title="Rimuovi filtro e mostra tutti i capi"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
                <span>Togli Filtro</span>
              </button>
            </div>

            {/* Sottocategorie rapide selezionabili */}
            {availableSubcategories.length > 0 && selectedCategory !== 'Preferiti' && (
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 mr-1 font-medium">Sottocategorie:</span>
                <button
                  onClick={() => setSelectedSubcategory('Tutti')}
                  className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-all ${
                    selectedSubcategory === 'Tutti'
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-normal'
                  }`}
                >
                  Tutte
                </button>
                {availableSubcategories.map((sub: string) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory((prev: string) => prev === sub ? 'Tutti' : sub)}
                    className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      selectedSubcategory === sub
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-normal'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* CONTENUTO VETRINA: MOSTRA SEZIONI SE TUTTI, OPPURE GRIGLIA SE FILTRO ATTIVO */}
        {isFilterActive ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product: any, index: number) => (
                <ProductCard 
                  key={`filter-${product.id}`} 
                  product={product} 
                  onClick={() => handleProductSelect(product)} 
                  onAddToCart={addToCart}
                  index={index}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center bg-white rounded-2xl border border-neutral-150 p-8">
                <p className="text-neutral-500 font-normal text-sm mb-4">
                  {selectedCategory === 'Preferiti'
                    ? 'Non hai ancora aggiunto nessun capo ai preferiti. Clicca sul cuoricino in alto a destra sui prodotti per salvarli.'
                    : 'Nessun prodotto trovato per la categoria o sottocategoria selezionata.'}
                </p>
                <button 
                  onClick={() => {
                    setSelectedCategory('Tutti');
                    setSelectedSubcategory('Tutti');
                  }}
                  className="bg-neutral-950 text-white px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-black transition-all"
                >
                  Mostra tutti i capi
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Sezioni Standard Home quando nessun filtro è attivo */
          <div className="flex flex-col gap-12">
            {/* In Vetrina */}
            {pageSettings.isFeaturedEnabled && featuredProducts.length > 0 && (
              <div>
                <SectionTitle 
                  title={pageSettings.featuredTitle || "IN VETRINA"} 
                  subtitle="I capi più esclusivi della collezione uomo"
                />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
                  {featuredProducts.map((product: any, index: number) => (
                    <ProductCard 
                      key={`featured-${product.id}`} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Scelti Per Te */}
            {pageSettings.isSpecialCategoryEnabled && specialCategoryProducts.length > 0 && (
              <div>
                <SectionTitle 
                  title={pageSettings.specialCategoryTitle || "SCELTI PER TE"} 
                  accentColor="bg-neutral-900"
                  subtitle="Pezzi iconici selezionati dai nostri sarti"
                />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
                  {specialCategoryProducts.map((product: any, index: number) => (
                    <ProductCard 
                      key={`special-${product.id}`} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Nuovi Arrivi */}
            {pageSettings.isNewArrivalsEnabled && (
              <div>
                <SectionTitle 
                  title={pageSettings.newArrivalsTitle || "NUOVI ARRIVI"} 
                  subtitle="Le ultime novità appena arrivate in boutique"
                />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
                  {newArrivals.map((product: any, index: number) => (
                    <ProductCard 
                      key={`new-${product.id}`} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {pageSettings.isBottomSlidesEnabled !== false &&
              bottomSlides.length > 0 && (
                <HomeSlideSection
                  slides={bottomSlides}
                  darken={pageSettings.slidesOverlayEnabled}
                />
              )}
          </div>
        )}
      </section>
    </div>
  );
}
