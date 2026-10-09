import { Product } from './types';

export const CATEGORIES = [
  "Shirt",
  "Felpe",
  "Tute",
  "Jeans",
  "Pantalone",
  "Camice",
  "Giubbini",
  "Scarpe"
];

export const SUBCATEGORIES: Record<string, string[]> = {
  "Shirt": ["T-Shirt Basic", "T-Shirt Oversize", "Polo Piqué", "Graphic Shirt"],
  "Felpe": ["Hoodies con Cappuccio", "Girocollo Minimal", "Felpe Zip", "Felpe Pesanti"],
  "Tute": ["Completi Tuta", "Pantaloni Jogger", "Felpe Tuta", "Street Lounge"],
  "Jeans": ["Selvedge Denim", "Slim Fit", "Regular Tapered", "Vintage Wash"],
  "Pantalone": ["Pantaloni Sartoriali", "Chino con Pinces", "Pantaloni Diritto", "Pantaloni Lino"],
  "Camice": ["Camicie in Lino", "Camicie Sartoriali", "Camicie Formale", "Collo Francese"],
  "Giubbini": ["Giubbotti in Pelle", "Blazer Sartoriali", "Cappotti Lana", "Bomber & Giubbini"],
  "Scarpe": ["Sneakers in Pelle", "Mocassini Penny", "Chelsea Boots", "Derby Artigianali"]
};

export const PRODUCTS: Product[] = [];

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const DEFAULT_COMPANY_SETTINGS = {
  logo: "V",
  imageLogo: "",
  favicon: "",
  name: "Vincent Store",
  legalName: "Vincent Store S.r.l.",
  vatNumber: "10426021217",
  sdiCode: "VNC2026",
  legalAddress: "Corso San Giovanni a Teduccio, 293, 80146 Napoli NA",
  phone: "+39 331 342 4069",
  landlinePhone: "081 3507556",
  email: "info@vincentabbigliamento.it",
  bioLink: "vincentstore.it/contatti",
  mission: "Ricerchiamo costantemente le migliori soluzioni per proporre un trend accessibile a tutti ma di qualità: selezioniamo con cura tessuti, materiali, fatture e dettagli grazie all'esperienza di esperti del settore, proponendo oltre alle nostre sedi fisiche anche la vendita online attraverso i canali social e web ufficiali.",
  socials: {
    facebook: "",
    instagram: "https://www.instagram.com/vincent.store.7?obrf=MXV3aWN3dTVlbnhybQ%3D%3D&utm_source=qr",
    twitter: "",
    youtube: "",
    tiktok: "https://www.tiktok.com/@vincent_store7?_r=1&_t=ZN-9APNxQ7kCes",
    whatsapp: "https://wa.me/393313424069"
  },
  googleVerificationTag: "",
  googleAnalyticsId: "",
  googleAnalyticsSnippet: "",
  adsTxtContent: "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
  customGeminiKey: "",
  orderStatusSenderEmail: "info@vincentabbigliamento.it"
};

export const DEFAULT_PAGE_SETTINGS = {
  isHeroEnabled: true,
  isPromoEnabled: true,
  isFeaturedEnabled: true,
  featuredTitle: "SELEZIONE SARTORIALE",
  isSpecialCategoryEnabled: true,
  specialCategoryTitle: "I MUST-HAVE DI STAGIONE",
  isNewArrivalsEnabled: true,
  newArrivalsTitle: "NUOVA COLLEZIONE UOMO",
  isMiddleSlidesEnabled: true,
  isBottomSlidesEnabled: true,
  slidesOverlayEnabled: false,
  isQuickLinksEnabled: false,
  categories: [...CATEGORIES],
  subcategories: { ...SUBCATEGORIES },
  quickLinks: [],
  linkRapidi: [],
  homeSlides: [
    { 
      id: 'h1', 
      url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1920&q=80', 
      title: 'NUOVA COLLEZIONE SARTORIALE', 
      alt: "Eleganza senza tempo e tagli impeccabili per l'uomo contemporaneo.", 
      position: 'home_top' 
    },
    { 
      id: 'h2', 
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=80', 
      title: 'CASHMERE & URBAN LUXURY', 
      alt: "Tessuti nobili e silhouette raffinate per ogni momento della giornata.", 
      position: 'home_top' 
    },
    { 
      id: 'h3', 
      url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1920&q=80', 
      title: 'STILE ESSENZIALE & DISTINTO', 
      alt: "Capi esclusivi realizzati a mano con la maestria del Made in Italy.", 
      position: 'home_top' 
    }
  ],
  categoryBanners: {},
  categorySeo: {},
  maxFeatured: 8,
  maxNewArrivals: 12,
  specialCategoryMax: 4,
  topBarMode: 'static',
  topBarLeftText: "Spedizione Express Gratuita su tutti gli ordini",
  topBarRightText: "Atelier Napoli & Servizio Clienti",
  topBarMarqueeText: "VINCENT STORE — NUOVA COLLEZIONE MODA UOMO — SARTORIA ITALIANA — RESI GRATUITI",
  topBarMarqueeSpeed: 30,
};
