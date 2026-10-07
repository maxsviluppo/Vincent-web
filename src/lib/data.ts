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

// Prodotti dimostrativi rimossi (inizia con catalogo pulito)
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
  vatNumber: "09876543210",
  sdiCode: "VNC2026",
  legalAddress: "Via Monte Napoleone 18, 20121 Milano",
  phone: "+39 02 8901234",
  email: "concierge@vincentstore.it",
  bioLink: "vincentstore.it/concierge",
  mission: "L'eleganza maschile contemporanea. Capi sartoriali di prestigio, tessuti nobili e design senza tempo per l'uomo raffinato.",
  socials: {
    facebook: "https://facebook.com/vincentstore",
    instagram: "https://instagram.com/vincentstore_milano",
    twitter: "https://twitter.com/vincentstore",
    youtube: "https://youtube.com/@vincentstore",
    tiktok: "https://tiktok.com/@vincentstore"
  },
  googleVerificationTag: "",
  googleAnalyticsId: "",
  googleAnalyticsSnippet: "",
  adsTxtContent: "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
  customGeminiKey: "",
  orderStatusSenderEmail: "concierge@vincentstore.it"
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
      id: 'slide-1', 
      url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=2000&q=85', 
      badge: 'NUOVA COLLEZIONE UOMO',
      title: 'SARTORIA & URBAN LUXURY', 
      alt: "Abiti sartoriali, cappotti e giacche dal taglio impeccabile Made in Italy.", 
      position: 'home_top' 
    },
    { 
      id: 'slide-2', 
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=85', 
      badge: 'CASHMERE & KNITWEAR',
      title: 'STILE ESSENZIALE & DISTINTO', 
      alt: "Maglieria in pura lana vergine e cashmere per una calda raffinatezza quotidiana.", 
      position: 'home_top' 
    },
    { 
      id: 'slide-3', 
      url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=2000&q=85', 
      badge: 'CASUAL RAFFINATO',
      title: 'LINEA CONTEMPORANEA', 
      alt: "Camicie su misura, pantaloni chino e capispalla per l'uomo dinamico.", 
      position: 'home_top' 
    },
    { 
      id: 'slide-4', 
      url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=2000&q=85', 
      badge: 'COLLEZIONE ESCLUSIVA',
      title: 'LUSSO SENZA COMPROMESSI', 
      alt: "Dettagli ricercati e finiture artigianali per un guardaroba distintivo.", 
      position: 'home_top' 
    },
    {
      id: 'slide-mid-1',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=85',
      title: 'CAPISPALLA & SARTORIA',
      alt: 'Slide middle — collezione capispalla.',
      position: 'home_middle',
    },
    {
      id: 'slide-bot-1',
      url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1920&q=85',
      title: 'CAMICIE & DETTAGLI',
      alt: 'Slide bottom — camicie e accessori.',
      position: 'home_bottom',
    },
  ],
  categoryBanners: {},
  categorySeo: {},
  maxFeatured: 8,
  maxNewArrivals: 12,
  specialCategoryMax: 4,
  topBarMode: 'static',
  topBarLeftText: "Spedizione Express Gratuita su tutti gli ordini",
  topBarRightText: "Boutique Milano & Servizio Concierge",
  topBarMarqueeText: "VINCENT STORE — NUOVA COLLEZIONE MODA UOMO — SARTORIA ITALIANA — RESI GRATUITI",
  topBarMarqueeSpeed: 30,
};
