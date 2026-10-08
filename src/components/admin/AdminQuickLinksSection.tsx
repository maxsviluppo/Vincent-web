'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Upload, X, Check } from 'lucide-react';
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from '@/components/admin/adminTouchTargets';

type QuickLinkItem = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  category: string;
  subcategory: string;
  imageUrl?: string;
  seed?: string;
};

type AdminQuickLinksSectionProps = {
  pageSettings: any;
  setPageSettings: React.Dispatch<React.SetStateAction<any>>;
  handleFileChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => void;
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  setAdminConfirmAction?: (action: any) => void;
};

const COLOR_PRESETS = [
  { label: 'Nero Carbone', value: 'bg-neutral-900', hex: '#171717' },
  { label: 'Blu Notte', value: 'bg-slate-900', hex: '#0f172a' },
  { label: 'Grigio Fumo', value: 'bg-neutral-700', hex: '#404040' },
  { label: 'Blu Cobalto', value: 'bg-blue-900', hex: '#1e3a8a' },
  { label: 'Verde Bosco', value: 'bg-emerald-900', hex: '#064e3b' },
  { label: 'Bordeaux', value: 'bg-rose-950', hex: '#4c0519' },
  { label: 'Viola Notte', value: 'bg-indigo-950', hex: '#1e1b4b' },
  { label: 'Testa di Moro', value: 'bg-amber-950', hex: '#451a03' },
];

