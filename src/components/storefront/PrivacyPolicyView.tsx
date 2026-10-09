'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Server, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Lock, 
  FileCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useApp } from '@/context/AppProvider';

export function PrivacyPolicyView() {
  const { companySettings } = useApp();

  const legalEmail = companySettings.email || 'info@vincentabbigliamento.it';
  const legalPhone = companySettings.phone || '+39 331 342 4069';
  const legalLandline = companySettings.landlinePhone || '081 3507556';
  const legalVat = companySettings.vatNumber || '10426021217';
  const legalAddress = (companySettings.legalAddress && !companySettings.legalAddress.includes('Monte Napoleone'))
    ? companySettings.legalAddress 
    : 'Corso San Giovanni a Teduccio, 293, 80146 Napoli NA';
  const legalName = companySettings.legalName || 'Vincent Store S.r.l.';

  return (
    <div className="bg-[#fafafa] min-h-screen py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-['Montserrat',sans-serif] text-neutral-900">
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
        {/* Top Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-light tracking-[0.15em] uppercase text-neutral-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Torna allo Store</span>
          </Link>
          <span className="text-[11px] text-neutral-400 font-light tracking-widest uppercase">
            Aggiornato: Anno 2026
          </span>
        </div>

        {/* Hero Title Section */}
        <div className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white text-[10px] font-normal tracking-[0.25em] uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Informativa Privacy & Trattamento Dati
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-[0.18em] uppercase text-neutral-950">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-2xl mx-auto leading-relaxed">
            Informativa resa ai sensi del Regolamento Europeo 2016/679 (GDPR) e della normativa italiana vigente sulla protezione dei dati personali.
          </p>
        </div>

        {/* 3 Core Guarantee Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Server className="w-5 h-5 stroke-[1.4]" />
            </div>
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-950">
              Server Protetti & Gestiti
            </h2>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              I dati sono conservati su server protetti gestiti da Vincent Store con crittografia end-to-end e backup continui.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <FileCheck className="w-5 h-5 stroke-[1.4]" />
            </div>
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-950">
              Fine Esclusivo di Vendita
            </h2>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Raccolta e utilizzo esclusivamente finalizzati alla fruizione del servizio e alla vendita e consegna dei prodotti.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
              <Clock className="w-5 h-5 stroke-[1.4]" />
            </div>
            <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-950">
              Tempi Standard GDPR
            </h2>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
              Conservazione limitata alla durata dell'account utente e 10 anni per obblighi fiscali e civilistici di legge.
            </p>
          </div>
        </div>

        {/* Detailed Sections Container */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-xs sm:text-[13px] font-light leading-relaxed text-neutral-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              Titolare del Trattamento dei Dati
            </h2>
            <p>
              Il Titolare del trattamento dei dati personali raccolti attraverso questo sito web è:
            </p>
            <div className="bg-neutral-50 border border-neutral-200/70 rounded-xl p-4 space-y-2 text-neutral-800">
              <p className="font-medium text-neutral-950 uppercase tracking-wider">
                {legalName} <span className="text-neutral-500 font-normal text-xs lowercase">· p.iva: <strong className="text-neutral-800 font-medium uppercase">{legalVat}</strong></span>
              </p>
              <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(legalAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 font-normal hover:underline flex items-center gap-1.5 flex-wrap"
                  title="Calcola percorso / Apri nel navigatore smartphone"
                >
                  <span>{legalAddress}</span>
                  <span className="text-[10px] text-neutral-400 font-light hover:text-neutral-700">(Avvia Navigatore GPS)</span>
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <a href={`mailto:${legalEmail}`} className="text-neutral-900 font-normal hover:underline">
                  {legalEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-600 flex-wrap">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <a 
                  href={`tel:${legalLandline.replace(/\s+/g, '')}`} 
                  className="text-neutral-900 font-normal hover:underline"
                  title="Chiamata telefono fisso"
                >
                  {legalLandline} <span className="text-neutral-400 font-light">(Fisso Sede)</span>
                </a>
                <span className="text-neutral-300">·</span>
                <a 
                  href={`tel:${legalPhone.replace(/\s+/g, '')}`} 
                  className="text-neutral-900 font-normal hover:underline"
                  title="Chiamata cellulare / assistenza"
                >
                  {legalPhone} <span className="text-neutral-400 font-light">(Cellulare)</span>
                </a>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Finalità Esclusiva del Trattamento dei Dati
            </h2>
            <p>
              I dati personali dell'utente (quali nome, cognome, indirizzo email, recapito telefonico, indirizzo di spedizione e di fatturazione, nonché cronologia ordini) sono raccolti e conservati sul server gestiti da <strong>Vincent Store</strong> per le seguenti finalità esclusive:
            </p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Esecuzione del Contratto e Vendita Prodotti:</strong> gestione e completamento degli ordini d'acquisto online, elaborazione pagamenti sicuri, imballaggio e spedizione tramite corrieri convenzionati.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Fruizione del Servizio e Account:</strong> registrazione dell'account cliente, accesso all'area riservata, gestione preferiti, tracciamento stato ordini e richieste di reso/cambio merce.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Assistenza Clienti:</strong> supporto dedicato pre e post vendita via telefono, email o canali diretti.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Obblighi di Legge:</strong> adempimento dei doveri fiscali, contabili e tributari imposti dalle normative italiane ed europee.</span>
              </li>
            </ul>
            <p className="text-xs text-neutral-500 italic mt-2">
              I tuoi dati non saranno mai venduti, ceduti né trasferiti a terze parti per scopi pubblicitari o promozionali esterni.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Modalità di Conservazione e Sicurezza
            </h2>
            <p>
              I dati personali vengono trattati con strumenti automatizzati e conservati su server protetti gestiti da Vincent Store con adeguate misure di sicurezza tecniche e organizzative ai sensi dell'art. 32 del GDPR. Tali misure comprendono:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-3">
                <Lock className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-900 text-xs">Crittografia SSL/TLS</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Tutte le comunicazioni tra browser e server avvengono con canali cifrati.</p>
                </div>
              </div>
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-3">
                <Server className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-900 text-xs">Accesso Riservato</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Solo il personale tecnico incaricato e autorizzato ha accesso ai database protetti.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
              Tempi Standard di Conservazione dei Dati
            </h2>
            <p>
              I dati vengono conservati per il tempo strettamente necessario a conseguire gli scopi per cui sono stati raccolti, secondo i seguenti tempi standard:
            </p>
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                <span className="font-medium text-neutral-900">Dati Account Utente & Profilo</span>
                <span className="text-[11px] text-neutral-500 font-normal">Fino alla richiesta di cancellazione dell'account da parte dell'utente</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                <span className="font-medium text-neutral-900">Dati Ordini, Fatturazione & Contabilità</span>
                <span className="text-[11px] text-neutral-500 font-normal">10 anni (ai sensi dell'art. 2220 c.c. e normativa fiscale)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                <span className="font-medium text-neutral-900">Richieste di Assistenza & Resi</span>
                <span className="text-[11px] text-neutral-500 font-normal">Per la durata del servizio e per il periodo di garanzia legale</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                <span className="font-medium text-neutral-900">Cookie Tecnici & di Sessione</span>
                <span className="text-[11px] text-neutral-500 font-normal">Sessione di navigazione o massimo 12 mesi per preferenze salvate</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">5</span>
              Diritti dell'Interessato (Artt. 15-22 GDPR)
            </h2>
            <p>
              In qualità di interessato, l'utente può in qualsiasi momento esercitare i propri diritti riconosciuti dal Regolamento UE 2016/679:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <strong>Accesso:</strong> ottenere conferma dell'esistenza dei propri dati.
              </li>
              <li className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <strong>Rettifica:</strong> aggiornare o correggere dati inesatti.
              </li>
              <li className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <strong>Cancellazione (Oblio):</strong> richiedere l'eliminazione definitiva.
              </li>
              <li className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                <strong>Portabilità:</strong> ricevere i propri dati in formato strutturato.
              </li>
            </ul>
            <p className="pt-2">
              Per esercitare uno qualsiasi dei diritti sopra descritti, è possibile inviare una richiesta scritta a:
            </p>
            <p className="font-medium text-neutral-900">
              Email: <a href={`mailto:${legalEmail}`} className="underline hover:text-neutral-600">{legalEmail}</a> · Tel: <a href={`tel:${legalPhone.replace(/\s+/g, '')}`} className="underline hover:text-neutral-600">{legalPhone} (Chiamata diretta)</a>
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-normal uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">6</span>
              Informativa Cookie
            </h2>
            <p>
              Questo sito fa uso esclusivo di <strong>cookie tecnici</strong> necessari per il corretto funzionamento delle funzioni e-commerce (mantenimento del carrello, autenticazione sicura dell'utente, preferenze di navigazione).
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('vincent_open_cookie_preferences'));
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-normal uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Gestisci Preferenze Cookie</span>
              </button>
            </div>
          </section>

        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-black text-white text-xs font-medium tracking-[0.2em] uppercase shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna allo Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
