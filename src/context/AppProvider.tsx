'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { Product, CartItem, Review, Order, CompanySettings } from '@/lib/types';
import { PRODUCTS, DEFAULT_COMPANY_SETTINGS, DEFAULT_PAGE_SETTINGS, slugify } from '@/lib/data';

// ─── Helper: read/write localStorage safely ───────────────────────────────────
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    let raw = localStorage.getItem(key);
    if (raw === null && key.startsWith('vincent_')) {
      raw = localStorage.getItem(key.replace(/^vincent_/, 'bespoint_'));
    }
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('[Vincent Store] localStorage write failed for key:', key);
  }
}

function mergeHomeSlidesWithDefaults(savedSlides: any[] | undefined): any[] {
  const slides = [...(savedSlides?.length ? savedSlides : DEFAULT_PAGE_SETTINGS.homeSlides)];
  for (const position of ['home_middle', 'home_bottom'] as const) {
    if (!slides.some((s) => s.position === position && s.url)) {
      DEFAULT_PAGE_SETTINGS.homeSlides
        .filter((s) => s.position === position)
        .forEach((template) => {
          slides.push({ ...template, id: `${template.id}-${Date.now()}` });
        });
    }
  }
  return slides;
}

// ─── Context Shape ─────────────────────────────────────────────────────────────
interface AppContextValue {
  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  // Cart
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  cartCount: number;
  cartTotal: number;

  // UI State
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAdminOpen: boolean;
  setIsAdminOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthOpen: boolean;
  setIsAuthOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Selected product
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;

  // Filters
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedSubcategory: string;
  setSelectedSubcategory: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredProducts: Product[];

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;

  // Auth
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  authStep: 'email' | 'login' | 'register' | 'profile' | 'edit_profile' | 'orders' | 'support' | 'returns';
  setAuthStep: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;

  // Orders
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  // Reviews
  productReviews: Review[];
  setProductReviews: React.Dispatch<React.SetStateAction<Review[]>>;

  // Return requests
  returnRequests: any[];
  setReturnRequests: React.Dispatch<React.SetStateAction<any[]>>;

  // Settings
  companySettings: CompanySettings;
  setCompanySettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  pageSettings: any;
  setPageSettings: React.Dispatch<React.SetStateAction<any>>;
  paymentSettings: any;
  setPaymentSettings: React.Dispatch<React.SetStateAction<any>>;

  // Global filters
  sortBy: string;
  setSortBy: (s: string) => void;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  isGlobalFiltersExpanded: boolean;
  setIsGlobalFiltersExpanded: (e: boolean) => void;

  // Notification Toasts
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Admin Tab
  adminActiveTab: any;
  setAdminActiveTab: (tab: any) => void;

  // Screen
  isDesktop: boolean;
  cartTrigger: number;

