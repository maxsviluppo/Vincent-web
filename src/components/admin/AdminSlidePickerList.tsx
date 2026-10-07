'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

type SlideItem = {
  id: string;
  title?: string;
  url?: string;
};

type SlideDeleteTarget = {
  id: string;
  type: string;
  position: string;
};

export function AdminSlidePickerList({
  slides,
  activeIdx,
  setActiveIdx,
  deleteTypeLabel,
  position,
  setSlideToDelete,
}: {
  slides: SlideItem[];
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
  deleteTypeLabel: string;
  position: string;
  setSlideToDelete: (target: SlideDeleteTarget) => void;
}) {
  if (slides.length === 0) return null;

  return (
    <ul className="admin-slides-minimal-list border border-neutral-200 rounded-xl divide-y divide-neutral-200 overflow-hidden mb-4">
      {slides.map((slide, i) => {
        const isActive = i === activeIdx;
        return (
          <li
            key={slide.id}
            className={`flex items-center gap-2 bg-white ${isActive ? 'bg-neutral-50' : ''}`}
          >
            <button
              type="button"
              onClick={() => setActiveIdx(i)}
              className="flex-1 min-w-0 text-left px-3 py-3 md:py-2.5 flex items-center gap-3"
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium border ${
                  isActive
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-500'
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-light uppercase tracking-[0.12em] text-neutral-900 truncate">
                  {slide.title?.trim() || `Foglio ${i + 1}`}
                </span>
                <span className="block text-[10px] text-neutral-400 truncate">
                  {slide.url ? 'Immagine impostata' : 'Senza immagine'}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setSlideToDelete({
                  id: slide.id,
                  type: `${deleteTypeLabel} ${i + 1}`,
                  position,
                })
              }
              className="admin-cat-btn-delete shrink-0 w-11 h-11 md:w-10 md:h-10 mr-1 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              aria-label={`Elimina foglio ${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
