'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/context/AppProvider';

export function CategoryBanner() {
  const { selectedCategory, pageSettings } = useApp();

  if (selectedCategory === 'Tutti') return null;

  const bannerUrl = pageSettings.categoryImages?.[selectedCategory] || `https://picsum.photos/seed/${selectedCategory}/1920/400`;
  const seoData = pageSettings.categorySeo?.[selectedCategory] || {};

  return (
    <section className="px-4 mb-12">
      <div className="relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <img 
          src={bannerUrl} 
          alt={selectedCategory} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={selectedCategory}
          >
            <p className="text-brand-yellow font-black uppercase tracking-[0.3em] text-xs mb-2">Esplora la Categoria</p>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
              {selectedCategory}
            </h2>
            {seoData.description && (
              <p className="max-w-2xl text-white/70 text-sm md:text-base font-medium leading-relaxed">
                {seoData.description}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
