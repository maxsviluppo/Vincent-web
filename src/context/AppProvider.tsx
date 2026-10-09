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
import {
  getSupabaseProducts,
  getSupabaseOrders,
  getSupabaseReviews,
  syncProductToSupabase,
  deleteProductFromSupabase,
  createSupabaseOrder,
  createSupabaseReview,
} from '@/lib/supabase';
import { fetchStoreConfig, pushStoreConfig } from '@/lib/store-client';
import { authLogout, authMe } from '@/lib/auth-client';
import { getProductMaxStock } from '@/lib/productVariants';

// ─── Helper: read/write localStorage safely ───────────────────────────────────
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage || typeof window.localStorage.getItem !== 'function') return fallback;
  try {
    let raw = window.localStorage.getItem(key);
    if (raw === null && key.startsWith('vincent_')) {
      raw = window.localStorage.getItem(key.replace(/^vincent_/, 'bespoint_'));
    }
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key: string, value: unknown) {
  if (typeof window === 'undefined' || !window.localStorage || typeof window.localStorage.setItem !== 'function') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
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

  couriers: any[];
  setCouriers: React.Dispatch<React.SetStateAction<any[]>>;

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

  // Supabase sync
  isSupabaseSyncing: boolean;
  syncProductToSupabase: (p: Product) => Promise<boolean>;
  deleteProductFromSupabase: (id: string) => Promise<boolean>;
  createSupabaseOrder: (o: Order) => Promise<boolean>;
  createSupabaseReview: (r: Review) => Promise<boolean>;

  // Navigation helpers
  handleProductSelect: (p: Product | null) => void;
  handleCategorySelect: (cat: string, sub?: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(() => {
    return getLS<Product[]>('vincent_products_v4', []);
  });
  useEffect(() => {
    setLS('vincent_products_v4', products);
  }, [products]);

  // — Supabase Sync State & Remote Hydration —
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(false);

  const handleSyncProduct = useCallback(async (p: Product) => {
    return await syncProductToSupabase(p);
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    return await deleteProductFromSupabase(id);
  }, []);

  const handleCreateOrder = useCallback(async (o: Order) => {
    return await createSupabaseOrder(o);
  }, []);

  const handleCreateReview = useCallback(async (r: Review) => {
    return await createSupabaseReview(r);
  }, []);

  // — auth —
  const [currentUser, setCurrentUser] = useState<any>(() =>
    getLS('vincent_current_user', null)
  );
  useEffect(() => setLS('vincent_current_user', currentUser), [currentUser]);

  const [authStep, setAuthStep] = useState<AppContextValue['authStep']>('email');

  const logout = useCallback(() => {
    void authLogout();
    setCurrentUser(null);
    setLS('vincent_current_user', null);
  }, []);

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

  // — cart —
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTrigger, setCartTrigger] = useState(0);

  const addToCart = useCallback((p: Product) => {
    const passedSize = (p as any).selectedSize || (
      p.category === 'Scarpe' ? '42' : (p.category === 'Jeans' || p.category === 'Pantalone') ? '48' : 'M'
    );
    const passedColor = (p as any).selectedColor || (p.colors && p.colors[0]) || 'Nero';
    const cartItemId = (p as any).cartItemId || `${p.id}__${passedSize}__${passedColor}`;

    const currentProduct = products.find((prod) => prod.id === p.id) || p;
    const maxStock = getProductMaxStock(currentProduct, passedSize, passedColor);

    let limitReached = false;

    setCart((prev) => {
      const existing = prev.find((i) => (i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`) === cartItemId);
      if (existing) {
        if (maxStock > 0 && existing.quantity >= maxStock) {
          limitReached = true;
          return prev;
        }
        return prev.map((i) => {
          if ((i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`) === cartItemId) {
            const nextQty = maxStock > 0 ? Math.min(maxStock, i.quantity + 1) : i.quantity + 1;
            return { ...i, quantity: nextQty };
          }
          return i;
        });
      }
      if (maxStock > 0 && 1 > maxStock) {
        limitReached = true;
        return prev;
      }
      return [
        ...prev,
        {
          ...p,
          quantity: 1,
          selectedSize: passedSize,
          selectedColor: passedColor,
          cartItemId,
        },
      ];
    });

    if (limitReached) {
      addToast(`Disponibilità massima per "${p.name}" raggiunta: massimo ${maxStock} pezzi disponibili!`, 'error');
    } else {
      setCartTrigger((t) => t + 1);
    }
  }, [products, addToast]);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => {
      const currentKey = i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`;
      return currentKey !== id && (i.cartItemId ? true : i.id !== id);
    }));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => {
        const currentKey = i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`;
        return currentKey !== id && (i.cartItemId ? true : i.id !== id);
      }));
    } else {
      let limitHit = false;
      let limitAmount = 0;
      let limitProductName = '';

      setCart((prev) => prev.map((i) => {
        const currentKey = i.cartItemId || `${i.id}__${i.selectedSize}__${i.selectedColor}`;
        if (currentKey === id || (!i.cartItemId && i.id === id)) {
          const currentProduct = products.find((prod) => prod.id === i.id) || i;
          const maxStock = getProductMaxStock(currentProduct, i.selectedSize, i.selectedColor);
          if (maxStock > 0 && qty > maxStock) {
            limitHit = true;
            limitAmount = maxStock;
            limitProductName = i.name;
            return { ...i, quantity: maxStock };
          }
          return { ...i, quantity: qty };
        }
        return i;
      }));

      if (limitHit) {
        addToast(`Disponibilità massima per "${limitProductName}" raggiunta: massimo ${limitAmount} pezzi disponibili!`, 'error');
      }
    }
  }, [products, addToast]);

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
    if (typeof window === 'undefined' || !window.localStorage || typeof window.localStorage.getItem !== 'function') return [];
    try {
      const savedUser =
        window.localStorage.getItem('vincent_current_user') ??
        window.localStorage.getItem('bespoint_current_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const userFavs = window.localStorage.getItem(`vincent_favs_${u.id || u.email}`);
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
  const prevOrdersCount = useRef(orders.length);
  useEffect(() => {
    setLS('vincent_orders', orders);
    if (orders.length > prevOrdersCount.current) {
      const latestOrder = orders[orders.length - 1];
      if (latestOrder && latestOrder.id) {
        createSupabaseOrder(latestOrder);
      }
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  // — reviews —
  const [productReviews, setProductReviews] = useState<Review[]>(() =>
    getLS('vincent_reviews_v2', [])
  );
  const prevReviewsCount = useRef(productReviews.length);
  useEffect(() => {
    setLS('vincent_reviews_v2', productReviews);
    if (productReviews.length > prevReviewsCount.current) {
      const latestReview = productReviews[productReviews.length - 1];
      if (latestReview) {
        createSupabaseReview(latestReview);
      }
    }
    prevReviewsCount.current = productReviews.length;
  }, [productReviews]);

  // — return requests —
  const [returnRequests, setReturnRequests] = useState<any[]>(() =>
    getLS('vincent_returns', [])
  );
  useEffect(() => setLS('vincent_returns', returnRequests), [returnRequests]);

  // — settings —
  const [companySettings, setCompanySettings] = useState(() => {
    const saved = getLS<any>('vincent_companySettings_v3', DEFAULT_COMPANY_SETTINGS);
    const merged = { ...DEFAULT_COMPANY_SETTINGS, ...saved };
    if (!saved?.email || saved.email.toLowerCase().includes('concierge')) {
      merged.email = DEFAULT_COMPANY_SETTINGS.email;
    }
    if (!saved?.orderStatusSenderEmail || saved.orderStatusSenderEmail.toLowerCase().includes('concierge')) {
      merged.orderStatusSenderEmail = DEFAULT_COMPANY_SETTINGS.orderStatusSenderEmail;
    }
    if (!saved?.phone || saved.phone === '+39 02 8901234' || saved.phone.includes('8901234')) {
      merged.phone = DEFAULT_COMPANY_SETTINGS.phone;
    }
    if (!saved?.legalAddress || saved.legalAddress.includes('Monte Napoleone') || saved.legalAddress.includes('Milano')) {
      merged.legalAddress = DEFAULT_COMPANY_SETTINGS.legalAddress;
    }
    if (!saved?.landlinePhone) {
      merged.landlinePhone = DEFAULT_COMPANY_SETTINGS.landlinePhone;
    }
    if (!saved?.vatNumber || saved.vatNumber === '09876543210') {
      merged.vatNumber = DEFAULT_COMPANY_SETTINGS.vatNumber;
    }
    if (!saved?.mission || saved.mission.includes('maschile contemporanea')) {
      merged.mission = DEFAULT_COMPANY_SETTINGS.mission;
    }
    merged.socials = { ...DEFAULT_COMPANY_SETTINGS.socials, ...(saved?.socials || {}) };
    if (!merged.socials.whatsapp) {
      merged.socials.whatsapp = DEFAULT_COMPANY_SETTINGS.socials.whatsapp;
    }
    if (!merged.socials.tiktok || merged.socials.tiktok === 'https://tiktok.com/@vincentstore') {
      merged.socials.tiktok = DEFAULT_COMPANY_SETTINGS.socials.tiktok;
    }
    if (!merged.socials.instagram || merged.socials.instagram.includes('vincentstore_milano')) {
      merged.socials.instagram = DEFAULT_COMPANY_SETTINGS.socials.instagram;
    }
    return merged;
  });
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

  const [couriers, setCouriers] = useState<any[]>(() => getLS('vincent_couriers', []));
  useEffect(() => setLS('vincent_couriers', couriers), [couriers]);

  const storeHydratedRef = useRef(false);
  const storeSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsSupabaseSyncing(true);

    Promise.all([
      getSupabaseProducts(),
      getSupabaseOrders(),
      getSupabaseReviews(),
      fetchStoreConfig(),
      authMe(),
    ])
      .then(([remoteProducts, remoteOrders, remoteReviews, storeConfig, sessionUser]) => {
        if (!mounted) return;
        if (remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts);
          setLS('vincent_products_v4', remoteProducts);
        }
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
          setLS('vincent_orders', remoteOrders);
        }
        if (remoteReviews && remoteReviews.length > 0) {
          setProductReviews(remoteReviews);
          setLS('vincent_reviews_v2', remoteReviews);
        }
        if (storeConfig) {
          if (storeConfig.company_settings && Object.keys(storeConfig.company_settings).length > 0) {
            const cs = { ...storeConfig.company_settings };
            if (!cs.email || cs.email.toLowerCase().includes('concierge')) {
              cs.email = DEFAULT_COMPANY_SETTINGS.email;
            }
            if (!cs.orderStatusSenderEmail || cs.orderStatusSenderEmail.toLowerCase().includes('concierge')) {
              cs.orderStatusSenderEmail = DEFAULT_COMPANY_SETTINGS.orderStatusSenderEmail;
            }
            if (!cs.phone || cs.phone.includes('8901234')) {
              cs.phone = DEFAULT_COMPANY_SETTINGS.phone;
            }
            if (!cs.legalAddress || cs.legalAddress.includes('Monte Napoleone')) {
              cs.legalAddress = DEFAULT_COMPANY_SETTINGS.legalAddress;
            }
            if (!cs.landlinePhone) {
              cs.landlinePhone = DEFAULT_COMPANY_SETTINGS.landlinePhone;
            }
            if (!cs.vatNumber || cs.vatNumber === '09876543210') {
              cs.vatNumber = DEFAULT_COMPANY_SETTINGS.vatNumber;
            }
            if (!cs.mission || cs.mission.includes('maschile contemporanea')) {
              cs.mission = DEFAULT_COMPANY_SETTINGS.mission;
            }
            if (!cs.socials?.whatsapp) {
              cs.socials = { ...(cs.socials || {}), whatsapp: DEFAULT_COMPANY_SETTINGS.socials.whatsapp };
            }
            if (!cs.socials?.tiktok || cs.socials.tiktok === 'https://tiktok.com/@vincentstore') {
              cs.socials = { ...(cs.socials || {}), tiktok: DEFAULT_COMPANY_SETTINGS.socials.tiktok };
            }
            if (!cs.socials?.instagram || cs.socials.instagram.includes('vincentstore_milano')) {
              cs.socials = { ...(cs.socials || {}), instagram: DEFAULT_COMPANY_SETTINGS.socials.instagram };
            }
            setCompanySettings((prev) => ({ ...prev, ...cs }));
          }
          if (storeConfig.page_settings && Object.keys(storeConfig.page_settings).length > 0) {
            setPageSettings((prev) => ({
              ...prev,
              ...storeConfig.page_settings,
              homeSlides: mergeHomeSlidesWithDefaults(
                (storeConfig.page_settings as { homeSlides?: any[] }).homeSlides ?? prev.homeSlides
              ),
            }));
          }
          if (storeConfig.payment_settings && Object.keys(storeConfig.payment_settings).length > 0) {
            setPaymentSettings((prev) => ({ ...prev, ...storeConfig.payment_settings }));
          }
          if (Array.isArray(storeConfig.return_requests) && storeConfig.return_requests.length > 0) {
            setReturnRequests(storeConfig.return_requests);
          }
          if (Array.isArray(storeConfig.couriers) && storeConfig.couriers.length > 0) {
            setCouriers(storeConfig.couriers);
          }
        }
        if (sessionUser) {
          setCurrentUser({ ...sessionUser, name: sessionUser.name || sessionUser.username });
          setLS('vincent_current_user', { ...sessionUser, name: sessionUser.name || sessionUser.username });
        }
        storeHydratedRef.current = true;
        setIsSupabaseSyncing(false);
      })
      .catch((err) => {
        console.warn('[Supabase Sync Warning]:', err);
        storeHydratedRef.current = true;
        if (mounted) setIsSupabaseSyncing(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storeHydratedRef.current) return;
    if (storeSyncTimerRef.current) clearTimeout(storeSyncTimerRef.current);
    storeSyncTimerRef.current = setTimeout(() => {
      void pushStoreConfig({
        company_settings: companySettings,
        page_settings: pageSettings,
        payment_settings: paymentSettings,
        return_requests: returnRequests,
        couriers,
      });
    }, 1200);
    return () => {
      if (storeSyncTimerRef.current) clearTimeout(storeSyncTimerRef.current);
    };
  }, [companySettings, pageSettings, paymentSettings, returnRequests, couriers]);

  const ordersSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!storeHydratedRef.current) return;
    if (ordersSyncTimerRef.current) clearTimeout(ordersSyncTimerRef.current);
    ordersSyncTimerRef.current = setTimeout(() => {
      orders.forEach((o) => {
        void createSupabaseOrder(o);
      });
    }, 1500);
    return () => {
      if (ordersSyncTimerRef.current) clearTimeout(ordersSyncTimerRef.current);
    };
  }, [orders]);


  const handleProductSelect = useCallback((p: Product | null) => {
    setSelectedProduct(p);
    if (typeof window !== 'undefined') {
      if (p) {
        window.history.pushState(
          { productId: p.id, overlay: true },
          '',
          `/prodotto/${p.id}/${slugify(p.name)}`
        );
      } else if (window.location.pathname.startsWith('/prodotto')) {
        window.history.replaceState(null, '', '/');
      }
    }
  }, []);

  // Listen to popstate (browser back / forward button) to sync selectedProduct instantly
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === 'prodotto' && parts[1]) {
        const prod = products.find((x) => x.id === parts[1]);
        if (prod) setSelectedProduct(prod);
      } else {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Filtra direttamente nella home senza abbandonare la pagina home - Comportamento a interruttore (toggle switch)
  const handleCategorySelect = useCallback((cat: string, sub: string = 'Tutti') => {
    setSelectedProduct(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/prodotto')) {
      window.history.replaceState(null, '', '/');
    }

    setSelectedCategory((prev) => {
      // Se si clicca sulla stessa categoria già attiva -> secondo clic la disattiva (torna a 'Tutti')
      if (prev === cat) {
        setSelectedSubcategory('Tutti');
        return 'Tutti';
      }
      // Primo clic -> la attiva
      setSelectedSubcategory(sub);
      return cat;
    });
  }, []);

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
    couriers, setCouriers,
    sortBy, setSortBy,
    selectedBrand, setSelectedBrand,
    isGlobalFiltersExpanded, setIsGlobalFiltersExpanded,
    toasts, addToast, dismissToast,
    adminActiveTab, setAdminActiveTab,
    isDesktop, cartTrigger,
    isSupabaseSyncing,
    syncProductToSupabase: handleSyncProduct,
    deleteProductFromSupabase: handleDeleteProduct,
    createSupabaseOrder: handleCreateOrder,
    createSupabaseReview: handleCreateReview,
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
