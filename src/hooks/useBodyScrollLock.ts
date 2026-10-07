'use client';

import { useEffect } from 'react';

/** Blocca lo scroll del body quando locked è true; ripristino esplicito quando false. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      return;
    }

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [locked]);
}
