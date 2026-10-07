'use client';

// Polyfill globalThis.localStorage for Node 22 SSR environments
if (typeof globalThis !== 'undefined') {
  try {
    if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
      const store = new Map<string, string>();
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: (k: string) => store.get(String(k)) ?? null,
          setItem: (k: string, v: string) => store.set(String(k), String(v)),
          removeItem: (k: string) => store.delete(String(k)),
          clear: () => store.clear(),
          key: (i: number) => Array.from(store.keys())[i] ?? null,
          get length() { return store.size; },
        },
        configurable: true,
        writable: true,
      });
    }
  } catch {}
}

import React from "react";
import "./globals.css";
import Script from "next/script";
import { StorefrontLauncher } from '@/components/storefront/StorefrontLauncher';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning={true}>
      <head>
        <title>Vincent Store — Collezione Moda Uomo & Sartoria</title>
        <meta name="description" content="Vincent Store — Scopri la nuova collezione abbigliamento, giacche sartoriali, maglieria cashmere, calzature e accessori per l'uomo contemporaneo." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#111111" />
        <link rel="canonical" href="https://www.vincentstore.it" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap" rel="stylesheet" />
        
        {/* Structured Data: Organization */}
        <Script id="org-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Vincent Store",
            url: "https://www.vincentstore.it",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+39-02-8901234",
              contactType: "customer service",
              areaServed: "IT",
              availableLanguage: "Italian",
            },
          })}
        </Script>
      </head>
      <body className="antialiased bg-[#fafafa] text-neutral-900 font-['Montserrat',sans-serif]">
        <StorefrontLauncher>
          {children}
        </StorefrontLauncher>
      </body>
    </html>
  );
}
