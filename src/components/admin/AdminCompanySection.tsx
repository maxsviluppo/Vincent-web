'use client';

import React, { useState } from 'react';
import {
  Upload,
  Camera,
  X,
  Check,
  Building2,
  Phone,
  Mail,
  Globe,
  Share2,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { CompanySettings } from '@/lib/types';
import { pushStoreConfig } from '@/lib/store-client';
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from '@/components/admin/adminTouchTargets';

type AdminCompanySectionProps = {
  companySettings: CompanySettings;
  setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  handleFileChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => void;
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
};

export function AdminCompanySection({
  companySettings,
  setCompanySettings,
  handleFileChange,
  addToast,
}: AdminCompanySectionProps) {
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const processImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (url: string) => void
  ) => {
    if (handleFileChange) {
      handleFileChange(e, onComplete);
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.88);
          onComplete(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSave = async () => {
    setIsSavedRecently(true);
    try {
      await pushStoreConfig({ company_settings: companySettings });
      addToast?.('Dati aziendali salvati e sincronizzati in tutto lo store!', 'success');
    } catch {
      addToast?.('Dati aziendali salvati localmente.', 'info');
    }
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  return (
    <div className="admin-company-panel max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header armonizzato come la sezione Categorie */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Azienda
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            Identità brand · recapiti e dati fiscali store
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleManualSave}
            className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto rounded-full`}
          >
            {isSavedRecently ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Salvato</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salva Modifiche</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Blocco 1: Brand & Logo */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              Brand & Identità Visiva
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Grafica Store</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                Logo Aziendale (Orizzontale)
              </label>
              <div className="flex gap-3 items-start">
                <label className="flex-1 cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 rounded-xl p-5 bg-neutral-50/70 group-hover:bg-neutral-100/70 group-hover:border-neutral-900 transition-colors">
                    <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 mb-1 transition-colors" />
                    <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wide">
                      Carica Logo
                    </span>
                    <span className="text-[9px] text-neutral-400 font-light mt-0.5">PNG, SVG o JPG</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        processImageUpload(e, (url) =>
                          setCompanySettings((prev) => ({ ...prev, imageLogo: url }))
                        )
                      }
                    />
                  </div>
                </label>
                {companySettings.imageLogo && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-neutral-200 rounded-xl p-2 flex items-center justify-center relative shrink-0 shadow-sm">
                    <img
                      src={companySettings.imageLogo}
                      alt="Logo aziendale"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCompanySettings((prev) => ({ ...prev, imageLogo: '' }))
                      }
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      title="Rimuovi logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 font-light italic leading-snug">
                * Se caricato, il logo immagine sostituisce il nome testuale nell'intestazione dello store.
              </p>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                Favicon (Quadrata 100x100)
              </label>
              <div className="flex gap-3 items-start">
                <label className="flex-1 cursor-pointer group">
                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 rounded-xl p-5 bg-neutral-50/70 group-hover:bg-neutral-100/70 group-hover:border-neutral-900 transition-colors">
                    <Camera className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 mb-1 transition-colors" />
                    <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wide">
                      Carica Favicon
                    </span>
                    <span className="text-[9px] text-neutral-400 font-light mt-0.5">Icona browser</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        processImageUpload(e, (url) =>
                          setCompanySettings((prev) => ({ ...prev, favicon: url }))
                        )
                      }
                    />
                  </div>
                </label>
                {companySettings.favicon && (
                  <div className="w-16 h-16 bg-white border border-neutral-200 rounded-xl p-2 flex items-center justify-center relative shrink-0 shadow-sm self-center">
                    <img
                      src={companySettings.favicon}
                      alt="Favicon"
                      className="w-full h-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCompanySettings((prev) => ({ ...prev, favicon: '' }))
                      }
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      title="Rimuovi favicon"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Nome Brand (Testo)
              </label>
              <input
                type="text"
                disabled={!!companySettings.imageLogo}
                value={companySettings.name}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="es. BesPoint"
                className={`${ADMIN_INPUT} ${companySettings.imageLogo ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}`}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Logo Alternativo (Solo Testo)
              </label>
              <input
                type="text"
                disabled={!!companySettings.imageLogo}
                value={companySettings.logo}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, logo: e.target.value }))
                }
                placeholder="es. BESPOINT"
                className={`${ADMIN_INPUT} ${companySettings.imageLogo ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Blocco 2: Dati Societari & Fiscali */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-neutral-400" />
              Dati Societari & Fiscali
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Fatturazione</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Ragione Sociale Completa
              </label>
              <input
                type="text"
                value={companySettings.legalName}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, legalName: e.target.value }))
                }
                placeholder="es. Vincent Store S.r.l."
                className={ADMIN_INPUT}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={companySettings.vatNumber || ''}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({ ...prev, vatNumber: e.target.value }))
                  }
                  placeholder="es. 10426021217"
                  className={ADMIN_INPUT}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Codice Univoco (SDI)
                </label>
                <input
                  type="text"
                  value={companySettings.sdiCode || ''}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      sdiCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="es. M5UXCR1"
                  className={`${ADMIN_INPUT} uppercase font-mono`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blocco 3: Contatti & Sede */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              Sede & Recapiti di Contatto
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Supporto Clienti</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                  Sede Legale / Operativa & Atelier
                </label>
                {companySettings.legalAddress && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companySettings.legalAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-neutral-700 hover:text-black font-medium underline flex items-center gap-1"
                    title="Verifica generazione percorso navigatore smartphone"
                  >
                    <span>Test Navigatore GPS</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={companySettings.legalAddress}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, legalAddress: e.target.value }))
                }
                placeholder="es. Corso San Giovanni a Teduccio, 293, 80146 Napoli NA"
                className={ADMIN_INPUT}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Telefono Fisso Sede
                </label>
                <input
                  type="text"
                  value={companySettings.landlinePhone || ''}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({ ...prev, landlinePhone: e.target.value }))
                  }
                  placeholder="es. 081 3507556"
                  className={ADMIN_INPUT}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Cellulare / Assistenza
                </label>
                <input
                  type="text"
                  value={companySettings.phone}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="es. +39 331 342 4069"
                  className={ADMIN_INPUT}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Email Pubblica Clienti
                </label>
                <input
                  type="email"
                  value={companySettings.email}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="es. info@vincentabbigliamento.it"
                  className={ADMIN_INPUT}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Email Mittente Notifiche Ordine & Tracking
              </label>
              <input
                type="email"
                value={companySettings.orderStatusSenderEmail || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    orderStatusSenderEmail: e.target.value,
                  }))
                }
                placeholder="es. info@vincentabbigliamento.it"
                className={ADMIN_INPUT}
              />
              <p className="text-[10px] text-neutral-400 font-light mt-1">
                Indirizzo visualizzato dai clienti nelle email automatiche di conferma e spedizione.
              </p>
            </div>
          </div>
        </div>

        {/* Blocco 4: Mission & Bio */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-400" />
              Mission & Profilo Store
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Storytelling</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Mission Aziendale (Chi siamo)
              </label>
              <textarea
                rows={3}
                value={companySettings.mission}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, mission: e.target.value }))
                }
                placeholder="Descrivi brevemente la storia e i punti di forza del tuo negozio..."
                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 resize-y"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Link Bio / Pagina Linktree
              </label>
              <input
                type="text"
                value={companySettings.bioLink}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, bioLink: e.target.value }))
                }
                placeholder="es. https://linktr.ee/bespoint"
                className={ADMIN_INPUT}
              />
            </div>
          </div>
        </div>

        {/* Blocco 5: Social Media */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-neutral-400" />
              Canali Social Media
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Canali Ufficiali</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Instagram URL
              </label>
              <input
                type="text"
                value={companySettings.socials?.instagram || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, instagram: e.target.value },
                  }))
                }
                placeholder="https://www.instagram.com/vincent.store.7?obrf=MXV3aWN3dTVlbnhybQ%3D%3D&utm_source=qr"
                className={ADMIN_INPUT}
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                Facebook URL
              </label>
              <input
                type="text"
                value={companySettings.socials?.facebook || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, facebook: e.target.value },
                  }))
                }
                placeholder="https://facebook.com/tuapagina"
                className={ADMIN_INPUT}
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                TikTok URL
              </label>
              <input
                type="text"
                value={companySettings.socials?.tiktok || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, tiktok: e.target.value },
                  }))
                }
                placeholder="https://www.tiktok.com/@vincent_store7?_r=1&_t=ZN-9APNxQ7kCes"
                className={ADMIN_INPUT}
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                YouTube URL
              </label>
              <input
                type="text"
                value={companySettings.socials?.youtube || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, youtube: e.target.value },
                  }))
                }
                placeholder="https://youtube.com/@tuocanale"
                className={ADMIN_INPUT}
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                X / Twitter URL
              </label>
              <input
                type="text"
                value={companySettings.socials?.twitter || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, twitter: e.target.value },
                  }))
                }
                placeholder="https://x.com/tuoaccount"
                className={ADMIN_INPUT}
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                WhatsApp Link / Chat Diretta
              </label>
              <input
                type="text"
                value={companySettings.socials?.whatsapp || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({
                    ...prev,
                    socials: { ...prev.socials, whatsapp: e.target.value },
                  }))
                }
                placeholder="https://wa.me/393313424069"
                className={ADMIN_INPUT}
              />
            </div>
          </div>
        </div>

        {/* Pulsante finale di salvataggio */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleManualSave}
            className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto px-8 rounded-full`}
          >
            <Check className="w-4 h-4" />
            <span>Salva e Applica Modifiche</span>
          </button>
        </div>
      </div>
    </div>
  );
}
