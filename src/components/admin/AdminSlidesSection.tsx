'use client';

import React, { useState, useMemo } from 'react';
import {
  Upload,
  Camera,
  X,
  Plus,
  Eye,
  EyeOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Layers,
  Sparkles,
  Compass,
  Trash2,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from '@/components/admin/adminTouchTargets';
import { AdminSlidePickerList } from '@/components/admin/AdminSlidePickerList';

type AdminSlidesSectionProps = {
  pageSettings: any;
  setPageSettings: React.Dispatch<React.SetStateAction<any>>;
  handleFileChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => void;
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  setAdminConfirmAction?: (action: any) => void;
};

export function AdminSlidesSection({
  pageSettings,
  setPageSettings,
  handleFileChange,
  addToast,
  setAdminConfirmAction,
}: AdminSlidesSectionProps) {
  const [adminTopIdx, setAdminTopIdx] = useState(0);
  const [adminMidIdx, setAdminMidIdx] = useState(0);
  const [adminBotIdx, setAdminBotIdx] = useState(0);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const adminTopSlides = useMemo(
    () =>
      (pageSettings.homeSlides || []).filter(
        (s: any) => s.position === 'home_top' || !s.position
      ),
    [pageSettings.homeSlides]
  );

  const adminMidSlides = useMemo(
    () =>
      (pageSettings.homeSlides || []).filter(
        (s: any) => s.position === 'home_middle'
      ),
    [pageSettings.homeSlides]
  );

  const adminBotSlides = useMemo(
    () =>
      (pageSettings.homeSlides || []).filter(
        (s: any) => s.position === 'home_bottom'
      ),
    [pageSettings.homeSlides]
  );

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

  const handleManualSave = () => {
    setIsSavedRecently(true);
    addToast?.('Configurazione slide salvata correttamente.', 'success');
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const handleGenerateByCategory = () => {
    const newSlides: any[] = [];
    const categories = (pageSettings.categories || []).filter(
      (c: string) => c !== 'Tutti'
    );

    if (categories.length > 0) {
      const cat = categories[0];
      newSlides.push({
        id: `top-${cat}-${Date.now()}`,
        url: `https://picsum.photos/seed/${cat.toLowerCase()}-top/1920/1080`,
        alt: `Scopri ${cat}`,
        title: cat,
        link: '',
        position: 'home_top',
      });
    }

    categories.forEach((cat: string) => {
      newSlides.push({
        id: `mid-${cat}-${Date.now()}`,
        url: `https://picsum.photos/seed/${cat.toLowerCase()}-mid/1920/600`,
        alt: `Offerte ${cat}`,
        title: `Specialisti in ${cat}`,
        link: '',
        position: 'home_middle',
      });
      newSlides.push({
        id: `bot-${cat}-${Date.now()}`,
        url: `https://picsum.photos/seed/${cat.toLowerCase()}-bot/1920/600`,
        alt: `Qualità ${cat}`,
        title: `Il meglio di ${cat}`,
        link: '',
        position: 'home_bottom',
      });
    });

    setPageSettings({ ...pageSettings, homeSlides: newSlides });
    setAdminTopIdx(0);
    setAdminMidIdx(0);
    setAdminBotIdx(0);
    addToast?.('Slide generate automaticamente per le categorie!', 'success');
  };

  const addSlide = (position: 'home_top' | 'home_middle' | 'home_bottom') => {
    const newId = Date.now().toString();
    const newSlide = {
      id: newId,
      url: '',
      alt: '',
      title: '',
      link: '',
      position,
    };
    setPageSettings({
      ...pageSettings,
      homeSlides: [...(pageSettings.homeSlides || []), newSlide],
    });
    if (position === 'home_top') setAdminTopIdx(adminTopSlides.length);
    if (position === 'home_middle') setAdminMidIdx(adminMidSlides.length);
    if (position === 'home_bottom') setAdminBotIdx(adminBotSlides.length);
    addToast?.('Nuova slide aggiunta.', 'info');
  };

  const deleteSlide = (id: string, position: string) => {
    const performDelete = () => {
      const updated = (pageSettings.homeSlides || []).filter(
        (s: any) => s.id !== id
      );
      setPageSettings({ ...pageSettings, homeSlides: updated });
      if (position === 'home_top') setAdminTopIdx(0);
      if (position === 'home_middle') setAdminMidIdx(0);
      if (position === 'home_bottom') setAdminBotIdx(0);
      addToast?.('Slide eliminata.', 'info');
    };

    if (setAdminConfirmAction) {
      setAdminConfirmAction({
        active: true,
        title: 'Elimina Slide',
        message: 'Sei sicuro di voler eliminare questa slide?',
        color: 'bg-red-500',
        onConfirm: performDelete,
      });
    } else {
      performDelete();
    }
  };

  return (
    <div className="admin-slides-panel max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header armonizzato come Categorie */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Slide & Banner
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            Hero slider · banner promozionali e top bar dello store
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleGenerateByCategory}
            className={`${ADMIN_BTN_SECONDARY} w-full sm:w-auto rounded-full`}
            title="Genera set predefinito di slide"
          >
            <Sparkles className="w-4 h-4 text-neutral-500" />
            <span>Genera da Categorie</span>
          </button>
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
        {/* Blocco 1: Configurazione Top Bar */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-neutral-400" />
              Top Bar Notifiche (1920×40px)
            </h3>
            {/* Modalità switcher compatto */}
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/60 self-start sm:self-auto">
              {(['static', 'marquee', 'image'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setPageSettings((prev: any) => ({ ...prev, topBarMode: mode }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                    (pageSettings.topBarMode ?? 'static') === mode
                      ? 'bg-neutral-950 text-white font-medium shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {mode === 'static'
                    ? 'Fisso'
                    : mode === 'marquee'
                    ? 'Scorrimento'
                    : 'Immagine'}
                </button>
              ))}
            </div>
          </div>

          {(pageSettings.topBarMode ?? 'static') === 'static' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Testo Sinistra
                </label>
                <input
                  type="text"
                  value={pageSettings.topBarLeftText || ''}
                  onChange={(e) =>
                    setPageSettings((prev: any) => ({
                      ...prev,
                      topBarLeftText: e.target.value,
                    }))
                  }
                  placeholder="Es: Spedizione gratuita sopra €50"
                  className={ADMIN_INPUT}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Testo Destra
                </label>
                <input
                  type="text"
                  value={pageSettings.topBarRightText || ''}
                  onChange={(e) =>
                    setPageSettings((prev: any) => ({
                      ...prev,
                      topBarRightText: e.target.value,
                    }))
                  }
                  placeholder="Es: Assistenza clienti WhatsApp"
                  className={ADMIN_INPUT}
                />
              </div>
            </div>
          )}

          {(pageSettings.topBarMode ?? 'static') === 'marquee' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                  Testo a Scorrimento Continuo
                </label>
                <textarea
                  rows={2}
                  value={pageSettings.topBarMarqueeText || ''}
                  onChange={(e) =>
                    setPageSettings((prev: any) => ({
                      ...prev,
                      topBarMarqueeText: e.target.value,
                    }))
                  }
                  placeholder="Es: Saldi di fine stagione fino al -50% su tutti gli articoli selezionati!"
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 resize-y"
                />
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-neutral-500">
                  <span>Velocità di Scorrimento</span>
                  <span className="text-neutral-900 font-bold">
                    {Math.round(100 / ((pageSettings.topBarMarqueeSpeed || 30) / 10))}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400">Lento</span>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={70 - (pageSettings.topBarMarqueeSpeed || 30)}
                    onChange={(e) =>
                      setPageSettings((prev: any) => ({
                        ...prev,
                        topBarMarqueeSpeed: 70 - parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 accent-neutral-950"
                  />
                  <span className="text-[10px] text-neutral-400">Veloce</span>
                </div>
              </div>
            </div>
          )}

          {(pageSettings.topBarMode ?? 'static') === 'image' && (
            <div className="space-y-3">
              <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                Grafica Top Bar (Dimensioni consigliate: 1920×40px)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={pageSettings.topBarImage || ''}
                  onChange={(e) =>
                    setPageSettings((prev: any) => ({
                      ...prev,
                      topBarImage: e.target.value,
                    }))
                  }
                  placeholder="https://... o carica dal computer"
                  className={`${ADMIN_INPUT} flex-1`}
                />
                <label className={`${ADMIN_BTN_PRIMARY} cursor-pointer rounded-xl shrink-0`}>
                  <Upload className="w-4 h-4" />
                  <span>Carica Immagine</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      processImageUpload(e, (url) =>
                        setPageSettings((prev: any) => ({
                          ...prev,
                          topBarImage: url,
                        }))
                      )
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {/* Anteprima Live Top Bar */}
          <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-950 shadow-inner">
            <div className="px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between text-[9px] font-medium uppercase tracking-widest text-neutral-400">
              <span>Anteprima Live (40px)</span>
              <span className="text-neutral-500 font-mono">1920×40</span>
            </div>
            <div className="h-10 bg-neutral-950 text-white flex items-center px-4 overflow-hidden text-[11px] tracking-wider">
              {(pageSettings.topBarMode ?? 'static') === 'image' &&
              pageSettings.topBarImage ? (
                <img
                  src={pageSettings.topBarImage}
                  alt="Top bar banner"
                  className="w-full h-full object-cover object-center"
                />
              ) : (pageSettings.topBarMode ?? 'static') === 'marquee' ? (
                <div className="truncate text-center w-full font-light">
                  {pageSettings.topBarMarqueeText || 'Testo a scorrimento...'}
                </div>
              ) : (
                <div className="w-full flex items-center justify-between font-light">
                  <span className="truncate opacity-90">
                    {pageSettings.topBarLeftText || 'Testo sinistra'}
                  </span>
                  <span className="truncate opacity-90 text-right">
                    {pageSettings.topBarRightText || 'Testo destra'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Impostazione Globale: Overlay Scura Slide */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-900">
              Filtro Scuro su Slide (Overlay)
            </h4>
            <p className="text-[11px] text-neutral-400 font-light mt-0.5">
              Applica una leggera sfumatura scura per massimizzare la leggibilità dei testi in sovraimpressione
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setPageSettings((prev: any) => ({
                ...prev,
                slidesOverlayEnabled: !prev.slidesOverlayEnabled,
              }))
            }
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              pageSettings.slidesOverlayEnabled ? 'bg-neutral-950' : 'bg-neutral-200'
            }`}
            aria-label="Attiva/disattiva overlay scuro"
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                pageSettings.slidesOverlayEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Blocco 2: Slide Top (Hero) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950"></span>
                Slide Top (Hero)
                <span className="text-[10px] text-neutral-400 font-medium normal-case tracking-normal">
                  (1920×1080)
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                {adminTopSlides.length} slide configurate nella testata principale
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPageSettings((prev: any) => ({
                    ...prev,
                    isHeroEnabled: prev.isHeroEnabled === false,
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                  pageSettings.isHeroEnabled !== false
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }`}
              >
                {pageSettings.isHeroEnabled !== false ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>{pageSettings.isHeroEnabled !== false ? 'Visibile' : 'Nascosta'}</span>
              </button>

              <button
                type="button"
                onClick={() => addSlide('home_top')}
                className={`${ADMIN_BTN_PRIMARY} !min-h-[34px] !px-3 !py-1.5 !text-[10px] rounded-lg`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Slide</span>
              </button>
            </div>
          </div>

          <AdminSlidePickerList
            slides={adminTopSlides}
            activeIdx={adminTopIdx}
            setActiveIdx={setAdminTopIdx}
            deleteTypeLabel="Hero"
            position="home_top"
            setSlideToDelete={(target) => deleteSlide(target.id, target.position)}
          />

          {adminTopSlides.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
              <Compass className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-400 text-xs font-light">
                Nessuna slide Hero presente. Aggiungine una per accogliere i tuoi clienti.
              </p>
            </div>
          ) : (
            adminTopSlides[adminTopIdx] && (
              <div className="p-4 sm:p-5 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      URL Immagine o Carica File
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminTopSlides[adminTopIdx]?.url || ''}
                        onChange={(e) => {
                          const slideId = adminTopSlides[adminTopIdx].id;
                          setPageSettings((prev: any) => ({
                            ...prev,
                            homeSlides: prev.homeSlides.map((s: any) =>
                              s.id === slideId ? { ...s, url: e.target.value } : s
                            ),
                          }));
                        }}
                        className={`${ADMIN_INPUT} flex-1`}
                        placeholder="https://..."
                      />
                      <label className={`${ADMIN_BTN_SECONDARY} !px-3 shrink-0 cursor-pointer rounded-xl`}>
                        <Upload className="w-4 h-4 text-neutral-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const slideId = adminTopSlides[adminTopIdx].id;
                            processImageUpload(e, (url) => {
                              setPageSettings((prev: any) => ({
                                ...prev,
                                homeSlides: prev.homeSlides.map((s: any) =>
                                  s.id === slideId ? { ...s, url } : s
                                ),
                              }));
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Link Destinazione (Opzionale)
                    </label>
                    <input
                      type="text"
                      value={adminTopSlides[adminTopIdx]?.link || ''}
                      onChange={(e) => {
                        const slideId = adminTopSlides[adminTopIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, link: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                      placeholder="/categoria/novita"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Titolo SEO / Testata
                    </label>
                    <input
                      type="text"
                      value={adminTopSlides[adminTopIdx]?.title || ''}
                      onChange={(e) => {
                        const slideId = adminTopSlides[adminTopIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, title: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                      placeholder="Nuova Collezione"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Testo Alt Immagine
                    </label>
                    <input
                      type="text"
                      value={adminTopSlides[adminTopIdx]?.alt || ''}
                      onChange={(e) => {
                        const slideId = adminTopSlides[adminTopIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, alt: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                      placeholder="Descrizione per motori di ricerca"
                    />
                  </div>
                </div>

                {adminTopSlides[adminTopIdx]?.url && (
                  <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                    <img
                      src={adminTopSlides[adminTopIdx].url}
                      alt={adminTopSlides[adminTopIdx].alt || 'Anteprima Hero'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Blocco 3: Slide Middle (1920×600) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
                Slide Middle (Intermedie)
                <span className="text-[10px] text-neutral-400 font-medium normal-case tracking-normal">
                  (1920×600)
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                {adminMidSlides.length} banner di metà pagina configurati
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPageSettings((prev: any) => ({
                    ...prev,
                    isMiddleSlidesEnabled: prev.isMiddleSlidesEnabled === false,
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                  pageSettings.isMiddleSlidesEnabled !== false
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }`}
              >
                {pageSettings.isMiddleSlidesEnabled !== false ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>
                  {pageSettings.isMiddleSlidesEnabled !== false ? 'Visibile' : 'Nascosta'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => addSlide('home_middle')}
                className={`${ADMIN_BTN_PRIMARY} !min-h-[34px] !px-3 !py-1.5 !text-[10px] rounded-lg`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Slide</span>
              </button>
            </div>
          </div>

          <AdminSlidePickerList
            slides={adminMidSlides}
            activeIdx={adminMidIdx}
            setActiveIdx={setAdminMidIdx}
            deleteTypeLabel="Middle"
            position="home_middle"
            setSlideToDelete={(target) => deleteSlide(target.id, target.position)}
          />

          {adminMidSlides.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
              <Compass className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-400 text-xs font-light">
                Nessuna slide intermedia configurata.
              </p>
            </div>
          ) : (
            adminMidSlides[adminMidIdx] && (
              <div className="p-4 sm:p-5 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      URL Immagine o Carica File
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminMidSlides[adminMidIdx]?.url || ''}
                        onChange={(e) => {
                          const slideId = adminMidSlides[adminMidIdx].id;
                          setPageSettings((prev: any) => ({
                            ...prev,
                            homeSlides: prev.homeSlides.map((s: any) =>
                              s.id === slideId ? { ...s, url: e.target.value } : s
                            ),
                          }));
                        }}
                        className={`${ADMIN_INPUT} flex-1`}
                        placeholder="https://..."
                      />
                      <label className={`${ADMIN_BTN_SECONDARY} !px-3 shrink-0 cursor-pointer rounded-xl`}>
                        <Upload className="w-4 h-4 text-neutral-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const slideId = adminMidSlides[adminMidIdx].id;
                            processImageUpload(e, (url) => {
                              setPageSettings((prev: any) => ({
                                ...prev,
                                homeSlides: prev.homeSlides.map((s: any) =>
                                  s.id === slideId ? { ...s, url } : s
                                ),
                              }));
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Link Destinazione
                    </label>
                    <input
                      type="text"
                      value={adminMidSlides[adminMidIdx]?.link || ''}
                      onChange={(e) => {
                        const slideId = adminMidSlides[adminMidIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, link: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                      placeholder="/categoria/promozioni"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Titolo SEO
                    </label>
                    <input
                      type="text"
                      value={adminMidSlides[adminMidIdx]?.title || ''}
                      onChange={(e) => {
                        const slideId = adminMidSlides[adminMidIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, title: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Alt Text SEO
                    </label>
                    <input
                      type="text"
                      value={adminMidSlides[adminMidIdx]?.alt || ''}
                      onChange={(e) => {
                        const slideId = adminMidSlides[adminMidIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, alt: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                    />
                  </div>
                </div>

                {adminMidSlides[adminMidIdx]?.url && (
                  <div className="aspect-[16/5] max-h-40 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                    <img
                      src={adminMidSlides[adminMidIdx].url}
                      alt={adminMidSlides[adminMidIdx].alt || 'Anteprima Middle'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Blocco 4: Slide Bottom (1920×600) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                Slide Bottom (Fine Pagina)
                <span className="text-[10px] text-neutral-400 font-medium normal-case tracking-normal">
                  (1920×600)
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                {adminBotSlides.length} banner di chiusura configurati
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPageSettings((prev: any) => ({
                    ...prev,
                    isBottomSlidesEnabled: prev.isBottomSlidesEnabled === false,
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                  pageSettings.isBottomSlidesEnabled !== false
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }`}
              >
                {pageSettings.isBottomSlidesEnabled !== false ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                <span>
                  {pageSettings.isBottomSlidesEnabled !== false ? 'Visibile' : 'Nascosta'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => addSlide('home_bottom')}
                className={`${ADMIN_BTN_PRIMARY} !min-h-[34px] !px-3 !py-1.5 !text-[10px] rounded-lg`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Slide</span>
              </button>
            </div>
          </div>

          <AdminSlidePickerList
            slides={adminBotSlides}
            activeIdx={adminBotIdx}
            setActiveIdx={setAdminBotIdx}
            deleteTypeLabel="Bottom"
            position="home_bottom"
            setSlideToDelete={(target) => deleteSlide(target.id, target.position)}
          />

          {adminBotSlides.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
              <Compass className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-400 text-xs font-light">
                Nessuna slide di chiusura configurata.
              </p>
            </div>
          ) : (
            adminBotSlides[adminBotIdx] && (
              <div className="p-4 sm:p-5 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      URL Immagine o Carica File
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminBotSlides[adminBotIdx]?.url || ''}
                        onChange={(e) => {
                          const slideId = adminBotSlides[adminBotIdx].id;
                          setPageSettings((prev: any) => ({
                            ...prev,
                            homeSlides: prev.homeSlides.map((s: any) =>
                              s.id === slideId ? { ...s, url: e.target.value } : s
                            ),
                          }));
                        }}
                        className={`${ADMIN_INPUT} flex-1`}
                        placeholder="https://..."
                      />
                      <label className={`${ADMIN_BTN_SECONDARY} !px-3 shrink-0 cursor-pointer rounded-xl`}>
                        <Upload className="w-4 h-4 text-neutral-600" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const slideId = adminBotSlides[adminBotIdx].id;
                            processImageUpload(e, (url) => {
                              setPageSettings((prev: any) => ({
                                ...prev,
                                homeSlides: prev.homeSlides.map((s: any) =>
                                  s.id === slideId ? { ...s, url } : s
                                ),
                              }));
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Link Destinazione
                    </label>
                    <input
                      type="text"
                      value={adminBotSlides[adminBotIdx]?.link || ''}
                      onChange={(e) => {
                        const slideId = adminBotSlides[adminBotIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, link: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                      placeholder="/categoria/outlet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Titolo SEO
                    </label>
                    <input
                      type="text"
                      value={adminBotSlides[adminBotIdx]?.title || ''}
                      onChange={(e) => {
                        const slideId = adminBotSlides[adminBotIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, title: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                      Alt Text SEO
                    </label>
                    <input
                      type="text"
                      value={adminBotSlides[adminBotIdx]?.alt || ''}
                      onChange={(e) => {
                        const slideId = adminBotSlides[adminBotIdx].id;
                        setPageSettings((prev: any) => ({
                          ...prev,
                          homeSlides: prev.homeSlides.map((s: any) =>
                            s.id === slideId ? { ...s, alt: e.target.value } : s
                          ),
                        }));
                      }}
                      className={ADMIN_INPUT}
                    />
                  </div>
                </div>

                {adminBotSlides[adminBotIdx]?.url && (
                  <div className="aspect-[16/5] max-h-40 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                    <img
                      src={adminBotSlides[adminBotIdx].url}
                      alt={adminBotSlides[adminBotIdx].alt || 'Anteprima Bottom'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Blocco 5: Banner Categorie Home */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-400" />
                Banner per Categoria
              </h3>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                Grafiche promozionali specifiche per ogni macro-categoria
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(pageSettings.categoryBanners || {}).map((catName) => {
              const banner = pageSettings.categoryBanners[catName] || {};
              return (
                <div
                  key={catName}
                  className="bg-neutral-50/70 p-4 sm:p-5 rounded-xl border border-neutral-200/80 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2.5">
                    <h5 className="text-xs font-medium text-neutral-950 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-950"></span>
                      {catName}
                    </h5>
                    <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">
                      Banner Home
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                        URL Immagine o Carica
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={banner.url || ''}
                          onChange={(e) =>
                            setPageSettings((prev: any) => ({
                              ...prev,
                              categoryBanners: {
                                ...prev.categoryBanners,
                                [catName]: { ...banner, url: e.target.value },
                              },
                            }))
                          }
                          className={`${ADMIN_INPUT} flex-1`}
                          placeholder="https://..."
                        />
                        <label className={`${ADMIN_BTN_SECONDARY} !px-3 shrink-0 cursor-pointer rounded-xl`}>
                          <Upload className="w-4 h-4 text-neutral-600" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              processImageUpload(e, (url) =>
                                setPageSettings((prev: any) => ({
                                  ...prev,
                                  categoryBanners: {
                                    ...prev.categoryBanners,
                                    [catName]: { ...banner, url },
                                  },
                                }))
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                        Link Destinazione
                      </label>
                      <input
                        type="text"
                        value={banner.link || ''}
                        onChange={(e) =>
                          setPageSettings((prev: any) => ({
                            ...prev,
                            categoryBanners: {
                              ...prev.categoryBanners,
                              [catName]: { ...banner, link: e.target.value },
                            },
                          }))
                        }
                        className={ADMIN_INPUT}
                        placeholder={`/category/${encodeURIComponent(catName)}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                        Titolo SEO
                      </label>
                      <input
                        type="text"
                        value={banner.title || ''}
                        onChange={(e) =>
                          setPageSettings((prev: any) => ({
                            ...prev,
                            categoryBanners: {
                              ...prev.categoryBanners,
                              [catName]: { ...banner, title: e.target.value },
                            },
                          }))
                        }
                        className={ADMIN_INPUT}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 block">
                        Alt Text SEO
                      </label>
                      <input
                        type="text"
                        value={banner.alt || ''}
                        onChange={(e) =>
                          setPageSettings((prev: any) => ({
                            ...prev,
                            categoryBanners: {
                              ...prev.categoryBanners,
                              [catName]: { ...banner, alt: e.target.value },
                            },
                          }))
                        }
                        className={ADMIN_INPUT}
                      />
                    </div>
                  </div>

                  {banner.url && (
                    <div className="h-28 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                      <img
                        src={banner.url}
                        alt={banner.alt || catName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pulsante finale salvataggio */}
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
