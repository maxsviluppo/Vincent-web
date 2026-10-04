import { Product } from './types';

export const CATEGORIES = [
  "Tutti",
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

export const PRODUCTS: Product[] = [
  // 1. Giubbini
  {
    id: "1",
    name: "Blazer Sartoriale Slim-Fit in Lana Vergine",
    brand: "Vincent Sartoria",
    price: 340.00,
    category: "Giubbini",
    subcategory: "Blazer Sartoriali",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
    description: "Blazer monopetto destrutturato in pura lana vergine super 120s italiana. Rever a lancia e finiture artigianali fatte a mano.",
    rating: 4.9,
    reviews: 48,
    specs: {
      "Materiale": "100% Lana Vergine Super 120s",
      "Vestibilità": "Slim Fit Contemporaneo",
      "Manifattura": "Made in Italy (Biella)"
    },
    gallery: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true,
    tags: ["giubbini", "blazer", "sartoriale"]
  },
  {
    id: "2",
    name: "Giubbotto Biker in Vera Pelle Nappa Vintage",
    brand: "Vincent Leather",
    price: 450.00,
    category: "Giubbini",
    subcategory: "Giubbotti in Pelle",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80",
    description: "Giacca da uomo in morbida pelle nappa d'agnello con trattamento vintage artigianale. Zip metalliche brunite YKK.",
    rating: 4.9,
    reviews: 84,
    specs: {
      "Pelle": "100% Vera Pelle Nappa d'Agnello",
      "Hardware": "Zip YKK brunite",
      "Taglio": "Slim Biker Jacket"
    },
    gallery: [
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1000&q=80"
    ],
    isSpecialPromotion: true
  },

  // 2. Camice
  {
    id: "3",
    name: "Camicia Sartoriale Slim in Puro Lino Bianco",
    brand: "Vincent Atelier",
    price: 125.00,
    category: "Camice",
    subcategory: "Camicie in Lino",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
    description: "Camicia bianca in puro lino naturale lavato, collo alla francese e bottoni in madreperla australiana. Fresca ed elegante.",
    rating: 4.8,
    reviews: 94,
    specs: {
      "Tessuto": "100% Puro Lino di Normandia",
      "Collo": "Francese Aperto",
      "Bottoni": "Madreperla Genuina"
    },
    gallery: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "4",
    name: "Camicia Formale Doppio Ritorto Celeste Riviera",
    brand: "Vincent Atelier",
    price: 135.00,
    category: "Camice",
    subcategory: "Camicie Formale",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=80",
    description: "Camicia sartoriale in popeline di cotone doppio ritorto 120/2. Lucentezza setosa e perfetta tenuta del colletto.",
    rating: 4.9,
    reviews: 65,
    specs: {
      "Tessuto": "100% Cotone Egiziano 120/2",
      "Vestibilità": "Tailored Fit"
    },
    gallery: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 3. Shirt
  {
    id: "5",
    name: "T-Shirt Minimal Oversize Heavyweight 240g",
    brand: "Vincent Studio",
    price: 65.00,
    category: "Shirt",
    subcategory: "T-Shirt Oversize",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
    description: "T-shirt dal taglio contemporaneo boxy realizzata in cotone organico pettinato ad alta grammatura. Tessuto corposo a mano setosa.",
    rating: 4.8,
    reviews: 112,
    specs: {
      "Grammatura": "240 GSM Cotone Organico",
      "Collo": "Costina rinforzata a doppio ago",
      "Vestibilità": "Boxy Oversize"
    },
    gallery: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "6",
    name: "Polo Sartoriale in Cotone Pima Mercerizzato",
    brand: "Vincent Atelier",
    price: 98.00,
    category: "Shirt",
    subcategory: "Polo Piqué",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80",
    description: "Polo manica corta in finissimo cotone Pima mercerizzato brillante con colletto a camicia strutturato.",
    rating: 4.7,
    reviews: 41,
    specs: {
      "Tessuto": "100% Cotone Pima Mercerizzato",
      "Bottoni": "Madreperla naturale"
    },
    gallery: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 4. Felpe
  {
    id: "7",
    name: "Hoodie Luxury in Cotone Loopback Francese",
    brand: "Vincent Studio",
    price: 140.00,
    category: "Felpe",
    subcategory: "Hoodies con Cappuccio",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    description: "Felpa con cappuccio a doppio strato in morbida felpa loopback francese 420g. Design minimalista senza cordini per una silhouette pulita.",
    rating: 4.9,
    reviews: 73,
    specs: {
      "Grammatura": "420 GSM French Terry",
      "Cappuccio": "Doppio strato anatomico",
      "Taglio": "Relaxed Fit"
    },
    gallery: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "8",
    name: "Girocollo Felpa Minimalist Essential",
    brand: "Vincent Studio",
    price: 120.00,
    category: "Felpe",
    subcategory: "Girocollo Minimal",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
    description: "Felpa girocollo essenziale con logo monocromatico tonale. Vestibilità perfetta sia con pantaloni chino che denim.",
    rating: 4.8,
    reviews: 58,
    specs: {
      "Composizione": "100% Cotone Pettinato",
      "Finiture": "Polsi e fondo a costine dense"
    },
    gallery: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 5. Tute
  {
    id: "9",
    name: "Completo Tuta Luxury Streetwear in Interlock",
    brand: "Vincent Sport",
    price: 195.00,
    category: "Tute",
    subcategory: "Completi Tuta",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80",
    description: "Coordinato tuta composto da giacca con zip bidirezionale e pantalone con tirante sartoriale in cotone interlock compatto e antipiega.",
    rating: 5.0,
    reviews: 32,
    specs: {
      "Set": "Giacca Zip + Pantalone Jogger",
      "Tessuto": "Cotone Interlock Alta Densità",
      "Dettagli": "Zip metalliche canna di fucile"
    },
    gallery: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80"
    ],
    isSpecialPromotion: true
  },
  {
    id: "10",
    name: "Pantalone Jogger Tuta con Pinces Sartoriali",
    brand: "Vincent Sport",
    price: 95.00,
    category: "Tute",
    subcategory: "Pantaloni Jogger",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80",
    description: "Pantalone da tuta raffinato che unisce il comfort del jersey felpato al rigore della pince frontale. Fondo con elastico a scomparsa.",
    rating: 4.7,
    reviews: 44,
    specs: {
      "Tessuto": "95% Cotone, 5% Elastan Comfort",
      "Dettaglio": "Pince sartoriale cucita"
    },
    gallery: [
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 6. Jeans
  {
    id: "11",
    name: "Jeans Selvedge Denim Giapponese Regular Tapered",
    brand: "Vincent Denim",
    price: 175.00,
    category: "Jeans",
    subcategory: "Selvedge Denim",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80",
    description: "Denim cimosato 13.5 oz tessuto su antichi telai a navetta Kuroki in Giappone. Tonalità indaco profondo destinata ad invecchiare magnificamente.",
    rating: 4.9,
    reviews: 86,
    specs: {
      "Tessuto": "13.5 oz Selvedge Kuroki Mills Japan",
      "Cimosa": "Filo rosso autentico visibile sul risvolto",
      "Taglio": "Regular Tapered Fit"
    },
    gallery: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "12",
    name: "Jeans Slim Fit Vintage Washed con Rivetti in Rame",
    brand: "Vincent Denim",
    price: 150.00,
    category: "Jeans",
    subcategory: "Vintage Wash",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80",
    description: "Jeans dal lavaggio indaco medio con baffature naturali eseguite a mano. Denim stretch elastico per la massima libertà di movimento.",
    rating: 4.8,
    reviews: 69,
    specs: {
      "Composizione": "98% Cotone, 2% Elastan Comfort",
      "Rivetti": "Rame brunito vintage",
      "Salpa": "Vera pelle con impresso il logo Vincent"
    },
    gallery: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 7. Pantalone
  {
    id: "13",
    name: "Pantaloni Chino Sartoriali con Doppia Pinces",
    brand: "Vincent Sartoria",
    price: 165.00,
    category: "Pantalone",
    subcategory: "Chino con Pinces",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
    description: "Pantaloni sartoriali dal taglio moderno con doppia pince frontale, chiusura a tirante allungata e tasche a filetto. Cotone pettinato sabbia riviera.",
    rating: 4.7,
    reviews: 39,
    specs: {
      "Composizione": "98% Cotone Egiziano, 2% Elastan",
      "Dettaglio": "Fondo risvoltato 4 cm sartoriale",
      "Chiusura": "Tirante sartoriale allungato"
    },
    gallery: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "14",
    name: "Pantalone Dritto Sartoriale in Lana Fresca Estiva",
    brand: "Vincent Sartoria",
    price: 185.00,
    category: "Pantalone",
    subcategory: "Pantaloni Sartoriali",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80",
    description: "Pantalone formale elegante con piega centrale stirata in fresco lana antipiega. Traspirabilità eccezionale per l'ufficio e cene esclusive.",
    rating: 4.9,
    reviews: 51,
    specs: {
      "Tessuto": "100% Fresco Lana Tropicale 210g",
      "Interni": "Cintella sartoriale interna antiscivolo"
    },
    gallery: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // 8. Scarpe
  {
    id: "15",
    name: "Sneakers Minimal in Pelle Pieno Fiore Artigianale",
    brand: "Vincent Footwear",
    price: 195.00,
    category: "Scarpe",
    subcategory: "Sneakers in Pelle",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80",
    description: "Sneakers basse realizzate a mano nelle Marche in pelle di vitello pieno fiore bianco ottico. Suola cucita Margom in gomma naturale.",
    rating: 4.9,
    reviews: 110,
    specs: {
      "Tomaia": "Pelle di Vitello Pieno Fiore",
      "Suola": "Gomma Margom Cucita a Cassetta",
      "Fodera": "Pelle di vitello traspirante"
    },
    gallery: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    id: "16",
    name: "Mocassino Penny Loafer in Camoscio Spazzolato",
    brand: "Vincent Footwear",
    price: 260.00,
    category: "Scarpe",
    subcategory: "Mocassini Penny",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80",
    description: "Mocassino classico Penny Loafer in pregiato suede testa di moro idrorepellente. Costruzione artigianale flessibile Blake per un comfort straordinario.",
    rating: 4.8,
    reviews: 77,
    specs: {
      "Tomaia": "Pregiato Camoscio Idrorepellente",
      "Suola": "Cuoio con inserto in gomma antiscivolo",
      "Lavorazione": "Artigianale Blake Flex"
    },
    gallery: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  }
];

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
  isQuickLinksEnabled: true,
  categories: [...CATEGORIES],
  subcategories: { ...SUBCATEGORIES },
  // Geometria: 2 rettangoli in alto + 4 piccoli box sotto
  quickLinks: [
    { 
      id: '1', 
      title: 'Giubbini', 
      subtitle: 'Sartoria & Capispalla', 
      category: 'Giubbini', 
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      isRectangle: true
    },
    { 
      id: '2', 
      title: 'Camice', 
      subtitle: 'Lino & Popeline Sartoriale', 
      category: 'Camice', 
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      isRectangle: true
    },
    { 
      id: '3', 
      title: 'Shirt', 
      subtitle: 'Cotone Organico', 
      category: 'Shirt', 
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '4', 
      title: 'Felpe', 
      subtitle: 'French Terry & Hoodies', 
      category: 'Felpe', 
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '5', 
      title: 'Jeans & Pantalone', 
      subtitle: 'Selvedge Denim & Chino', 
      category: 'Jeans', 
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '6', 
      title: 'Scarpe', 
      subtitle: 'Sneakers & Mocassini', 
      category: 'Scarpe', 
      imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80'
    },
  ],
  linkRapidi: [
    { 
      id: '1', 
      title: 'Giubbini', 
      subtitle: 'Sartoria & Capispalla', 
      category: 'Giubbini', 
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      isRectangle: true
    },
    { 
      id: '2', 
      title: 'Camice', 
      subtitle: 'Lino & Popeline Sartoriale', 
      category: 'Camice', 
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      isRectangle: true
    },
    { 
      id: '3', 
      title: 'Shirt', 
      subtitle: 'Cotone Organico', 
      category: 'Shirt', 
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '4', 
      title: 'Felpe', 
      subtitle: 'French Terry & Hoodies', 
      category: 'Felpe', 
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '5', 
      title: 'Jeans & Pantalone', 
      subtitle: 'Selvedge Denim & Chino', 
      category: 'Jeans', 
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '6', 
      title: 'Scarpe', 
      subtitle: 'Sneakers & Mocassini', 
      category: 'Scarpe', 
      imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80'
    },
  ],
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