  // Navigation helpers
  handleProductSelect: (p: Product | null) => void;
  handleCategorySelect: (cat: string, sub?: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // — products: auto-heals any missing or broken product images —
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = getLS<Product[]>('vincent_products_v4', []);
    if (!saved || saved.length === 0 || saved.some((p) => !p.image || p.image.length < 10)) {
      return PRODUCTS;
    }
    return saved;
  });
  useEffect(() => setLS('vincent_products_v4', products), [products]);

  // — auth —
  const [currentUser, setCurrentUser] = useState<any>(() =>
    getLS('vincent_current_user', null)
  );
  useEffect(() => setLS('vincent_current_user', currentUser), [currentUser]);

  const [authStep, setAuthStep] = useState<AppContextValue['authStep']>('email');

  const logout = useCallback(() => {
    setCurrentUser(null);
    setLS('vincent_current_user', null);
  }, []);

  // — cart —
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTrigger, setCartTrigger] = useState(0);

  const addToCart = useCallback((p: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    setCartTrigger((t) => t + 1);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  // — UI —
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<any>('dashboard');

  // — isDesktop —
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // — filters —
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBrand, setSelectedBrand] = useState('Tutti');
  const [isGlobalFiltersExpanded, setIsGlobalFiltersExpanded] = useState(false);

  // — favorites (memorizzati con l'account utente) —
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedUser =
        localStorage.getItem('vincent_current_user') ??
        localStorage.getItem('bespoint_current_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const userFavs = localStorage.getItem(`vincent_favs_${u.id || u.email}`);
        if (userFavs) return JSON.parse(userFavs);
      }
    } catch {}
    return getLS('vincent_favorites_global', getLS('vincent_favorites', []));
  });

  useEffect(() => {
    setLS('vincent_favorites_global', favorites);
    setLS('vincent_favorites', favorites);
    if (currentUser) {
      setLS(`vincent_favs_${currentUser.id || currentUser.email}`, favorites);
    }
  }, [favorites, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const userFavs = getLS(`vincent_favs_${currentUser.id || currentUser.email}`, null);
      if (userFavs && Array.isArray(userFavs)) {
        setFavorites(userFavs);
      }
    }
  }, [currentUser]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const filteredProducts = useMemo(() => {
    let arr = [...products];

    // Selezionato filtro Preferiti
    if (selectedCategory === 'Preferiti') {
      arr = arr.filter((p) => favorites.includes(p.id));
    } else if (selectedCategory !== 'Tutti') {
      arr = arr.filter((p) => p.category === selectedCategory);
    }

    if (selectedSubcategory && selectedSubcategory !== 'Tutti') {
      arr = arr.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (selectedBrand !== 'Tutti') {
      arr = arr.filter((p) => p.brand === selectedBrand);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return arr.sort((a, b) => {
      if (sortBy === 'newest') return 0;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy, selectedBrand, favorites]);

  // --- Scroll Management ---
  const lastScrollPos = useRef(0);
  useEffect(() => {
    if (selectedProduct) {
      lastScrollPos.current = window.scrollY;
    } else {
      if (lastScrollPos.current > 0) {
        setTimeout(() => {
          window.scrollTo({ top: lastScrollPos.current, behavior: 'auto' });
          lastScrollPos.current = 0;
        }, 0);
      }
    }
  }, [selectedProduct]);

  // — orders —
  const [orders, setOrders] = useState<Order[]>(() =>
    getLS('vincent_orders', [])
  );
  useEffect(() => setLS('vincent_orders', orders), [orders]);

  // — reviews —
  const [productReviews, setProductReviews] = useState<Review[]>(() =>
    getLS('vincent_reviews_v2', [])
  );
  useEffect(() => setLS('vincent_reviews_v2', productReviews), [productReviews]);

  // — return requests —
  const [returnRequests, setReturnRequests] = useState<any[]>(() =>
    getLS('vincent_returns', [])
  );
  useEffect(() => setLS('vincent_returns', returnRequests), [returnRequests]);

  // — settings —
  const [companySettings, setCompanySettings] = useState(() =>
    getLS('vincent_companySettings_v3', DEFAULT_COMPANY_SETTINGS)
  );
  useEffect(() => setLS('vincent_companySettings_v3', companySettings), [companySettings]);

  const [pageSettings, setPageSettings] = useState(() => {
    const saved = getLS<any>('vincent_pageSettings_v5', null);
    if (!saved || !saved.homeSlides || saved.homeSlides.length === 0 || saved.homeSlides.some((s: any) => !s.url || s.url.includes('picsum'))) {
      return { ...DEFAULT_PAGE_SETTINGS, isHeroEnabled: true };
    }
    return {
      ...DEFAULT_PAGE_SETTINGS,
      ...saved,
      homeSlides: mergeHomeSlidesWithDefaults(saved.homeSlides),
      isHeroEnabled: saved.isHeroEnabled ?? true,
      isMiddleSlidesEnabled: saved.isMiddleSlidesEnabled ?? true,
      isBottomSlidesEnabled: saved.isBottomSlidesEnabled ?? true,
      topBarMode: saved.topBarMode ?? DEFAULT_PAGE_SETTINGS.topBarMode,
      topBarMarqueeSpeed: saved.topBarMarqueeSpeed ?? DEFAULT_PAGE_SETTINGS.topBarMarqueeSpeed,
    };
  });
  useEffect(() => setLS('vincent_pageSettings_v5', pageSettings), [pageSettings]);

  useEffect(() => {
    setPageSettings((prev) => {
      const merged = mergeHomeSlidesWithDefaults(prev.homeSlides);
      const prevLen = prev.homeSlides?.length ?? 0;
      if (merged.length === prevLen && merged.every((s, i) => s.id === prev.homeSlides?.[i]?.id)) {
        return prev;
      }
      return { ...prev, homeSlides: merged };
    });
  }, []);

  const [paymentSettings, setPaymentSettings] = useState(() =>
    getLS('paymentSettings', {})
  );
  useEffect(() => setLS('paymentSettings', paymentSettings), [paymentSettings]);

  // — toasts —
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleProductSelect = useCallback((p: any | null) => {
    setSelectedProduct(p);
    if (p) {
      router.push(`/prodotto/${p.id}/${slugify(p.name)}`);
    } else {
      router.push('/');
    }
  }, [router]);

  // Filtra direttamente nella home senza abbandonare la pagina home
  const handleCategorySelect = useCallback((cat: string, sub: string = 'Tutti') => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/prodotto')) {
      router.push('/');
    }
  }, [router]);

  const value: AppContextValue = {
    products, setProducts,
    cart, setCart, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen,
    isAdminOpen, setIsAdminOpen,
    isAuthOpen, setIsAuthOpen,
    isSideMenuOpen, setIsSideMenuOpen,
    selectedProduct, setSelectedProduct,
    selectedCategory, setSelectedCategory,
    selectedSubcategory, setSelectedSubcategory,
    searchQuery, setSearchQuery,
    filteredProducts,
    favorites, toggleFavorite,
    currentUser, setCurrentUser,
    authStep, setAuthStep,
    logout,
    orders, setOrders,
    productReviews, setProductReviews,
    returnRequests, setReturnRequests,
    companySettings, setCompanySettings,
    pageSettings, setPageSettings,
    paymentSettings, setPaymentSettings,
    sortBy, setSortBy,
    selectedBrand, setSelectedBrand,
    isGlobalFiltersExpanded, setIsGlobalFiltersExpanded,
    toasts, addToast, dismissToast,
    adminActiveTab, setAdminActiveTab,
    isDesktop, cartTrigger,
    handleProductSelect,
    handleCategorySelect,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
