'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppProvider';
import { 
  Instagram, 
  MapPin, 
  Phone, 
  Mail, 
  Shield,
  Navigation,
  Facebook,
  Youtube
} from 'lucide-react';
import { motion } from 'motion/react';
import { WhatsAppIcon } from '@/components/storefront/WhatsAppIcon';
import { TikTokIcon } from '@/components/storefront/TikTokIcon';

export function Footer() {
  const { companySettings, setIsAdminOpen } = useApp();

  const phone = (companySettings.phone && !companySettings.phone.includes('8901234')) 
    ? companySettings.phone 
    : "+39 331 342 4069";
  const landlinePhone = companySettings.landlinePhone || "081 3507556";
  const email = (companySettings.email && !companySettings.email.toLowerCase().includes('concierge'))
    ? companySettings.email 
    : "info@vincentabbigliamento.it";

  const address = (companySettings.legalAddress && !companySettings.legalAddress.includes('Monte Napoleone'))
    ? companySettings.legalAddress
    : "Corso San Giovanni a Teduccio, 293, 80146 Napoli NA";
  const mapsDestination = encodeURIComponent(address);
  const navigatorGoogleUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsDestination}`;
  const navigatorAppleUrl = `https://maps.apple.com/?daddr=${mapsDestination}`;
  const navigatorWazeUrl = `https://waze.com/ul?q=${mapsDestination}&navigate=yes`;

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-28 px-6 no-print font-['Montserrat',sans-serif] border-t border-neutral-900 relative overflow-hidden">
      {/* Watermark Logo Vincent monumentale in trasparenza e smarginatura oltre i margini (+50px a destra -> 300px) */}
      <div 
        aria-hidden="true"
        style={{ transform: 'translate(300px, -400px)' }}
        className="pointer-events-none select-none absolute -right-36 sm:-right-64 md:-right-96 lg:-right-[460px] -bottom-28 sm:-bottom-48 md:-bottom-72 lg:-bottom-[380px] w-[1425px] sm:w-[2100px] md:w-[2850px] lg:w-[3750px] aspect-square opacity-[0.06] md:opacity-[0.08] mix-blend-screen z-0"
      >
        <img
          src="/images/logo-vincent-watermark.png"
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/logo-vincent.jpg';
          }}
          className="w-full h-full object-contain filter contrast-125 pointer-events-none select-none"
        />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 relative z-10">
        {/* Brand Info */}
        <div className="space-y-6">
          <div>
            <span className="text-2xl font-light tracking-[0.3em] uppercase text-white block mb-1">
              VINCENT
            </span>
            <span className="text-[10px] font-light tracking-[0.35em] uppercase text-neutral-400">
              ATELIER & STORE NAPOLI
            </span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            {companySettings.mission || "Ricerchiamo costantemente le migliori soluzioni per proporre un trend accessibile a tutti ma di qualità: selezioniamo con cura tessuti, materiali, fatture e dettagli grazie all'esperienza di esperti del settore, proponendo oltre alle nostre sedi fisiche anche la vendita online attraverso i canali social e web ufficiali."}
          </p>
          <div className="flex gap-3">
            <motion.a
              whileHover={{ y: -3 }}
              href={companySettings.socials?.instagram || "https://www.instagram.com/vincent.store.7?obrf=MXV3aWN3dTVlbnhybQ%3D%3D&utm_source=qr"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              aria-label="Instagram"
              title="Instagram Ufficiale (@vincent.store.7)"
            >
              <Instagram className="w-4 h-4 stroke-[1.4]" />
            </motion.a>
            <motion.a
              whileHover={{ y: -3 }}
              href={companySettings.socials?.tiktok || "https://www.tiktok.com/@vincent_store7?_r=1&_t=ZN-9APNxQ7kCes"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
              aria-label="TikTok"
              title="TikTok Ufficiale (@vincent_store7)"
            >
              <TikTokIcon className="w-3.5 h-3.5 fill-current" />
            </motion.a>
            <motion.a
              whileHover={{ y: -3 }}
              href="https://wa.me/393313424069?text=Ciao%20Vincent%20Store,%20desidero%20maggiori%20informazioni"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
              aria-label="WhatsApp"
              title="Chat WhatsApp Diretta (+39 331 342 4069)"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
            </motion.a>
            {Boolean(companySettings.socials?.facebook && companySettings.socials.facebook.trim() !== '' && !companySettings.socials.facebook.includes('vincentstore')) && (
              <motion.a
                whileHover={{ y: -3 }}
                href={companySettings.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
                aria-label="Facebook"
                title="Facebook Ufficiale"
              >
                <Facebook className="w-4 h-4 stroke-[1.4]" />
              </motion.a>
            )}
            {Boolean(companySettings.socials?.youtube && companySettings.socials.youtube.trim() !== '' && !companySettings.socials.youtube.includes('vincentstore')) && (
              <motion.a
                whileHover={{ y: -3 }}
                href={companySettings.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
                aria-label="YouTube"
                title="YouTube Ufficiale"
              >
                <Youtube className="w-4 h-4 stroke-[1.4]" />
              </motion.a>
            )}
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
          <h3 className="text-xs font-normal uppercase tracking-[0.25em] mb-6 text-neutral-200">Servizi & Assistenza</h3>
          <ul className="space-y-3 text-neutral-400 text-xs font-light tracking-wide">
            {['Guida alle Taglie', 'Su Misura & Sartoria', 'Spedizioni & Resi Gratuiti', 'Cura dei Capi'].map((link) => (
              <li key={link} className="hover:text-white cursor-pointer transition-colors">
                {link}
              </li>
            ))}
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy & Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-normal uppercase tracking-[0.25em] mb-6 text-neutral-200">Sede & Atelier Napoli</h3>
          <ul className="space-y-4 text-neutral-400 text-xs font-light">
            <li className="space-y-2.5">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href={navigatorGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors block text-neutral-200 font-normal leading-relaxed group"
                    title="Calcola percorso e apri nel navigatore"
                  >
                    <span>{address}</span>
                  </a>
                  <span className="text-[10px] text-neutral-500 font-light block mt-0.5">Napoli (NA) · 80146</span>
                </div>
              </div>

              {/* Generazione automatica navigatore info smartphone */}
              <div className="pl-7 pt-1 space-y-1.5">
                <a
                  href={navigatorGoogleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white hover:text-black text-white text-[10px] font-medium tracking-wide uppercase transition-all shadow-sm group border border-white/10"
                  title="Avvia automaticamente la navigazione GPS dallo smartphone"
                >
                  <Navigation className="w-3 h-3 stroke-[2] group-hover:scale-110 transition-transform" />
                  <span>Avvia Navigatore GPS</span>
                </a>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="font-light">Smartphone:</span>
                  <a 
                    href={navigatorAppleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-400 hover:text-white underline transition-colors"
                    title="Apri in Apple Maps su iPhone"
                  >
                    Apple Maps
                  </a>
                  <span>·</span>
                  <a 
                    href={navigatorWazeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-400 hover:text-white underline transition-colors"
                    title="Apri in Waze"
                  >
                    Waze
                  </a>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-1.5">
                <a 
                  href={`tel:${landlinePhone.replace(/\s+/g, '')}`} 
                  className="hover:text-white transition-colors flex items-center gap-2 group"
                  title="Chiama telefono fisso sede (081 3507556)"
                >
                  <span className="text-white font-normal">{landlinePhone}</span>
                  <span className="text-[10px] text-neutral-400 font-light group-hover:text-neutral-200 transition-colors">
                    (Tel. Fisso)
                  </span>
                </a>
                <a 
                  href={`tel:${phone.replace(/\s+/g, '')}`} 
                  className="hover:text-white transition-colors flex items-center gap-2 group text-neutral-400"
                  title="Chiama cellulare / assistenza (+39 331 342 4069)"
                >
                  <span>{phone}</span>
                  <span className="text-[10px] text-neutral-500 font-light group-hover:text-neutral-300 transition-colors">
                    (Cellulare)
                  </span>
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 stroke-[1.4] text-neutral-300 mt-0.5 flex-shrink-0" />
              <a 
                href={`mailto:${email}`} 
                className="hover:text-white transition-colors"
                title="Invia email a info@vincentabbigliamento.it"
              >
                {email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center text-neutral-300">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
              </div>
              <a 
                href="https://wa.me/393313424069?text=Ciao%20Vincent%20Store,%20desidero%20maggiori%20informazioni"
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2 group"
                title="Apri chat WhatsApp diretta (+39 331 342 4069)"
              >
                <span>WhatsApp</span>
                <span className="text-[10px] text-neutral-500 font-light group-hover:text-neutral-300 transition-colors">
                  (Chat diretta)
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-neutral-900 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-neutral-400 text-[11px] font-light">
            <span>
              © 2026 Tutti i diritti riservati a <strong className="text-neutral-200 font-medium">Vincent Store</strong> · P.IVA: <span className="text-neutral-300 font-normal">{companySettings.vatNumber || "10426021217"}</span>
            </span>
            <span className="hidden sm:inline text-neutral-600">—</span>
            <span>
              Creato da{' '}
              <a
                href="https://codecafe.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-neutral-300 underline underline-offset-4 transition-colors font-medium"
              >
                codecafe.it
              </a>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] font-light text-neutral-400">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('vincent_open_cookie_preferences'));
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Preferenze Cookie
            </button>
          </div>
        </div>

        {/* Rigo Inferiore: Scudo Admin in basso al centro */}
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={() => setIsAdminOpen(true)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/5 text-neutral-500 hover:text-black hover:scale-105 active:scale-95 cursor-pointer shadow-xs group"
            title="Area Riservata Amministrazione"
            aria-label="Area Riservata Amministrazione"
          >
            <Shield className="w-3.5 h-3.5 stroke-[1.4] text-neutral-400 group-hover:text-black transition-colors" />
          </button>
        </div>
      </div>
    </footer>
  );
}
