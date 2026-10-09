'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  User, 
  ShoppingCart, 
  Heart,
  X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppProvider';
import { TopBarStrip } from '@/components/storefront/TopBarStrip';
import { preloadLegacyAppBundle } from '@/lib/preloadLegacyApp';

interface HeaderProps {
  onCategorySelect: (cat: string, sub?: string) => void;
}

export function Header({ onCategorySelect }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    pageSettings,
    selectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
    cartCount,
    setIsCartOpen,
    setIsSideMenuOpen,
    setIsAuthOpen,
    currentUser,
    setAuthStep,
    cartTrigger,
    favorites,
  } = useApp();

  const [isMobile, setIsMobile] = useState(false);
  const [hideSearch, setHideSearch] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;

          if (window.innerWidth < 768) {
            // Scomparsa progressiva nello scroll verso il basso:
            if (y > 20) setHideSearch(true);
            if (y > 55) setHideTopBar(true);
            if (y > 90) setHideLogo(true);

            // Ricomparsa ordinata e fluida senza scatti o lampeggi risalendo verso l'alto (ampia isteresi):
            if (y <= 50) setHideLogo(false);
            if (y <= 30) setHideTopBar(false);
            if (y <= 10) setHideSearch(false);
          } else {
            setHideSearch(false);
            setHideTopBar(false);
            setHideLogo(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isSearchHiddenMobile = isMobile && hideSearch;
  const isTopBarHiddenMobile = isMobile && hideTopBar;
  const isLogoHiddenMobile = isMobile && hideLogo;

  const handleNavigateCategory = (cat: string, sub: string = 'Tutti') => {
    if (pathname && pathname !== '/') {
      router.push('/');
    }
    onCategorySelect(cat, sub);
  };

  return (
    <header 
      style={{ overflowAnchor: 'none' }}
      className="sticky top-0 z-40 bg-white font-['Montserrat',sans-serif] shadow-sm select-none"
    >
      
      {/* 1. Top Bar: Minimal Luxury Bar (Altezza ridotta ed ultra-sottile) */}
      <div 
        style={{
          height: isTopBarHiddenMobile ? '0px' : '40px',
          opacity: isTopBarHiddenMobile ? 0 : 1,
          overflow: 'hidden',
          borderBottomWidth: isTopBarHiddenMobile ? '0px' : '1px',
          willChange: 'height, opacity',
          transition: 'height 0.35s ease-out, opacity 0.3s ease-out, border 0.35s ease-out'
        }}
        className="bg-neutral-950 text-white relative border-neutral-800"
      >
        <div className="h-10 w-full">
          <TopBarStrip pageSettings={pageSettings} />
        </div>
      </div>

      {/* 2. Main Header Row: Logo + Ricerca + Hamburger + Azioni (Altezza allungata +15px = 85px / 95px)
             Strutturato a tendina fissa per eliminare ogni lampeggio o scatto dei contenuti
      */}
      <div 
        style={{
          height: isLogoHiddenMobile ? '0px' : (isMobile ? '85px' : '95px'),
          opacity: isLogoHiddenMobile ? 0 : 1,
          overflow: 'hidden',
          borderBottomWidth: isLogoHiddenMobile ? '0px' : '1px',
          willChange: 'height, opacity',
          transition: 'height 0.4s ease-out, opacity 0.35s ease-out, border 0.4s ease-out'
        }}
        className="origin-top bg-white border-neutral-100"
      >
        <div className="h-[85px] md:h-[95px] px-4 sm:px-8 flex items-center justify-between gap-4 sm:gap-6 w-full pt-6 md:pt-7">
          {/* Left: Hamburger sottile + Logo con altezza allungata ed elegante */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <button 
              onMouseEnter={preloadLegacyAppBundle}
              onFocus={preloadLegacyAppBundle}
              onClick={() => {
                preloadLegacyAppBundle();
                setIsSideMenuOpen(true);
              }}
              className="p-2 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-full transition-all group flex items-center justify-center cursor-pointer"
              aria-label="Menu categorie"
              title="Menu Categorie"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.2] group-hover:scale-105 transition-transform text-neutral-900" />
            </button>

            <button 
              onClick={() => handleNavigateCategory("Tutti")}
              className="flex flex-col text-left group"
            >
              <span className="text-xl sm:text-2xl font-light uppercase tracking-[0.28em] text-neutral-950 group-hover:opacity-80 transition-opacity">
                VINCENT
              </span>
              <span className="text-[9px] sm:text-[10px] font-normal tracking-[0.45em] text-neutral-500 uppercase -mt-0.5 sm:-mt-1 group-hover:text-neutral-900 transition-colors">
                STORE
              </span>
            </button>
          </div>

          {/* Center: Campo Ricerca Desktop (Frase a sinistra, lente a destra, testo centrato verticalmente al pixel) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative items-center">
            <input 
              type="text" 
              placeholder="Cerca nella collezione Vincent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-white rounded-full pl-5 pr-12 text-xs font-light text-neutral-900 border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-all shadow-none py-0 leading-normal flex items-center placeholder:text-neutral-400 placeholder:font-light"
            />
            <div className="absolute right-0 top-0 h-full pr-4 flex items-center gap-2 text-neutral-400 pointer-events-none">
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-neutral-800 p-0.5 rounded-full transition-colors pointer-events-auto"
                  title="Cancella ricerca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <Search className="w-4 h-4 stroke-[1.4]" />
            </div>
          </div>

          {/* Right: Actions (Account, Cuoricino Preferenze, Carrello) */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            {/* Account Utente */}
            <button 
              onClick={() => {
                if (currentUser) {
                  setAuthStep('profile');
                } else {
                  setAuthStep('login');
                }
                setIsAuthOpen(true);
              }}
              className={`flex items-center gap-2 transition-colors group p-1 ${currentUser ? 'text-black font-semibold' : 'text-neutral-700 hover:text-black'}`}
              aria-label="Account"
            >
              <User className={`w-5 h-5 transition-transform group-hover:scale-105 ${currentUser ? 'text-black fill-black stroke-[2.2]' : 'text-neutral-800 stroke-[1.3]'}`} />
              <span className={`hidden lg:inline text-[11px] uppercase tracking-[0.16em] transition-colors ${currentUser ? 'font-bold text-black' : 'font-normal text-neutral-600 group-hover:text-black'}`}>
                {currentUser ? currentUser.name.split(' ')[0] : 'Accedi'}
              </span>
            </button>

            {/* Cuoricino Preferenze */}
            <button 
              onClick={() => {
                if (selectedCategory === 'Preferiti') {
                  onCategorySelect('Tutti');
                } else {
                  onCategorySelect('Preferiti');
                }
              }}
              className="relative flex items-center gap-1.5 text-neutral-700 hover:text-black transition-colors group p-1"
              aria-label="I tuoi Preferiti"
              title="I tuoi capi preferiti"
            >
              <Heart className={`w-5 h-5 stroke-[1.3] transition-all group-hover:scale-110 ${favorites.length > 0 ? 'text-red-500 fill-red-500' : 'text-neutral-800'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-neutral-950 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {favorites.length}
                </span>
              )}
              <span className="hidden lg:inline text-[11px] font-normal uppercase tracking-[0.16em] text-neutral-600 group-hover:text-black transition-colors">
                Preferiti
              </span>
            </button>
            
            {/* Carrello Header */}
            <button 
              onMouseEnter={preloadLegacyAppBundle}
              onFocus={preloadLegacyAppBundle}
              onClick={() => {
                preloadLegacyAppBundle();
                setIsCartOpen(true);
              }}
              className="relative flex items-center gap-2 text-neutral-800 hover:text-black group p-1 cursor-pointer"
              aria-label="Carrello acquisti"
            >
              <motion.div 
                key={cartTrigger}
                animate={cartTrigger > 0 ? { scale: [1, 1.25, 1] } : {}}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5 stroke-[1.3] group-hover:scale-105 transition-transform text-neutral-900" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-neutral-950 text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </motion.div>
              <span className="hidden sm:inline text-[10px] font-light uppercase tracking-[0.2em] text-neutral-400">Carrello</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation / Categories Row: RIMANE SEMPRE VISIBILE E STICKY IN CIMA */}
      <div className="bg-white border-b border-neutral-200/70 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center overflow-hidden z-20">
        <div className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 items-center flex-1 scroll-smooth">
          {/* Categorie */}
          <div className="flex items-center gap-1 sm:gap-2">
            {pageSettings.categories.filter((c: string) => c !== "Tutti").map((cat: string) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={`cat-${cat}`}
                  onClick={() => handleNavigateCategory(cat, 'Tutti')}
                  className="relative px-3 py-1 flex-shrink-0 transition-all duration-200 group cursor-pointer"
                >
                  <span className={`text-xs uppercase tracking-[0.18em] transition-all ${
                    isSelected
                      ? "font-bold text-neutral-950 border-b-2 border-neutral-950 pb-1"
                      : "font-light text-neutral-500 hover:text-neutral-900"
                  }`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3b. Sottocategorie: Seconda barra dedicata che appare sotto alla selezione di una categoria */}
      <AnimatePresence>
        {selectedCategory !== "Tutti" && selectedCategory !== "Preferiti" && (pageSettings.subcategories[selectedCategory] || []).length > 0 && (
          <motion.div
            key={`subcategories-bar-${selectedCategory}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-neutral-50/95 border-b border-neutral-200/80 px-3 sm:px-8 py-2 overflow-hidden z-10 shadow-xs"
          >
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 items-center flex-1 scroll-smooth">
              <span className="text-[9px] uppercase tracking-[0.22em] text-neutral-400 font-semibold mr-1 hidden sm:inline flex-shrink-0">
                Sottocategorie:
              </span>
              <button
                onClick={() => setSelectedSubcategory('Tutti')}
                className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[0.14em] transition-all flex-shrink-0 cursor-pointer ${
                  selectedSubcategory === 'Tutti'
                    ? "bg-neutral-950 text-white font-medium shadow-xs"
                    : "bg-white text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 font-light"
                }`}
              >
                Tutte
              </button>
              {(pageSettings.subcategories[selectedCategory] || []).map((sub: string) => {
                const isSubActive = selectedSubcategory === sub;
                return (
                  <button
                    key={`sub-${sub}`}
                    onClick={() => setSelectedSubcategory((prev) => prev === sub ? 'Tutti' : sub)}
                    className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[0.14em] transition-all flex-shrink-0 cursor-pointer ${
                      isSubActive
                        ? "bg-neutral-950 text-white font-medium shadow-xs"
                        : "bg-white text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200 font-light"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Mobile Search Input: Strutturato a tendina fissa senza scatti */}
      <div 
        style={{
          height: isSearchHiddenMobile ? '0px' : (isMobile ? '46px' : '0px'),
          opacity: isSearchHiddenMobile ? 0 : (isMobile ? 1 : 0),
          overflow: 'hidden',
          borderBottomWidth: isSearchHiddenMobile ? '0px' : (isMobile ? '1px' : '0px'),
          display: !isMobile ? 'none' : 'block',
          willChange: 'height, opacity',
          transition: 'height 0.35s ease-out, opacity 0.3s ease-out, border 0.35s ease-out'
        }}
        className="bg-neutral-50/70 border-neutral-100"
      >
        <div className="h-[46px] px-4 flex items-center w-full">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Cerca nella collezione Vincent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-white rounded-full pl-4 pr-10 text-xs font-light text-neutral-900 border border-neutral-200 focus:outline-none focus:border-neutral-900"
            />
            <button className="absolute right-0 top-0 h-full px-3 text-neutral-400">
              <Search className="w-3.5 h-3.5 stroke-[1.4]" />
            </button>
          </div>
        </div>
      </div>

    </header>
  );
}
