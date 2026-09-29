'use client';

import React from 'react';
import { useApp } from '@/context/AppProvider';
import { 
  Instagram, 
  MapPin, 
  Phone, 
  Mail, 
  Shield 
} from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const { companySettings, setIsAdminOpen } = useApp();

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-28 px-6 no-print font-['Montserrat',sans-serif] border-t border-neutral-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
        {/* Brand Info */}
        <div className="space-y-6">
          <div>
            <span className="text-2xl font-light tracking-[0.3em] uppercase text-white block mb-1">
              VINCENT
            </span>
            <span className="text-[10px] font-light tracking-[0.35em] uppercase text-neutral-400">
              STORE MILANO
            </span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            {companySettings.mission || "L'eleganza maschile contemporanea. Capi sartoriali di prestigio, tessuti nobili e design senza tempo per l'uomo raffinato."}
          </p>
          <div className="flex gap-3">
            <motion.a
              whileHover={{ y: -3 }}
              href="https://instagram.com/vincentstore_milano"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 stroke-[1.4]" />
            </motion.a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-normal uppercase tracking-[0.25em] mb-6 text-neutral-200">Collezione</h3>
          <ul className="space-y-3 text-neutral-400 text-xs font-light tracking-wide">
            {['Giacche & Cappotti', 'Camicie & Polo', 'Maglieria Cashmere', 'Pantaloni Sartoriali', 'Calzature Artigianali'].map((link) => (
              <li key={link} className="hover:text-white cursor-pointer transition-colors">
                {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Service */}
        <div>
          <h3 className="text-xs font-normal uppercase tracking-[0.25em] mb-6 text-neutral-200">Servizi & Concierge</h3>
          <ul className="space-y-3 text-neutral-400 text-xs font-light tracking-wide">
            {['Guida alle Taglie', 'Su Misura & Sartoria', 'Spedizioni & Resi Gratuiti', 'Cura dei Capi', 'Termini del Servizio'].map((link) => (
              <li key={link} className="hover:text-white cursor-pointer transition-colors">
                {link}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-normal uppercase tracking-[0.25em] mb-6 text-neutral-200">Boutique Milano</h3>
          <ul className="space-y-4 text-neutral-400 text-xs font-light">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
              <span>{companySettings.legalAddress || "Via Monte Napoleone 18, 20121 Milano"}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
              <span>{companySettings.phone || "+39 02 8901234"}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
              <span>{companySettings.email || "concierge@vincentstore.it"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-neutral-500 text-[10px] font-light uppercase tracking-[0.2em]">
          © 2026 VINCENT STORE S.R.L. — TUTTI I DIRITTI RISERVATI
        </p>
        
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/5 text-neutral-400"
            title="Area Riservata Boutique"
          >
            <Shield className="w-4 h-4 stroke-[1.3]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
