'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem('vincent_cookie_consent');
      if (!consent) {
        // Mostra dopo un piccolo ritardo per non aggredire l'utente al caricamento iniziale
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Permette di riaprire il banner dal footer cliccando su "Preferenze Cookie"
    const handleReopen = () => {
      setIsVisible(true);
    };
    window.addEventListener('vincent_open_cookie_preferences', handleReopen);
    return () => {
      window.removeEventListener('vincent_open_cookie_preferences', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('vincent_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem('vincent_cookie_consent', 'essential');
    } catch {}
    setIsVisible(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-lg z-50 pointer-events-auto font-['Montserrat',sans-serif]"
        >
          <div className="bg-neutral-950/95 backdrop-blur-xl text-white border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] space-y-4">
            
            {/* Header: Icona e Titolo */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shrink-0">
                  <Cookie className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium tracking-[0.15em] uppercase text-white">
                    Informativa Cookie & Privacy
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-light mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Conformità GDPR · Vincent Store</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptEssential}
                className="text-neutral-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
                title="Chiudi"
                aria-label="Chiudi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Testo esplicativo */}
            <p className="text-[11px] sm:text-xs text-neutral-300 font-light leading-relaxed">
              Utilizziamo cookie tecnici indispensabili per il funzionamento dello store, la gestione del carrello e la sicurezza dei tuoi ordini. I dati sono conservati su server sicuri gestiti direttamente da Vincent Store ed utilizzati esclusivamente per la vendita e consegna dei prodotti.
            </p>

            <div className="pt-1 text-[11px]">
              <Link
                href="/privacy-policy"
                onClick={() => setIsVisible(false)}
                className="text-neutral-300 hover:text-white underline underline-offset-4 transition-colors font-light"
              >
                Consulta la Privacy Policy completa →
              </Link>
            </div>

            {/* Pulsanti di azione */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 hover:text-white text-[11px] font-normal uppercase tracking-[0.12em] transition-all active:scale-[0.98]"
              >
                Solo Necessari
              </button>
              
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-[11px] font-medium uppercase tracking-[0.15em] transition-all shadow-md active:scale-[0.98]"
              >
                Accetta Tutti
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
