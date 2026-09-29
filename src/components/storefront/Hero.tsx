'use client';

import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroProps {
  slides?: any[];
  overlayEnabled?: boolean;
}

export const FASHION_HERO_SLIDES = [
  { 
    id: 'slide-1', 
    url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85', 
    badge: 'NUOVA COLLEZIONE UOMO',
    title: 'SARTORIA & URBAN LUXURY', 
    alt: "Abiti sartoriali, cappotti e giacche dal taglio impeccabile Made in Italy.", 
    position: 'home_top' 
  },
  { 
    id: 'slide-2', 
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=85', 
    badge: 'CASHMERE & KNITWEAR',
    title: 'STILE ESSENZIALE & DISTINTO', 
    alt: "Maglieria in pura lana vergine e cashmere per una calda raffinatezza quotidiana.", 
    position: 'home_top' 
  },
  { 
    id: 'slide-3', 
    url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=2000&q=85', 
    badge: 'CASUAL RAFFINATO',
    title: 'LINEA CONTEMPORANEA', 
    alt: "Camicie su misura, pantaloni chino e capispalla per l'uomo dinamico.", 
    position: 'home_top' 
  },
  { 
    id: 'slide-4', 
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=2000&q=85', 
    badge: 'COLLEZIONE ESCLUSIVA',
    title: 'LUSSO SENZA COMPROMESSI', 
    alt: "Dettagli ricercati e finiture artigianali per un guardaroba distintivo.", 
    position: 'home_top' 
  }
];

export function Hero({ slides }: HeroProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Filtra e assicura che ci siano sempre foto valide di moda uomo
  const activeSlides = (slides && slides.length > 0 && slides.some(s => s && s.url && s.url.startsWith('http') && !s.url.includes('picsum')))
    ? slides.filter(s => s && s.url && s.url.startsWith('http') && !s.url.includes('picsum'))
    : FASHION_HERO_SLIDES;

  const nextSlide = () => {
    setHeroIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setHeroIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  // Autoplay ogni 5 secondi
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    autoPlayRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeSlides.length, heroIndex]);

  // Gestione Swipe Touch per Mobile
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) nextSlide();
    if (distance < -40) prevSlide();
  };

  const currentSlide = activeSlides[heroIndex] || activeSlides[0];

  return (
    <section 
      aria-label="Vetrina Principale Slide"
      className="relative w-full overflow-hidden mb-8 font-['Montserrat',sans-serif] select-none bg-neutral-900"
      style={{ minHeight: '440px', height: 'clamp(440px, 60vh, 640px)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Immagini Slide a tutto schermo con transizione garantita */}
      <div className="w-full h-full relative" style={{ minHeight: '440px' }}>
        {activeSlides.map((slide, idx) => {
          const isActive = idx === heroIndex;
          return (
            <div
              key={slide.id || `slide-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.url || FASHION_HERO_SLIDES[0].url}
                alt={slide.alt || slide.title || "Vincent Store Moda Uomo"}
                className="w-full h-full object-cover object-top sm:object-center transform scale-100 transition-transform duration-[6000ms] ease-out"
                style={{ transform: isActive ? 'scale(1.04)' : 'scale(1)' }}
                referrerPolicy="no-referrer"
              />
              
              {/* Sfumatura elegante in basso per leggibilità testo senza coprire la foto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
              {/* Velo leggero superiore per contrasto */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* 2. Contenuto Testuale ed Elegante a fondo slide */}
      <div className="absolute inset-x-0 bottom-0 z-20 pb-7 sm:pb-12 px-5 sm:px-10 md:px-16 pointer-events-none">
        <div className="max-w-2xl text-left">
          
          {/* Badge categoria */}
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/90 drop-shadow">
              {currentSlide?.badge || "VINCENT STORE — COLLEZIONE SARTORIALE"}
            </span>
          </div>

          {/* Titolo Principale */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-light text-white uppercase tracking-[0.16em] leading-tight mb-2 sm:mb-3 drop-shadow-lg">
            {currentSlide?.title || "Collezione Uomo Esclusiva"}
          </h1>

          {/* Sottotitolo descrittivo */}
          <p className="text-xs sm:text-sm md:text-base text-white/85 font-normal tracking-wide max-w-lg mb-4 drop-shadow line-clamp-2">
            {currentSlide?.alt || "Tessuti nobili e silhouette contemporanee per ogni momento della giornata."}
          </p>

          {/* Call to action minimalista */}
          <div className="pointer-events-auto inline-flex items-center gap-2 text-white border-b-2 border-white pb-1 text-xs uppercase font-semibold tracking-[0.2em] hover:text-white/80 hover:border-white/80 transition-colors cursor-pointer group">
            <span>Esplora i Capi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>

        </div>
      </div>

      {/* 3. Frecce di navigazione grandi, evidenti e responsive */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xl"
        aria-label="Slide precedente"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2]" />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-xl"
        aria-label="Slide successiva"
      >
        <ChevronRight className="w-6 h-6 stroke-[2]" />
      </button>

      {/* 4. Indicatori / Dots a pillola in basso a destra (solo pallini su mobile, numerazione su desktop) */}
      <div className="absolute bottom-5 right-5 sm:right-10 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15">
        <span className="hidden md:inline text-[10px] font-mono text-white/95 mr-1 tracking-wider">
          0{heroIndex + 1} / 0{activeSlides.length}
        </span>
        {activeSlides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => { e.stopPropagation(); setHeroIndex(idx); }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === heroIndex ? 'bg-white w-5 sm:w-6' : 'bg-white/40 hover:bg-white/70 w-1.5'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
