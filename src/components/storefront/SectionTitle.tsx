'use client';

import React from 'react';
import { motion } from 'motion/react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8 font-['Montserrat',sans-serif]"
    >
      <div className="flex items-center gap-3 mb-1.5">
        <div className="w-1 h-6 bg-neutral-900 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-light text-neutral-950 uppercase tracking-[0.22em] leading-none">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-xs font-light text-neutral-400 uppercase tracking-[0.18em] ml-4">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
