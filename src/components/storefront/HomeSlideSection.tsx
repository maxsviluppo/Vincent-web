'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function HomeSlideSection({
  slides,
  darken = false,
}: {
  slides: any[];
  darken?: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const currentSlide = slides[index];

  return (
    <section className="px-4 sm:px-8">
      <div className="relative aspect-[21/9] max-md:aspect-[16/9] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            {darken && (
              <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            )}
            {currentSlide.link ? (
              <a href={currentSlide.link} className="block w-full h-full">
                <img
                  src={currentSlide.url}
                  alt={currentSlide.alt || ''}
                  title={currentSlide.title || ''}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <img
                src={currentSlide.url}
                alt={currentSlide.alt || ''}
                title={currentSlide.title || ''}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
