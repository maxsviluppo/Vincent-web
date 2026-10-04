'use client';

import React from 'react';

const DEFAULT_MARQUEE =
  'VINCENT STORE — NUOVA COLLEZIONE MODA UOMO — SARTORIA ITALIANA — RESI GRATUITI';

export function TopBarStrip({ pageSettings }: { pageSettings: any }) {
  const mode = pageSettings.topBarMode ?? 'static';
  const marqueeText =
    pageSettings.topBarMarqueeText?.trim() || DEFAULT_MARQUEE;
  const duration = `${Math.max(8, Number(pageSettings.topBarMarqueeSpeed) || 30)}s`;

  if (mode === 'image' && pageSettings.topBarImage) {
    return (
      <img
        src={pageSettings.topBarImage}
        alt=""
        className="w-full h-full object-cover object-center"
      />
    );
  }

  if (mode === 'marquee') {
    return (
      <div className="marquee-topbar h-full w-full overflow-hidden">
        <div
          className="marquee-topbar-track h-full items-center text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
          style={{ animationDuration: duration }}
        >
          <span className="px-8">{marqueeText}</span>
          <span className="px-8" aria-hidden="true">
            {marqueeText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-4 sm:px-8 flex items-center justify-between text-[9px] sm:text-[10px] font-normal tracking-[0.22em] uppercase w-full text-neutral-300">
      <div className="flex items-center gap-2 min-w-0 truncate">
        <span className="hidden sm:inline text-neutral-400 font-light shrink-0">
          VINCENT STORE
        </span>
        <span className="hidden sm:inline text-neutral-700 shrink-0">|</span>
        <span className="text-neutral-200 font-light truncate">
          {pageSettings.topBarLeftText ||
            'Spedizione Express Gratuita su tutti gli ordini'}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="hover:text-white transition-colors cursor-pointer font-light">
          {pageSettings.topBarRightText || 'Boutique & Concierge'}
        </span>
      </div>
    </div>
  );
}
