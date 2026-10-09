'use client';

/**
 * StorefrontShell — the main interactive shell of Vincent Store.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppProvider';
import { slugify, CATEGORIES } from '@/lib/data';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ModularStorefront } from '@/components/storefront/ModularStorefront';
import { VincentApp } from '@/components/storefront/VincentApp';
import { ProductSheet } from '@/components/product/ProductSheet';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { preloadLegacyAppBundle } from '@/lib/preloadLegacyApp';
import { CookieBanner } from '@/components/storefront/CookieBanner';
import { WhatsAppIcon } from '@/components/storefront/WhatsAppIcon';

export function StorefrontShell({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    products,
    setSelectedCategory,
    setSelectedProduct,
    setSelectedSubcategory,
    selectedCategory,
    selectedSubcategory,
    selectedProduct,
    pageSettings,
    isAdminOpen,
    isCartOpen,
    isCheckoutOpen,
    isAuthOpen,
    setIsCartOpen,
    isSideMenuOpen,
    cartCount,
    cartTrigger,
    handleCategorySelect,
    addToCart,
    favorites,
    toggleFavorite,
    productReviews,
  } = useApp();

  // Stato per mostrare il carrello mobile:
  // APPARE ESCLUSIVAMENTE quando la barra cerca e la barra logo sono sparite (scroll > 90px),
  // lasciando solo la barra delle categorie in cima.
  const [areBarsHidden, setAreBarsHidden] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          // Isteresi anti-tremolio sincronizzata con l'Header:
          if (y > 90) setAreBarsHidden(true);
          if (y <= 50) setAreBarsHidden(false);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showProductSheet = Boolean(
    selectedProduct &&
      !isCartOpen &&
      !isSideMenuOpen &&
      !isAdminOpen &&
      !isCheckoutOpen &&
      !isAuthOpen
  );
  const shouldShowFloatingCart = areBarsHidden || cartCount > 0;

  // Sync solo con le route Next reali (overlay home usa pushState senza cambiare pathname)
  useEffect(() => {
    if (pathname === '/privacy-policy') {
      setSelectedProduct(null);
      return;
    }

    if (pathname.startsWith('/prodotto/')) {
      const productId = pathname.split('/')[2];
      const product = products.find((p) => p.id === productId);
      if (product) setSelectedProduct(product);
      return;
    }

    if (pathname.startsWith('/categoria/')) {
      const slug = pathname.split('/')[2]?.toLowerCase();
      const matchedCat = CATEGORIES.find((c) => slugify(c) === slug);
      if (matchedCat && matchedCat !== selectedCategory) {
        setSelectedCategory(matchedCat);
        setSelectedSubcategory('Tutti');
      }
      setSelectedProduct(null);
      return;
    }

    if (pathname === '/') {
      const browserPath =
        typeof window !== 'undefined' ? window.location.pathname : '/';
      const categoryFilterActive =
        selectedCategory !== 'Tutti' || selectedSubcategory !== 'Tutti';

      if (categoryFilterActive) {
        if (browserPath.startsWith('/prodotto/')) {
          window.history.replaceState(null, '', '/');
        }
        setSelectedProduct(null);
        return;
      }

      if (browserPath.startsWith('/prodotto/')) {
        const productId = browserPath.split('/')[2];
        const product = products.find((p) => p.id === productId);
        if (product) setSelectedProduct(product);
      } else {
        setSelectedProduct(null);
      }
    }
  }, [
    pathname,
    products,
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedProduct,
    setSelectedSubcategory,
  ]);

  useBodyScrollLock(Boolean(showProductSheet || isCartOpen || isSideMenuOpen || isAuthOpen || isCheckoutOpen || isAdminOpen));

  useEffect(() => {
    if (pathname === '/privacy-policy') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  const wasAdminOpen = useRef(isAdminOpen);
  useEffect(() => {
    if (wasAdminOpen.current && !isAdminOpen) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    wasAdminOpen.current = isAdminOpen;
  }, [isAdminOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-['Montserrat',sans-serif]">
      {/* Browsing Layer (Header is shared) */}
      <Header onCategorySelect={handleCategorySelect} />
      
      <main className="flex-grow">
        {pathname === '/privacy-policy' ? (
          children
        ) : (
          <>
            <ModularStorefront />
            {children}
          </>
        )}
      </main>
      
      <Footer />
      <CookieBanner />

      {/* Floating WhatsApp Button (Desktop & Tablet) */}
      <motion.a
        href="https://wa.me/393313424069?text=Ciao%20Vincent%20Store,%20desidero%20maggiori%20informazioni"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-30 hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-950/90 text-white backdrop-blur-md shadow-xl border border-white/15 hover:bg-neutral-900 transition-all group font-['Montserrat',sans-serif]"
        title="Chat WhatsApp Diretta (+39 331 342 4069)"
        aria-label="WhatsApp"
      >
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
          <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
        </div>
        <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-neutral-200 group-hover:text-white">
          WhatsApp
        </span>
      </motion.a>

      {/* Icona Carrello Mobile a Isola:
          - Posizionata PIÙ BASSO DI 600px (top: 630px)
          - Appare solo quando le barre sono sparite con isteresi anti-scatto
          - Cerchietto grande (w-14 h-14)
          - Spostabile liberamente su e giù (drag="y")
          - Reagisce ad impulso elastico quando si aggiunge un prodotto
      */}
      <AnimatePresence>
        {shouldShowFloatingCart && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, x: 30 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 30 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
            drag="y"
            dragConstraints={{ top: -200, bottom: 120 }}
            dragElastic={0.12}
            style={{ top: '610px' }}
            className="fixed right-4 z-50 md:hidden touch-none"
          >
            <motion.button
              key={`cart-island-trigger-${cartTrigger}`}
              animate={cartTrigger > 0 ? { 
                scale: [1, 1.25, 0.95, 1.1, 1],
                rotate: [0, -8, 8, -4, 0]
              } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onClick={() => {
                preloadLegacyAppBundle();
                setIsCartOpen(true);
              }}
              className="relative w-14 h-14 rounded-full bg-neutral-950 text-white shadow-2xl flex items-center justify-center border-2 border-white/40 active:scale-90 transition-transform cursor-pointer"
              aria-label="Carrello"
              title="Apri Carrello"
            >
              <ShoppingCart className="w-6 h-6 stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[11px] font-bold min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheda Dettaglio Prodotto Standalone — Apertura Istantanea (0ms) */}
      {showProductSheet && selectedProduct && (
        <ProductSheet
          key={`product-sheet-${selectedProduct.id}`}
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            if (typeof window !== 'undefined') {
              const browserPath = window.location.pathname;
              if (browserPath.startsWith('/prodotto/')) {
                if (pathname.startsWith('/prodotto/')) {
                  router.replace('/');
                } else {
                  window.history.replaceState(null, '', '/');
                }
              }
            }
          }}
          onAddToCart={addToCart}
          reviews={productReviews}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onShare={(p) => {
            if (typeof navigator !== 'undefined' && navigator.share) {
              navigator.share({
                title: p.name,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            if (typeof window !== 'undefined') {
              window.history.pushState({ productId: p.id }, '', `/prodotto/${p.id}/${slugify(p.name)}`);
            }
          }}
          allProducts={products}
        />
      )}

      {/* Headless Layer (Legacy Modals & Admin: Cart, Checkout, Auth, Admin) */}
      <VincentApp />
    </div>
  );
}