export function AdminQuickLinksSection({
  pageSettings,
  setPageSettings,
  handleFileChange,
  addToast,
  setAdminConfirmAction,
}: AdminQuickLinksSectionProps) {
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const links: QuickLinkItem[] = pageSettings.linkRapidi || [];
  const categories: string[] = pageSettings.categories || ['Tutti'];

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

  const handleAddNewBox = () => {
    const newId = Date.now().toString();
    const newBox: QuickLinkItem = {
      id: newId,
      title: 'Nuovo Link',
      subtitle: 'Sottotitolo',
      color: 'bg-neutral-900',
      category: categories.find((c) => c !== 'Tutti') || 'Tutti',
      subcategory: 'Tutti',
      imageUrl: '',
      seed: `link-${newId}`,
    };

    setPageSettings((prev: any) => ({
      ...prev,
      linkRapidi: [...(prev.linkRapidi || []), newBox],
    }));

    addToast?.('Nuovo box aggiunto alla configurazione.', 'info');
  };

  const handleDeleteBox = (id: string, title: string) => {
    const removeAction = () => {
      setPageSettings((prev: any) => ({
        ...prev,
        linkRapidi: (prev.linkRapidi || []).filter((l: any) => l.id !== id),
      }));
      addToast?.(`Box "${title}" rimosso.`, 'info');
    };

    if (setAdminConfirmAction) {
      setAdminConfirmAction({
        active: true,
        title: 'Elimina Box',
        message: `Sei sicuro di voler rimuovere il box "${title || 'Senza titolo'}"?`,
        color: 'bg-neutral-950',
        onConfirm: removeAction,
      });
    } else {
      removeAction();
    }
  };

  const handleUpdateBox = (index: number, updates: Partial<QuickLinkItem>) => {
    setPageSettings((prev: any) => {
      const updated = [...(prev.linkRapidi || [])];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, linkRapidi: updated };
    });
  };

  const handleSaveNotification = () => {
    setIsSavedRecently(true);
    addToast?.('Configurazione link rapidi salvata con successo.', 'success');
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const isEnabled = Boolean(pageSettings.isQuickLinksEnabled);

  return (
    <div className="admin-quicklinks-panel max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header coerente con la sezione Categorie */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Link Rapidi
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {links.length} promo box configurati · vetrina scorciatoie homepage
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAddNewBox}
            className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto rounded-full`}
          >
            <Plus className="w-4 h-4" />
            Nuovo Box
          </button>
          <button
            type="button"
            onClick={handleSaveNotification}
            className={`${ADMIN_BTN_SECONDARY} w-full sm:w-auto rounded-full`}
          >
            {isSavedRecently ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Salvato</span>
              </>
            ) : (
              <span>Salva Modifiche</span>
            )}
          </button>
        </div>
      </div>

      {/* Scheda Visibilità Sezione */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950">
              Visibilità Homepage
            </h3>
            <p className="text-[11px] text-neutral-400 font-light mt-1">
              Mostra o nascondi il blocco promozionale con i link rapidi nella homepage dello store.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setPageSettings((prev: any) => ({
                ...prev,
                isQuickLinksEnabled: !prev.isQuickLinksEnabled,
              }))
            }
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled ? 'bg-neutral-950' : 'bg-neutral-200'
            }`}
            role="switch"
            aria-checked={isEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Stato attuale sezione:</span>
          <span
            className={`font-light uppercase tracking-wider text-[10px] ${
              isEnabled ? 'text-neutral-950' : 'text-neutral-400'
            }`}
          >
            {isEnabled ? 'Attivata e visibile' : 'Nascosta dallo store'}
          </span>
        </div>
      </div>

      {/* Titolo elenco box */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950">
          Personalizzazione Box
        </h3>
        <span className="text-[10px] text-neutral-400 font-light">
          {links.length} elementi attivi
        </span>
      </div>

      {/* Lista / Griglia Box */}
      {links.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-12 text-center space-y-4">
          <p className="text-sm font-light text-neutral-400">
            Nessun link rapido configurato al momento.
          </p>
          <button
            type="button"
            onClick={handleAddNewBox}
            className={`${ADMIN_BTN_PRIMARY} rounded-full`}
          >
            <Plus className="w-4 h-4" />
            Crea il primo box
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((item, idx) => {
            const availableSubs = pageSettings.subcategories?.[item.category] || [];

            return (
              <div
                key={item.id}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 hover:border-neutral-300 transition-colors"
              >
                {/* Header card box */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      #{idx + 1}
                    </span>
                    <h4 className="text-xs font-light uppercase tracking-[0.2em] text-neutral-950 truncate max-w-[180px]">
                      {item.title || 'Senza titolo'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBox(item.id, item.title)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                    title="Elimina box"
                    aria-label={`Elimina box ${item.title || idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Campi testo */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                      Titolo Principale
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleUpdateBox(idx, { title: e.target.value })}
                      placeholder="Es: Nuova Collezione"
                      className={ADMIN_INPUT}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                      Sottotitolo
                    </label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => handleUpdateBox(idx, { subtitle: e.target.value })}
                      placeholder="Es: Scopri le ultime novità"
                      className={ADMIN_INPUT}
                    />
                  </div>

                  {/* Selettori categoria & sottocategoria */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                        Categoria Filtro
                      </label>
                      <select
                        value={item.category || 'Tutti'}
                        onChange={(e) =>
                          handleUpdateBox(idx, {
                            category: e.target.value,
                            subcategory: 'Tutti',
                          })
                        }
                        className={`${ADMIN_INPUT} cursor-pointer bg-white`}
                      >
                        {categories.map((c: string) => (
                          <option key={c} value={c} className="text-neutral-900 bg-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                        Sottocategoria
                      </label>
                      <select
                        value={item.subcategory || 'Tutti'}
                        onChange={(e) => handleUpdateBox(idx, { subcategory: e.target.value })}
                        className={`${ADMIN_INPUT} cursor-pointer bg-white`}
                      >
                        <option value="Tutti">Tutti</option>
                        {availableSubs.map((s: string) => (
                          <option key={s} value={s} className="text-neutral-900 bg-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Palette Colore Sfondo (pulita e minimale) */}
                  <div className="pt-2">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-2 block">
                      Colore Sfondo Box
                    </label>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {COLOR_PRESETS.map((color) => {
                        const isSelected = item.color === color.value;
                        return (
                          <button
                            key={color.value}
                            type="button"
                            title={color.label}
                            onClick={() => handleUpdateBox(idx, { color: color.value })}
                            style={{ backgroundColor: color.hex }}
                            className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                              isSelected
                                ? 'scale-110 ring-2 ring-neutral-950 ring-offset-2'
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Gestione Immagine di Sfondo (opzionale) */}
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1 block">
                        Immagine di Sfondo (Opzionale)
                      </label>
                      <p className="text-[10px] text-neutral-400 mb-2">
                        Se impostata, sostituisce il colore solido come sfondo del box.
                      </p>
                      <input
                        type="text"
                        value={item.imageUrl || ''}
                        onChange={(e) => handleUpdateBox(idx, { imageUrl: e.target.value })}
                        placeholder="https://... oppure carica file"
                        className={ADMIN_INPUT}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl py-2 px-3 cursor-pointer transition-colors text-[10px] font-light text-neutral-600 uppercase tracking-wider">
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Carica immagine</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            processImageUpload(e, (url) => {
                              handleUpdateBox(idx, { imageUrl: url });
                            });
                          }}
                        />
                      </label>
                      {item.imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBox(idx, { imageUrl: '' })}
                          className="px-3 py-2 text-neutral-400 hover:text-red-600 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Rimuovi
                        </button>
                      )}
                    </div>

                    {item.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-200 h-24 bg-neutral-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title || 'Anteprima'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateBox(idx, { imageUrl: '' })}
                          className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-neutral-950 text-white p-1 rounded-full shadow transition-colors"
                          title="Elimina immagine"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
