import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Star, 
  Plus, 
  Minus, 
  Maximize,
  Shield,
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Home,
  Grid,
  User,
  Heart,
  Check,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Compass,
  Box,
  Share2,
  Play,
  Youtube,
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  Trash,
  Trash2,
  Package,
  FileSpreadsheet,
  Edit2,
  ExternalLink,
  Layers,
  Globe,
  Download,
  ShoppingBag,
  Table,
  FileText,
  FileCode,
  Tag,
  CreditCard,
  Truck,
  ListFilter,
  LayoutGrid,
  BarChart2,
  Users,
  MousePointer2,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  BarChart,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  ClipboardCheck,
  Activity,
  Repeat,
  UserPlus,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  AlertTriangle,
  Zap,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";

import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useSpring } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { PRODUCTS, CATEGORIES, SUBCATEGORIES } from "./data";
import { Product, CartItem } from "./types";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminSingleProduct } from "./AdminSingleProduct";
import { AdminCategoriesSection } from "../components/admin/AdminCategoriesSection";
import { AdminSlidePickerList } from "../components/admin/AdminSlidePickerList";
import { AdminMassiveImport } from "./AdminMassiveImport";
import { AdminImageLinker } from "./AdminImageLinker";
import { AdminOrders, INITIAL_ORDERS } from "./AdminOrders";
import { AdminCouriers } from "./AdminCouriers";
import { AdminReturns } from "./AdminReturns";
import { AdminUsers } from "./AdminUsers";
import { AdminReviews } from "./AdminReviews";
import { useApp } from "@/context/AppProvider";
import {
  authDeleteAccount,
  authLogin,
  authRegister,
  authUpdateProfile,
} from "@/lib/auth-client";

// --- Components ---

export const getProductDisplayPrice = (product: Product) => {
  const basePrice = product.price || 0;
  if (product.variants && product.variants.length > 0) {
    const firstVar = product.variants[0];
    if (firstVar.costType === 'fixed') return firstVar.costValue || basePrice;
    if (firstVar.costType === 'delta') return basePrice + (firstVar.costValue || 0);
    if (firstVar.costType === 'percent') return basePrice * (1 + (firstVar.costValue || 0) / 100);
  }
  return basePrice;
};

const CartSplash = ({ trigger, isMenuHidden, count }: { trigger: number; isMenuHidden: boolean; count: number; key?: any }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger > 0 && isMenuHidden) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, isMenuHidden]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cart-splash-container"
          initial={{ opacity: 0, x: 200 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            transition: { type: "spring", damping: 20, stiffness: 100 }
          }}
          exit={{ 
            opacity: 0, 
            x: 200,
            transition: { duration: 0.3 }
          }}
          className="fixed bottom-6 right-6 z-[100] flex items-center"
        >
          <div className="relative w-16 h-16 bg-brand-blue rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center border-2 border-brand-yellow">
            {/* Stars Animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`splash-star-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 50,
                  y: Math.sin(i * 60 * Math.PI / 180) * 50,
                }}
                transition={{ 
                  duration: 1, 
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Star className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
              </motion.div>
            ))}
            
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              <ShoppingCart className="w-8 h-8 text-brand-yellow fill-brand-yellow" />
            </motion.div>

            {/* Yellow Bubble for Count (Bolla Gialla) */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-1 -right-1 w-7 h-7 bg-neutral-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg"
            >
              {count}
            </motion.div>

            {/* Splash Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-brand-yellow"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void, key?: any }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Activity className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-green-100 shadow-[0_10px_40px_rgba(34,197,94,0.1)]',
    error: 'bg-white border-red-100 shadow-[0_10px_40px_rgba(239,68,68,0.1)]',
    info: 'bg-white border-blue-100 shadow-[0_10px_40px_rgba(59,130,246,0.1)]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`${bgColors[type]} border p-4 rounded-3xl flex items-center gap-4 min-w-[320px] pointer-events-auto backdrop-blur-xl bg-white/90 shadow-2xl`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
        {icons[type]}
      </div>
      <p className="text-[13px] font-bold text-brand-dark flex-1 leading-tight">{message}</p>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose }: { toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[], onClose: (id: string) => void }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm px-6">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => onClose(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const PdfViewerModal = ({ url, title, onClose }: { url: string; title: string; onClose: () => void }) => {
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    if (url && url.startsWith('data:application/pdf')) {
      // Convert DataURL to Blob for better iframe performance/stability
      const fetchBlob = async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const bUrl = URL.createObjectURL(blob);
          setBlobUrl(bUrl);
        } catch (err) {
          console.error("Error creating PDF blob:", err);
          setBlobUrl(url); // Fallback
        }
      };
      fetchBlob();
    } else {
      setBlobUrl(url);
    }

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  return (
    <AnimatePresence>
      {url && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-10 bg-white rounded-[2.5rem] shadow-2xl z-[1001] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">{title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Visualizzazione Documento Sicura</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 relative">
              <iframe 
                src={blobUrl} 
                className="w-full h-full border-none"
                title={title}
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">BesPoint Document Viewer — Protected Content</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function ProductCard({ product, onClick, onAddToCart, index, reviews = [], isFavorite = false, onToggleFavorite, onShare }: { product: Product; onClick: () => void; onAddToCart: (p: Product) => void; index: number; reviews?: any[]; isFavorite?: boolean; onToggleFavorite?: (id: string) => void; onShare?: (p: Product) => void; key?: any }) {
  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const avgRating = productReviews.length > 0 
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length 
    : product.rating;
  const reviewCount = productReviews.length > 0 
    ? productReviews.length + product.reviews 
    : product.reviews;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: [0.21, 1.02, 0.73, 1]
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      layoutId={`product-${product.id}`}
      onClick={onClick}
      className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
    >
        <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0">
          {product.image && (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
              className={`transition-all hover:scale-110 active:scale-90 ${isFavorite ? "text-red-500 drop-shadow-sm" : "text-white/60 hover:text-red-500 drop-shadow-sm"}`}
              title="Aggiungi ai preferiti"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onShare?.(product); }}
              className="text-white/60 hover:text-sky-400 transition-all hover:scale-110 active:scale-90 drop-shadow-sm"
              title="Condividi prodotto"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      {product.brand && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-0.5"
        >
          {product.brand}
        </motion.p>
      )}
      <motion.h3 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 + 0.3 }}
        className="text-sm font-medium text-brand-dark line-clamp-2 mb-1 cursor-pointer hover:text-brand-yellow"
      >
        {product.name}
      </motion.h3>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.4 }}
        className="flex items-center gap-1 mb-2"
      >
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={`card-star-${i}`} className={`w-3 h-3 ${i < Math.floor(avgRating) ? "text-brand-yellow fill-brand-yellow" : "text-gray-200"}`} />
          ))}
        </div>
        <span className="text-[10px] text-blue-600 font-medium">{reviewCount}</span>
      </motion.div>
      <div className="mt-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 + 0.5 }}
          className="flex items-baseline gap-1 mb-3"
        >
          <span className="text-xs font-bold align-top">€</span>
          <span className="text-xl font-bold">{Math.floor(getProductDisplayPrice(product))}</span>
          <span className="text-xs font-bold">{(getProductDisplayPrice(product) % 1).toFixed(2).substring(2)}</span>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.6 }}
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          Aggiungi al carrello
        </motion.button>
      </div>
    </motion.div>
  );
}

function MiniProductCard({ product, onClick, onRemove, index, isCarousel = false }: { product: Product; onClick: () => void; onRemove: (id: string) => void; index: number; isCarousel?: boolean; key?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", damping: 15 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`bg-white p-2.5 rounded-[1.5rem] border border-gray-100 flex flex-col h-full shadow-sm group relative hover:shadow-xl transition-all cursor-pointer ${isCarousel ? 'w-42 flex-shrink-0' : 'w-full'}`}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
        className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-md text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg border border-red-50 hover:bg-red-500 hover:text-white"
      >
        <Heart className="w-3.5 h-3.5 fill-current" />
      </button>
      <div 
        onClick={onClick}
        className="w-full aspect-square mb-3 cursor-pointer overflow-hidden rounded-[1.2rem] bg-gray-50 border border-gray-50/50 flex-shrink-0"
      >
        {product.image && (
          <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
        )}
      </div>
      <div className="px-1 mb-2">
        <h4 className="text-[10px] font-black text-brand-dark line-clamp-2 leading-tight uppercase tracking-tight mb-1 cursor-pointer hover:text-brand-yellow transition-colors" onClick={onClick}>{product.name}</h4>
        <p className="text-sm font-black text-brand-blue italic">€{getProductDisplayPrice(product).toFixed(2)}</p>
      </div>
      <button 
        onClick={onClick}
        className="mt-auto w-full py-2 bg-gray-50 hover:bg-brand-yellow rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-all"
      >
        Scopri
      </button>
    </motion.div>
  );
}

const ProductSheet = ({ product, onClose, onAddToCart, isDesktop, reviews = [], favorites = [], toggleFavorite, onShare, onSelectProduct, allProducts = [] }: { product: Product; onClose: () => void; onAddToCart: (p: Product) => void; isDesktop: boolean; reviews?: any[]; favorites?: string[]; toggleFavorite?: (id: string) => void; onShare?: (p: Product) => void; onSelectProduct?: (p: Product) => void; allProducts?: Product[]; key?: any }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    // Auto-seleziona la prima opzione per ogni tipo
    const initial: Record<string, string> = {};
    product.variants?.forEach(v => {
      if (!initial[v.type]) initial[v.type] = v.value;
    });
    return initial;
  });
  const [activeImage, setActiveImage] = useState(product.image);
  const isFavorite = favorites.includes(product.id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // PDF Viewer State
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  // Gestione swipe verso il basso dalla cornice per chiudere
  const [corniceTouchStartY, setCorniceTouchStartY] = useState<number | null>(null);
  const [corniceDragOffset, setCorniceDragOffset] = useState<number>(0);

  const handleCorniceTouchStart = (e: React.TouchEvent) => {
    setCorniceTouchStartY(e.touches[0].clientY);
  };

  const handleCorniceTouchMove = (e: React.TouchEvent) => {
    if (corniceTouchStartY === null) return;
    const diff = e.touches[0].clientY - corniceTouchStartY;
    if (diff > 0) {
      setCorniceDragOffset(diff);
      if (diff > 50) {
        setCorniceTouchStartY(null);
        setCorniceDragOffset(0);
        onClose();
      }
    }
  };

  const handleCorniceTouchEnd = () => {
    if (corniceDragOffset > 30) {
      onClose();
    }
    setCorniceTouchStartY(null);
    setCorniceDragOffset(0);
  };

  const approvedReviews = reviews.filter(rev => rev.productId === product.id && rev.status === 'approved');
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : (product.rating || 0);
  const reviewCount = approvedReviews.length > 0
    ? approvedReviews.length + (product.reviews || 0)
    : (product.reviews || 0);

  const variantsByType = useMemo(() => {
    const groups: Record<string, any[]> = {};
    product.variants?.forEach(v => {
      if (!groups[v.type]) groups[v.type] = [];
      if (!groups[v.type].some(item => item.value === v.value)) {
        groups[v.type].push(v);
      }
    });
    return groups;
  }, [product.variants]);

  const selectedVariantObject = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    // For simplicity with current flat structure, we find the one matching the first selected value
    // In a multi-dim system, we'd match all selected types.
    const firstType = Object.keys(variantsByType)[0];
    if (!firstType || !selectedVariants[firstType]) return null;
    return product.variants.find(v => v.type === firstType && v.value === selectedVariants[firstType]) || null;
  }, [product.variants, selectedVariants, variantsByType]);

  useEffect(() => {
    if (selectedVariantObject?.image) {
      setActiveImage(selectedVariantObject.image);
    } else {
      setActiveImage(product.image);
    }
  }, [selectedVariantObject, product.image]);

  const displayPrice = useMemo(() => {
    const basePrice = product.price || 0;
    if (selectedVariantObject) {
      if (selectedVariantObject.costType === 'fixed') return selectedVariantObject.costValue || basePrice;
      if (selectedVariantObject.costType === 'delta') return basePrice + (selectedVariantObject.costValue || 0);
      if (selectedVariantObject.costType === 'percent') return basePrice * (1 + (selectedVariantObject.costValue || 0) / 100);
    }
    return basePrice;
  }, [product, selectedVariantObject]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth * 0.8;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const relatedProducts = useMemo(() => {
    // If we have manual related products, show them
    if (product.relatedProductIds && product.relatedProductIds.length > 0) {
      return allProducts.filter(p => product.relatedProductIds?.includes(p.id));
    }
    // Default fallback: items from the same category
    const pool = allProducts.length > 0 ? allProducts : PRODUCTS;
    return pool.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);
  }, [product, allProducts]);

  return (
    <>
      {/* Sfondo scuro semitrasparente */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] transition-opacity"
      />
      {/* Box modale perfettamente centrato sia su desktop che su mobile */}
      <div 
        style={{
          transform: corniceDragOffset > 0 ? `translateY(${corniceDragOffset}px)` : undefined,
          transition: corniceDragOffset === 0 ? 'transform 0.25s ease-out' : 'none'
        }}
        className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto z-[100] bg-white rounded-t-[28px] md:rounded-[36px] shadow-2xl flex flex-col h-[90vh] md:h-[85vh] w-full md:w-[90vw] md:max-w-5xl lg:max-w-6xl overflow-hidden transition-all duration-300 ease-out"
      >
        {/* Maniglia trascinamento per mobile */}
        <div 
          onTouchStart={handleCorniceTouchStart}
          onTouchMove={handleCorniceTouchMove}
          onTouchEnd={handleCorniceTouchEnd}
          onClick={onClose}
          className="w-full pt-3 pb-2.5 flex-shrink-0 cursor-grab active:cursor-grabbing flex flex-col items-center justify-center touch-none select-none hover:bg-neutral-50 transition-colors"
          title="Trascina verso il basso per chiudere"
          aria-label="Chiudi finestra dettaglio"
        >
          <div className="w-14 h-1.5 bg-neutral-300 hover:bg-neutral-400 rounded-full transition-colors shadow-sm" />
          <span className="text-[9px] uppercase tracking-widest text-neutral-400 mt-1 font-light">
            Trascina verso il basso per chiudere
          </span>
        </div>

        {/* Pulsante chiusura rimosso per design minimale */}
        
        <div className="overflow-y-auto pb-32 px-6 lg:p-10 flex-1">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            
            {/* COLUMN 1: PHOTOS (5/12) */}
            <div className="lg:col-span-5 lg:sticky lg:top-0">
              {/* Main Image & Gallery */}
              <div 
                className="relative aspect-square rounded-3xl overflow-hidden mb-4 bg-gray-50 border border-gray-100 cursor-pointer group"
                onClick={() => setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0 }}
                    src={activeImage || undefined} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Maximize className="w-6 h-6 text-brand-dark" />
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite?.(product.id); }}
                    className={`transition-all hover:scale-110 active:scale-90 ${isFavorite ? "text-red-500 drop-shadow-md" : "text-white/70 hover:text-red-500 drop-shadow-md"}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onShare?.(product); }}
                    className="text-white/70 hover:text-sky-400 transition-all hover:scale-110 active:scale-90 drop-shadow-md"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails con scroll */}
              <div className="relative mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
                  {/* Prima immagine (principale) */}
                  <button
                    onClick={() => setActiveImage(product.image)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === product.image ? "border-brand-yellow" : "border-transparent hover:border-gray-300"}`}
                  >
                    {product.image && (
                      <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </button>
                  {/* Galleria: escludi la prima immagine se già mostrata sopra */}
                  {(product?.gallery || []).filter(img => img !== product.image).map((img, idx) => (
                    <button
                      key={`gallery-${idx}`}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img ? "border-brand-yellow" : "border-transparent hover:border-gray-300"}`}
                    >
                      {img && (
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </button>
                  ))}
                  {product.has3D && (
                    <button className="w-16 h-16 rounded-xl bg-brand-blue flex flex-col items-center justify-center text-white flex-shrink-0 group hover:bg-black hover:text-white transition-colors">
                      <Box className="w-6 h-6 mb-1" />
                      <span className="text-[8px] font-bold uppercase">3D View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: DESCRIPTION & TECH SPECS (4/12) */}
            <div className="lg:col-span-4 space-y-10">
              {/* Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-brand-yellow uppercase tracking-widest">{product.category}</p>
                  {product.brand && product.showBrand && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <p className="text-xs font-black text-brand-blue uppercase tracking-widest">{product.brand}</p>
                    </>
                  )}
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-brand-dark leading-tight">
                  {(selectedVariantObject && selectedVariantObject.title) ? selectedVariantObject.title : product.name}
                </h2>
                {selectedVariantObject?.note && (
                  <div className="mt-3 p-3 bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-brand-orange tracking-wider">NOTA</p>
                    <p className="text-xs font-bold text-brand-dark mt-0.5">{selectedVariantObject.note}</p>
                  </div>
                )}
                {/* Peso nascosto lato utente */}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Descrizione</h4>
                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                  <div 
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                    className="rich-content"
                  />
                </div>
              </div>

              {/* Technical Specs */}
              <div className="space-y-6">
                <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Caratteristiche</h4>
                <div className="grid grid-cols-2 gap-3">
                  {((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || 
                    (!selectedVariantObject && product.showEan && product.ean)) && (
                    <div className="bg-brand-blue text-white p-3 rounded-2xl border border-brand-blue shadow-lg shadow-brand-blue/10">
                      <p className="text-[9px] text-white/60 uppercase font-black mb-0.5">Codice EAN</p>
                      <p className="text-xs font-black tracking-widest">{selectedVariantObject?.ean || product.ean}</p>
                    </div>
                  )}
                  {Object.entries(product?.specs || {}).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-black mb-0.5">{key}</p>
                      <p className="text-xs font-bold text-brand-dark">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Energy Label Preview */}
              {product.energyLabel && (
                <div className="space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-yellow fill-brand-yellow" /> Efficienza Energetica
                  </h4>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    {product.energyLabel.startsWith('data:application/pdf') ? (
                      <button 
                        onClick={() => setActivePdf({ url: product.energyLabel!, title: "Etichetta Energetica" })}
                        className="w-full flex items-center justify-between p-4 bg-brand-yellow/10 hover:bg-brand-yellow/20 border border-brand-yellow/20 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <FileText className="w-5 h-5 text-brand-yellow" />
                          </div>
                          <span className="text-xs font-black text-brand-dark uppercase tracking-tight">Apri Etichetta Energetica (PDF)</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-brand-yellow group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <img src={product.energyLabel} alt="Energy Label" className="w-full h-auto rounded-lg" />
                    )}
                  </div>
                </div>
              )}

              {/* Document Download Links */}
              {(product.techSheet || product.manual) && (
                <div className="space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Documentazione</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {product.techSheet && (
                      <button 
                        onClick={() => setActivePdf({ url: product.techSheet!, title: "Scheda Tecnica" })}
                        className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-xs font-black text-indigo-900 uppercase tracking-tight">Scarica Scheda Tecnica</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                    {product.manual && (
                      <button 
                        onClick={() => setActivePdf({ url: product.manual!, title: "Manuale d'Uso" })}
                        className="flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Compass className="w-5 h-5 text-teal-600" />
                          </div>
                          <span className="text-xs font-black text-teal-900 uppercase tracking-tight">Manuale d'Uso (PDF)</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Video Tutorial */}
              {product.videoUrl && (
                <div className="space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Video Tutorial</h4>
                  <a 
                    href={product.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative block aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${product.videoUrl.includes('v=') ? product.videoUrl.split('v=')[1].split('&')[0] : product.videoUrl.split('/').pop()}/maxresdefault.jpg`} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-brand-dark fill-brand-dark ml-0.5" />
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* COLUMN 3: PRICE & REVIEWS (3/12) */}
            <div className="lg:col-span-3 lg:bg-gray-50/50 lg:p-8 lg:rounded-[32px] lg:border lg:border-gray-100 space-y-8">
              {/* Pricing Card */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  {/* Prezzo originale barrato + badge sconto inline */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">€{((displayPrice || 0) * 1.2).toFixed(2)}</span>
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">-20% OGGI</span>
                  </div>
                  {/* Prezzo scontato grande */}
                  <span className="text-4xl font-black text-brand-blue leading-none">€{(displayPrice || 0).toFixed(2)}</span>
                </div>

                {/* SKU Info */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU:</span>
                  <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">{selectedVariantObject?.sku || product.sku || 'N/A'}</span>
                </div>
                
                {/* Variant Selection UI */}
                {Object.entries(variantsByType).map(([type, options]) => (
                  <div key={type} className="space-y-3 pt-2">
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-brand-dark flex items-center gap-2">
                      {type} 
                      {selectedVariants[type] && <span className="text-brand-blue">— {selectedVariants[type]}</span>}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [type]: opt.value })}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all border-2 ${
                            selectedVariants[type] === opt.value
                              ? "border-brand-yellow bg-brand-yellow/5 text-brand-dark shadow-lg shadow-brand-yellow/10"
                              : "border-gray-100 hover:border-gray-200 text-gray-400"
                          }`}
                        >
                          {opt.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {(() => {
                  const isAvailable = selectedVariantObject 
                    ? (selectedVariantObject.webStock > 0)
                    : ((product.stock ?? 0) > 0);
                  
                  return isAvailable ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                      <Shield className="w-4 h-4 text-green-500 animate-pulse" />
                      <span>Disponibile</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                      <X className="w-4 h-4 text-red-500" />
                      <span>Non disponibile</span>
                    </div>
                  );
                })()}
              </div>

              {/* Recensioni disattivate */}
            </div>
          </div>

          {/* Related Products Carousel (Full Width) */}
          <div className="mt-20 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Potrebbe interessarti anche</h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-dark hover:bg-brand-yellow transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-dark hover:bg-brand-yellow transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x snap-mandatory scroll-smooth"
            >
              {relatedProducts.map((p, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  key={p.id} 
                  onClick={() => onSelectProduct?.(p)}
                  className="flex-shrink-0 w-44 lg:w-56 snap-start bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                    {p.image && (
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-brand-dark line-clamp-2 h-10">{p.name}</h5>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-black text-brand-blue">€{getProductDisplayPrice(p).toFixed(2)}</p>
                    
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar (Optimized for both) */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 sm:p-6 lg:px-12 flex items-center justify-between gap-3 sm:gap-6 z-20">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 active:scale-90 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 lg:w-14 text-center font-black text-lg">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end flex-1 pr-6 border-r border-gray-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Totale</span>
              <span className="text-2xl font-black text-brand-blue">€{(displayPrice * quantity).toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => {
                const itemToAddToCart = {
                  ...product,
                  price: displayPrice,
                  sku: selectedVariantObject?.sku || product.sku,
                  name: selectedVariantObject ? `${product.name} - ${selectedVariantObject.value}` : product.name
                };
                for(let i=0; i<quantity; i++) onAddToCart(itemToAddToCart);
                onClose();
              }}
              className="flex-[2] bg-neutral-950 hover:bg-neutral-800 text-white h-14 lg:h-16 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all uppercase text-sm tracking-widest shadow-xl shadow-brand-yellow/20"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Aggiungi al carrello</span>
            </button>
            
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="hidden lg:flex w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-2xl items-center justify-center transition-all active:scale-90 z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-6 right-6 flex gap-4">
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-2xl"
            >
              {activeImage && (
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain bg-black"
                  referrerPolicy="no-referrer"
                />
              )}
            </motion.div>
            
            <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar max-w-full px-4">
              {[product.image, ...product.gallery].map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img ? "border-brand-yellow" : "border-white/20"}`}
                >
                  {img && (
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal Integrated */}
      <PdfViewerModal 
        url={activePdf?.url || ""} 
        title={activePdf?.title || ""} 
        onClose={() => setActivePdf(null)} 
      />
    </>
  );
};

const ITALIAN_PROVINCES = [
  { code: 'AG', name: 'Agrigento' }, { code: 'AL', name: 'Alessandria' }, { code: 'AN', name: 'Ancona' },
  { code: 'AO', name: 'Aosta' }, { code: 'AR', name: 'Arezzo' }, { code: 'AP', name: 'Ascoli Piceno' },
  { code: 'AT', name: 'Asti' }, { code: 'AV', name: 'Avellino' }, { code: 'BA', name: 'Bari' },
  { code: 'BT', name: 'Barletta-Andria-Trani' }, { code: 'BL', name: 'Belluno' }, { code: 'BN', name: 'Benevento' },
  { code: 'BG', name: 'Bergamo' }, { code: 'BI', name: 'Biella' }, { code: 'BO', name: 'Bologna' },
  { code: 'BZ', name: 'Bolzano' }, { code: 'BS', name: 'Brescia' }, { code: 'BR', name: 'Brindisi' },
  { code: 'CA', name: 'Cagliari' }, { code: 'CL', name: 'Caltanissetta' }, { code: 'CB', name: 'Campobasso' },
  { code: 'CI', name: 'Carbonia-Iglesias' }, { code: 'CE', name: 'Caserta' }, { code: 'CT', name: 'Catania' },
  { code: 'CZ', name: 'Catanzaro' }, { code: 'CH', name: 'Chieti' }, { code: 'CO', name: 'Como' },
  { code: 'CS', name: 'Cosenza' }, { code: 'CR', name: 'Cremona' }, { code: 'KR', name: 'Crotone' },
  { code: 'CN', name: 'Cuneo' }, { code: 'EN', name: 'Enna' }, { code: 'FM', name: 'Fermo' },
  { code: 'FE', name: 'Ferrara' }, { code: 'FI', name: 'Firenze' }, { code: 'FG', name: 'Foggia' },
  { code: 'FC', name: 'Forlì-Cesena' }, { code: 'FR', name: 'Frosinone' }, { code: 'GE', name: 'Genova' },
  { code: 'GO', name: 'Gorizia' }, { code: 'GR', name: 'Grosseto' }, { code: 'IM', name: 'Imperia' },
  { code: 'IS', name: 'Isernia' }, { code: 'SP', name: 'La Spezia' }, { code: 'AQ', name: 'L\'Aquila' },
  { code: 'LT', name: 'Latina' }, { code: 'LE', name: 'Lecce' }, { code: 'LC', name: 'Lecco' },
  { code: 'LI', name: 'Livorno' }, { code: 'LO', name: 'Lodi' }, { code: 'LU', name: 'Lucca' },
  { code: 'MC', name: 'Macerata' }, { code: 'MN', name: 'Mantova' }, { code: 'MS', name: 'Massa-Carrara' },
  { code: 'MT', name: 'Matera' }, { code: 'VS', name: 'Medio Campidano' }, { code: 'ME', name: 'Messina' },
  { code: 'MI', name: 'Milano' }, { code: 'MO', name: 'Modena' }, { code: 'MB', name: 'Monza e della Brianza' },
  { code: 'NA', name: 'Napoli' }, { code: 'NO', name: 'Novara' }, { code: 'NU', name: 'Nuoro' },
  { code: 'OG', name: 'Ogliastra' }, { code: 'OT', name: 'Olbia-Tempio' }, { code: 'OR', name: 'Oristano' },
  { code: 'PD', name: 'Padova' }, { code: 'PA', name: 'Palermo' }, { code: 'PR', name: 'Parma' },
  { code: 'PV', name: 'Pavia' }, { code: 'PG', name: 'Perugia' }, { code: 'PU', name: 'Pesaro e Urbino' },
  { code: 'PE', name: 'Pescara' }, { code: 'PC', name: 'Piacenza' }, { code: 'PI', name: 'Pisa' },
  { code: 'PT', name: 'Pistoia' }, { code: 'PN', name: 'Pordenone' }, { code: 'PZ', name: 'Potenza' },
  { code: 'PO', name: 'Prato' }, { code: 'RG', name: 'Ragusa' }, { code: 'RA', name: 'Ravenna' },
  { code: 'RC', name: 'Reggio Calabria' }, { code: 'RE', name: 'Reggio Emilia' }, { code: 'RI', name: 'Rieti' },
  { code: 'RN', name: 'Rimini' }, { code: 'RM', name: 'Roma' }, { code: 'RO', name: 'Rovigo' },
  { code: 'SA', name: 'Salerno' }, { code: 'SS', name: 'Sassari' }, { code: 'SV', name: 'Savona' },
  { code: 'SI', name: 'Siena' }, { code: 'SR', name: 'Siracusa' }, { code: 'SO', name: 'Sondrio' },
  { code: 'TA', name: 'Taranto' }, { code: 'TE', name: 'Teramo' }, { code: 'TR', name: 'Terni' },
  { code: 'TO', name: 'Torino' }, { code: 'TP', name: 'Trapani' }, { code: 'TN', name: 'Trento' },
  { code: 'TV', name: 'Treviso' }, { code: 'TS', name: 'Trieste' }, { code: 'UD', name: 'Udine' },
  { code: 'VA', name: 'Varese' }, { code: 'VE', name: 'Venezia' }, { code: 'VB', name: 'Verbano-Cusio-Ossola' },
  { code: 'VC', name: 'Vercelli' }, { code: 'VR', name: 'Verona' }, { code: 'VV', name: 'Vibo Valentia' },
  { code: 'VI', name: 'Vicenza' }, { code: 'VT', name: 'Viterbo' }
];

const PREDEFINED_CITIES = [
  "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", 
  "Venezia", "Verona", "Messina", "Padova", "Trieste", "Taranto", "Brescia", "Parma", "Prato", "Modena", 
  "Reggio Calabria", "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia", "Rimini", 
  "Salerno", "Ferrara"
].sort();

const CheckoutSheet = ({ 
  items, 
  onClose, 
  settings, 
  currentUser,
  onAuthOpen,
  appOrders,
  setAppOrders,
  setCart,
  companySettings,
  addToast,
  comuniList,
  setCurrentUser
}: { 
  items: CartItem[]; 
  onClose: () => void; 
  settings: any;
  currentUser: any;
  onAuthOpen: () => void;
  appOrders: any[];
  setAppOrders: (orders: any[]) => void;
  setCart: (cart: any[]) => void;
  companySettings: any;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  comuniList: any[];
  setCurrentUser: (user: any) => void;
}) => {
  const [shippingForm, setShippingForm] = useState({
    name: currentUser?.name || '',
    street: currentUser?.addressStreet || '',
    city: currentUser?.addressCity || '',
    zip: currentUser?.addressZip || '',
    province: currentUser?.addressProvince || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    notes: '',
    isCustomCity: false
  });

  const uniqueProvinces = useMemo(() => {
    const provincesMap = new Map<string, string>();
    comuniList.forEach(c => {
      if (c.provincia?.nome) {
        provincesMap.set(c.provincia.nome, c.sigla);
      }
    });
    return Array.from(provincesMap.entries()).map(([nome, sigla]) => ({ nome, sigla })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [comuniList]);

  const filteredCities = useMemo(() => {
    if (!shippingForm.province) return [];
    return comuniList
      .filter(c => c.sigla === shippingForm.province || c.provincia?.nome === shippingForm.province)
      .map(c => c.nome)
      .sort((a, b) => a.localeCompare(b));
  }, [shippingForm.province, comuniList]);

  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [orderId] = useState(() => `BP-${new Date().getFullYear()}-${Math.floor(Math.random() * 899 + 100)}`);

  const [step, setStep] = useState<'shipping' | 'methods' | 'details' | 'success'>(
    (currentUser?.addressStreet && currentUser?.addressCity) ? 'methods' : 'shipping'
  );
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (currentUser) {
      const getProvinceName = (val: string) => {
        if (!val) return '';
        if (val.length === 2) {
          const match = comuniList.find(c => c.sigla === val.toUpperCase());
          return match?.provincia?.nome || val;
        }
        return val;
      };

      if (useProfileAddress) {
        setShippingForm(prev => ({
          ...prev,
          name: currentUser.name || prev.name,
          email: currentUser.email || prev.email,
          phone: currentUser.phone || prev.phone,
          street: currentUser.addressStreet || prev.street,
          city: currentUser.addressCity || prev.city,
          zip: currentUser.addressZip || prev.zip,
          province: getProvinceName(currentUser.addressProvince || prev.province),
          isCustomCity: currentUser.addressCity && !PREDEFINED_CITIES.includes(currentUser.addressCity)
        }));
      } else {
        setShippingForm(prev => ({
          ...prev,
          name: currentUser.shippingName || prev.name || '',
          email: currentUser.email || prev.email || '',
          phone: currentUser.shippingPhone || prev.phone || '',
          street: currentUser.shippingStreet || prev.street || '',
          city: currentUser.shippingCity || prev.city || '',
          zip: currentUser.shippingZip || prev.zip || '',
          province: getProvinceName(currentUser.shippingProvince || prev.province || ''),
          isCustomCity: currentUser.shippingCity && !PREDEFINED_CITIES.includes(currentUser.shippingCity)
        }));
      }
    }
  }, [currentUser, useProfileAddress, comuniList]);

  // Run auto-advance only once when component mounts or step changes initially if profile is ready
  useEffect(() => {
    if (currentUser && currentUser.addressStreet && currentUser.addressCity && step === 'shipping') {
      setStep('methods');
      addToast("Bentornato! Abbiamo pre-compilato i tuoi dati di spedizione.", "success");
    }
  }, [currentUser]);

  const handleConfirmOrder = () => {
    if (!currentUser) {
      onAuthOpen();
      return;
    }
    
    setIsProcessing(true);
    
    // Aggiorna e memorizza i dati del cliente nella scheda
    let updatedUser = { ...currentUser };
    if (useProfileAddress) {
      updatedUser = {
        ...updatedUser,
        name: shippingForm.name || currentUser.name,
        phone: shippingForm.phone || currentUser.phone,
        addressStreet: shippingForm.street,
        addressCity: shippingForm.city,
        addressZip: shippingForm.zip,
        addressProvince: shippingForm.province
      };
    } else {
      updatedUser = {
        ...updatedUser,
        shippingName: shippingForm.name,
        shippingPhone: shippingForm.phone,
        shippingStreet: shippingForm.street,
        shippingCity: shippingForm.city,
        shippingZip: shippingForm.zip,
        shippingProvince: shippingForm.province
      };
    }
    
    setCurrentUser(updatedUser);
    localStorage.setItem('vincent_current_user', JSON.stringify(updatedUser));
    
    try {
      const users = JSON.parse(localStorage.getItem('vincent_users') || '[]');
      const updatedUsers = users.map((u: any) => u.email === updatedUser.email ? updatedUser : u);
      localStorage.setItem('vincent_users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error("Error saving users to mock db:", e);
    }

    // Simula tempo di transazione
    setTimeout(() => {
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
        customer: shippingForm.name || currentUser?.name || "Cliente Registrato",
        email: shippingForm.email || currentUser?.email || "guest@vincentstore.it",
        phone: shippingForm.phone,
        channel: 'website',
        total: total,
        status: 'pending',
        itemsCount: items.length,
        address: `${shippingForm.street}, ${shippingForm.city} (${shippingForm.province}) - CAP ${shippingForm.zip}`,
        notes: shippingForm.notes,
        payment: selectedMethod === 'stripe' ? 'Carta di Credito (Stripe)' : 
                 selectedMethod === 'paypal' ? 'PayPal' : 
                 selectedMethod === 'cod' ? 'Contrassegno' : 'Bonifico Bancario',
        paymentType: selectedMethod, // Helps in filtering
        items: items.map(item => ({ 
          id: item.id, 
          name: item.name, 
          qty: item.quantity, 
          price: item.price, 
          image: item.image 
        }))
      };

      setAppOrders([newOrder, ...appOrders]);
      setCart([]);
      setIsProcessing(false);
      setStep('success');
    }, 1500);
  };
  const handlePrintProforma = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const methodLabel = selectedMethod === 'stripe' ? 'Carta di Credito / GPay' 
      : selectedMethod === 'paypal' ? 'PayPal' 
      : selectedMethod === 'bank' ? 'Bonifico Bancario' 
      : 'Contrassegno';

    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
          ${item.image ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:contain;border-radius:4px;border:1px solid #eee;" />` : ''}
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
          <strong style="font-size:12px;color:#0a0a0a;">${item.name}</strong>
          <div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">SKU-${item.id.padStart(4,'0')}</div>
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;">&euro;${item.price.toFixed(2)}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;">
          <span style="background:#f5f5f5;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:900;">${item.quantity}</span>
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:900;font-size:12px;">&euro;${(item.price*item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const bankHTML = selectedMethod === 'bank' ? `
      <div style="background:#fffde7;border:1px solid #ffd600;border-radius:8px;padding:12px;margin-top:16px;">
        <div style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;">Dati per il Bonifico</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:8px;color:#aaa;text-transform:uppercase;">Beneficiario</div><strong style="font-size:12px;">${settings.bankOwner || 'BESPOINT S.R.L.'}</strong></div>
          <div><div style="font-size:8px;color:#aaa;text-transform:uppercase;">IBAN</div><strong style="font-size:12px;letter-spacing:1px;">${settings.bankIban || '—'}</strong></div>
        </div>
      </div>` : selectedMethod === 'cod' ? `
      <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:12px;margin-top:16px;">
        <div style="font-size:10px;font-weight:700;color:#b45309;">${settings.codNote || 'Pagamento in contanti direttamente al corriere alla consegna.'}</div>
      </div>` : '';

    const logoHTML = companySettings.imageLogo 
      ? `<img src="${companySettings.imageLogo}" style="height:60px;object-fit:contain;" referrerpolicy="no-referrer" />`
      : `<div style="width:52px;height:52px;background:#ffd600;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;font-style:italic;">${companySettings.logo}</div>`;

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Proforma Ordine — ${companySettings.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:'Inter',sans-serif;background:white;color:#0a0a0a;padding:24px 32px; }
    table { width:100%;border-collapse:collapse; }
    @media print {
      @page { size:A4 portrait;margin:12mm 14mm; }
      body { padding:0; }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:3px solid #ffd600;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:14px;">
      ${logoHTML}
      <div>
        <div style="font-weight:900;font-size:18px;text-transform:uppercase;letter-spacing:-0.5px;">${companySettings.name}</div>
        <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">${companySettings.legalName || ''}</div>
      </div>
    </div>
      <div style="text-align:right;">
      <div style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;">PROFORMA</div>
      <div style="font-size:12px;font-weight:900;color:#2563eb;">#${orderId}</div>
      <div style="font-size:9px;color:#888;text-transform:uppercase;">${new Date().toLocaleDateString('it-IT', {day:'2-digit',month:'long',year:'numeric'})}</div>
    </div>
  </div>

  <!-- ANAGRAFICA + SPEDIZIONE -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px;">
      <div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;">Cliente</div>
      <div style="font-weight:900;font-size:13px;">${shippingForm.name}</div>
      <div style="font-size:10px;color:#555;margin-top:2px;">${shippingForm.email}</div>
      <div style="font-size:10px;color:#2563eb;font-weight:700;">${shippingForm.phone}</div>
    </div>
    <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px;">
      <div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;">Destinazione merce</div>
      <div style="font-weight:700;font-size:12px;">${shippingForm.street}</div>
      <div style="font-size:10px;color:#555;">${shippingForm.zip} ${shippingForm.city} (${shippingForm.province})</div>
      ${shippingForm.notes ? `<div style="font-size:9px;color:#ca8a04;margin-top:4px;font-weight:700;">NOTE: ${shippingForm.notes}</div>` : ''}
    </div>
  </div>

  <!-- PAGAMENTO -->
  <div style="background:#0a0a0a;color:white;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <div>
      <div style="font-size:8px;color:#888;text-transform:uppercase;letter-spacing:1px;">Metodo di Pagamento</div>
      <div style="font-weight:900;font-size:13px;color:#ffd600;">${methodLabel}</div>
    </div>
    <div style="font-size:9px;border:1px solid rgba(255,214,0,0.3);background:rgba(255,214,0,0.1);color:#ffd600;padding:3px 10px;border-radius:99px;font-weight:900;text-transform:uppercase;">In attesa</div>
  </div>

  <!-- PRODOTTI -->
  <table>
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:8px 4px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:44px;"></th>
        <th style="padding:8px 4px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:left;">Articolo</th>
        <th style="padding:8px 4px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Prezzo</th>
        <th style="padding:8px 4px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Qt</th>
        <th style="padding:8px 4px;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:right;">Totale</th>
      </tr>
    </thead>
    <tbody>${itemsHTML}</tbody>
  </table>

  <!-- TOTALI -->
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-top:16px;padding-top:12px;border-top:2px solid #f0f0f0;">
    <div style="display:flex;justify-content:space-between;width:200px;font-size:10px;color:#888;">
      <span>Imponibile</span><span style="color:#0a0a0a;font-weight:700;">&euro;${(total / 1.22).toFixed(2)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;width:200px;font-size:10px;color:#888;">
      <span>IVA (22% Inclusa)</span><span style="color:#0a0a0a;font-weight:700;">&euro;${(total - (total / 1.22)).toFixed(2)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;width:200px;font-size:10px;color:#16a34a;font-weight:700;">
      <span>Spedizione</span><span>&euro;0,00</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;width:220px;background:#ffd600;padding:10px 16px;border-radius:10px;margin-top:4px;">
      <span style="font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Totale Ordine</span>
      <span style="font-weight:900;font-size:18px;">&euro;${total.toFixed(2)}</span>
    </div>
  </div>

  ${bankHTML}

  <!-- FOOTER -->
  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #eee;font-size:8px;color:#aaa;text-align:center;">
    Documento proforma generato automaticamente da ${companySettings.name}. Non costituisce fattura fiscale.
    La fattura elettronica sarà emessa e trasmessa tramite SDI al momento della spedizione.
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  if (step === 'success') {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
        >
          <div className="bg-white rounded-[3rem] p-12 text-center max-w-sm shadow-2xl space-y-6 pointer-events-auto">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
              <Check className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Ordine Ricevuto!</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Grazie per aver scelto BesPoint</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400">ID Ordine Web</p>
              <p className="text-lg font-black text-brand-dark">{orderId}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-neutral-950 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Torna alla Home
            </button>
          </div>
        </motion.div>
      </>
    );
  }
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[40px] z-[101] shadow-2xl flex flex-col lg:inset-y-0 lg:right-0 lg:left-auto lg:w-full lg:max-w-2xl lg:rounded-none"
      >
        <div className="p-8 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Checkout</h2>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest">{items.length} articoli • Totale €{total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Checkout Stepper */}
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between relative overflow-hidden bg-gray-50/30">
          <div className="absolute top-[38px] left-16 right-16 h-1 bg-gray-100 rounded-full">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: step === 'shipping' ? '0%' : step === 'methods' ? '50%' : '100%' }}
               className="h-full bg-brand-yellow rounded-full shadow-[0_0_10px_rgba(255,214,0,0.4)]"
            />
          </div>
          
          {[
            { id: 1, label: 'Spedizione', s: 'shipping' },
            { id: 2, label: 'Pagamento', s: 'methods' },
            { id: 3, label: 'Conferma', s: 'details' }
          ].map((s, idx) => {
            const currentStepNum = step === 'shipping' ? 1 : step === 'methods' ? 2 : 3;
            const isCompleted = currentStepNum > s.id;
            const isActive = currentStepNum === s.id;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => {
                if (isCompleted) {
                  if (s.s === 'shipping') setStep('shipping');
                  if (s.s === 'methods') setStep('methods');
                }
              }}>
                <motion.div 
                   animate={{ 
                     backgroundColor: (isCompleted || isActive) ? "#FFD600" : "#FFFFFF",
                     borderColor: (isCompleted || isActive) ? "#FFD600" : "#E5E7EB",
                     scale: isActive ? 1.1 : 1
                   }}
                   className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all shadow-sm ${isActive ? 'shadow-brand-yellow/30' : ''}`}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-brand-dark" /> : <span className={isActive ? 'text-brand-dark' : 'text-gray-400'}>{s.id}</span>}
                </motion.div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-dark' : isCompleted ? 'text-brand-blue' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 'shipping' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-brand-dark mb-4 border-l-4 border-brand-yellow pl-4">Indirizzo di Spedizione</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Conferma dove vuoi ricevere la merce</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email di Contatto</label>
                  <input 
                    type="email" 
                    value={shippingForm.email}
                    onChange={e => setShippingForm({...shippingForm, email: e.target.value})}
                    placeholder="mario.rossi@esempio.it"
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                  />
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">L'email dell'account è preimpostata, puoi modificarla per la spedizione</p>
                </div>
                <div className="md:col-span-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Opzioni di Spedizione</span>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="shippingAddressOption" 
                        checked={useProfileAddress}
                        onChange={() => setUseProfileAddress(true)}
                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                      />
                      <span className="text-xs font-bold text-brand-dark">Coincide con i dati di profilo / fatturazione</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="radio" 
                        name="shippingAddressOption" 
                        checked={!useProfileAddress}
                        onChange={() => setUseProfileAddress(false)}
                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                      />
                      <span className="text-xs font-bold text-brand-dark">Spedisci a un altro indirizzo</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={shippingForm.name}
                    onChange={e => setShippingForm({...shippingForm, name: e.target.value})}
                    placeholder="Mario Rossi"
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Indirizzo e Numero Civico *</label>
                  <input 
                    type="text" 
                    value={shippingForm.street}
                    onChange={e => setShippingForm({...shippingForm, street: e.target.value})}
                    placeholder="Via delle Camelie, 12"
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Provincia *</label>
                  <select 
                    value={shippingForm.province}
                    onChange={e => {
                      setShippingForm({
                        ...shippingForm,
                        province: e.target.value,
                        city: '',
                        isCustomCity: false
                      });
                    }}
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all cursor-pointer"
                  >
                    <option value="">Seleziona...</option>
                    {uniqueProvinces.map((prov) => (
                      <option key={prov.nome} value={prov.nome}>
                        {prov.nome} ({prov.sigla})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Città *</label>
                  {!shippingForm.isCustomCity ? (
                    shippingForm.province ? (
                      <select 
                        value={shippingForm.city}
                        onChange={e => {
                          if (e.target.value === "CUSTOM") {
                            setShippingForm({...shippingForm, isCustomCity: true, city: ""});
                          } else {
                            setShippingForm({...shippingForm, city: e.target.value});
                          }
                        }}
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all cursor-pointer"
                      >
                        <option value="">Seleziona...</option>
                        {filteredCities.map((citta) => (
                          <option key={citta} value={citta}>{citta}</option>
                        ))}
                        <option value="CUSTOM">-- Altra città (inserimento manuale) --</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        placeholder="Scegli provincia..."
                        className="w-full bg-gray-100 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 outline-none cursor-not-allowed"
                      />
                    )
                  ) : (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={shippingForm.city}
                        onChange={e => setShippingForm({...shippingForm, city: e.target.value})}
                        placeholder="Es. Pomezia"
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                      />
                      <button 
                        type="button"
                        onClick={() => setShippingForm({...shippingForm, isCustomCity: false, city: ""})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-brand-blue"
                      >
                        Lista
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">CAP *</label>
                  <input 
                    type="text" 
                    value={shippingForm.zip}
                    onChange={e => setShippingForm({...shippingForm, zip: e.target.value})}
                    placeholder="00100"
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Cellulare / WhatsApp *</label>
                  <input 
                    type="tel" 
                    value={shippingForm.phone}
                    onChange={e => setShippingForm({...shippingForm, phone: e.target.value})}
                    placeholder="+39 333 1234567"
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Note per il Corriere (Opzionale)</label>
                  <textarea 
                    value={shippingForm.notes}
                    onChange={e => setShippingForm({...shippingForm, notes: e.target.value})}
                    placeholder="Es: Suonare al campanello Giallo, lasciare al portiere..."
                    rows={2}
                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'methods' && (
            <div className="space-y-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-brand-dark mb-4 border-l-4 border-brand-yellow pl-4">Scegli il metodo di pagamento</h3>
              
              <div className="grid gap-4">
                {settings.stripeEnabled && (
                  <button 
                    onClick={() => setSelectedMethod('stripe')}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedMethod === 'stripe' ? "border-brand-yellow bg-brand-yellow/5" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-brand-dark uppercase tracking-tight">Carta di Credito / GPay</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Processato da Stripe</span>
                      </div>
                    </div>
                    {selectedMethod === 'stripe' && <Check className="w-6 h-6 text-brand-yellow" />}
                  </button>
                )}

                {settings.paypalEnabled && (
                  <button 
                    onClick={() => setSelectedMethod('paypal')}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedMethod === 'paypal' ? "border-brand-blue bg-brand-blue/5" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <ExternalLink className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-brand-dark uppercase tracking-tight">PayPal</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Paga in sicurezza con il tuo conto</span>
                      </div>
                    </div>
                    {selectedMethod === 'paypal' && <Check className="w-6 h-6 text-brand-blue" />}
                  </button>
                )}

                {settings.bankEnabled && (
                  <button 
                    onClick={() => setSelectedMethod('bank')}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedMethod === 'bank' ? "border-brand-yellow bg-brand-yellow/5" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-brand-dark uppercase tracking-tight">Bonifico Bancario</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">L'ordine verrà elaborato alla ricezione</span>
                      </div>
                    </div>
                    {selectedMethod === 'bank' && <Check className="w-6 h-6 text-brand-yellow" />}
                  </button>
                )}

                {settings.codEnabled && (
                  <button 
                    onClick={() => setSelectedMethod('cod')}
                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedMethod === 'cod' ? "border-orange-500 bg-orange-50/5" : "border-gray-100 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-brand-dark uppercase tracking-tight">Contrassegno (COD)</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Paga in contanti alla consegna</span>
                      </div>
                    </div>
                    {selectedMethod === 'cod' && <Check className="w-6 h-6 text-orange-500" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 pb-6">

              {/* PDF Proforma Document */}
              <div id="bp-proforma-doc" className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-6 space-y-5">
                
                {/* ── HEADER DOCUMENTO ── */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={companySettings.imageLogo ? "h-10" : "w-10 h-10 bg-brand-yellow rounded-lg flex items-center justify-center flex-shrink-0"}>
                      {companySettings.imageLogo
                        ? <img src={companySettings.imageLogo} alt="Logo" className="h-full object-contain" referrerPolicy="no-referrer" />
                        : <span className="text-brand-dark font-black text-sm italic">{companySettings.logo}</span>}
                    </div>
                    <div>
                      <p className="font-black text-brand-dark text-sm uppercase tracking-tight leading-none">{companySettings.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{companySettings.legalName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-brand-dark uppercase tracking-tight leading-none">Proforma</p>
                    <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mt-1">ORDINE #{orderId}</p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{new Date().toLocaleDateString('it-IT')}</p>
                  </div>
                </div>

                {/* ── ANAGRAFICA + SPEDIZIONE ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <User size={9} className="text-brand-yellow" /> Cliente
                    </p>
                    <p className="font-black text-brand-dark text-xs leading-tight">{shippingForm.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{shippingForm.email}</p>
                    <p className="text-[10px] text-brand-blue font-bold">{shippingForm.phone}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <MapPin size={9} className="text-brand-yellow" /> Destinazione
                    </p>
                    <p className="font-bold text-brand-dark text-xs leading-snug">{shippingForm.street}</p>
                    <p className="text-[10px] text-gray-500">{shippingForm.zip} {shippingForm.city} ({shippingForm.province})</p>
                    {shippingForm.notes && (
                      <div className="mt-2 p-1.5 bg-yellow-50 rounded border border-yellow-100">
                        <p className="text-[7px] font-black text-yellow-600 uppercase">Note Corriere</p>
                        <p className="text-[9px] font-bold text-yellow-800 leading-tight italic">{shippingForm.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── METODO PAGAMENTO ── */}
                <div className="flex items-center justify-between bg-brand-dark text-white px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {selectedMethod === 'stripe' && <CreditCard size={14} className="text-brand-yellow" />}
                      {selectedMethod === 'paypal' && <ExternalLink size={14} className="text-brand-yellow" />}
                      {selectedMethod === 'bank'   && <Globe size={14} className="text-brand-yellow" />}
                      {selectedMethod === 'cod'    && <Truck size={14} className="text-brand-yellow" />}
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Pagamento</p>
                      <p className="text-xs font-black text-brand-yellow uppercase tracking-tight">
                        {selectedMethod === 'stripe' ? 'Carta / GPay' : selectedMethod === 'paypal' ? 'PayPal' : selectedMethod === 'bank' ? 'Bonifico Bancario' : 'Contrassegno'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[7px] font-black text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase">In attesa</span>
                </div>

                {/* ── PRODOTTI ── */}
                <div>
                  <div className="grid grid-cols-12 text-[7px] font-black text-gray-400 uppercase tracking-widest px-2 pb-1 border-b border-gray-100">
                    <div className="col-span-1"></div>
                    <div className="col-span-6 pl-2">Articolo</div>
                    <div className="col-span-2 text-center">Prezzo</div>
                    <div className="col-span-1 text-center">Qt</div>
                    <div className="col-span-2 text-right">Tot.</div>
                  </div>
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 items-center py-2 px-2 border-b border-gray-50 last:border-0">
                      <div className="col-span-1">
                        <div className="w-7 h-7 rounded bg-gray-50 border border-gray-100 overflow-hidden">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                        </div>
                      </div>
                      <div className="col-span-6 pl-2">
                        <p className="text-xs font-black text-brand-dark leading-tight">{item.name}</p>
                        <p className="text-[7px] text-gray-400 font-bold uppercase">SKU-{item.id.padStart(4,'0')}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold text-brand-dark">€{item.price.toFixed(2)}</span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="w-5 h-5 rounded bg-gray-100 inline-flex items-center justify-center text-[10px] font-black text-brand-dark">{item.quantity}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-black text-brand-dark">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── TOTALI ── */}
                <div className="flex flex-col items-end gap-1.5 pt-3 border-t border-gray-100">
                  <div className="flex justify-between w-56 text-[10px] font-bold text-gray-400 uppercase">
                    <span>Imponibile</span><span className="text-brand-dark">€{(total / 1.22).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-56 text-[10px] font-bold text-gray-400 uppercase">
                    <span>IVA (22% Inclusa)</span><span className="text-brand-dark">€{(total - (total / 1.22)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-56 text-[10px] font-bold text-green-600 uppercase">
                    <span>Spedizione</span><span className="font-black">€0,00</span>
                  </div>
                  <div className="flex justify-between items-center w-56 bg-brand-yellow px-4 py-3 rounded-2xl mt-1">
                    <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Totale</span>
                    <span className="text-lg font-black text-brand-dark">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* ── DATI PAGAMENTO (se Bonifico / COD) ── */}
                {(selectedMethod === 'bank' || selectedMethod === 'cod') && (
                  <div className={`p-4 rounded-xl border text-xs ${
                    selectedMethod === 'bank' ? 'border-brand-yellow/30 bg-yellow-50/50' : 'border-orange-200 bg-orange-50'
                  }`}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Shield size={10} /> Dati per il pagamento
                    </p>
                    {selectedMethod === 'bank' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[7px] text-gray-400 uppercase font-black mb-0.5">Beneficiario</p>
                          <p className="font-black text-brand-dark text-xs uppercase">{settings.bankOwner || 'BESPOINT S.R.L.'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-gray-400 uppercase font-black mb-0.5">IBAN</p>
                          <p className="font-bold text-brand-dark text-[10px] tracking-tight select-all">{settings.bankIban || '—'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-gray-600 uppercase">{settings.codNote || 'Pagamento in contanti alla consegna.'}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="no-print flex flex-col items-center gap-3 pt-2">
                <button
                  onClick={handlePrintProforma}
                  className="flex items-center gap-2 px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  <FileText size={14} />
                  Stampa / Salva PDF
                </button>
                <p className="text-[9px] text-gray-400 font-bold italic text-center max-w-xs">
                  Proforma generata dal sistema. Fattura elettronica emessa a spedizione avvenuta.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 mt-auto">
          {!currentUser ? (
              <div className="text-center space-y-4">
                <p className="text-sm font-bold text-brand-dark uppercase tracking-tighter">🔒 Effettua il login o registrati per completare l'acquisto</p>
                <button 
                  onClick={onAuthOpen}
                  className="w-full h-16 rounded-2xl bg-neutral-950 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-yellow/20 hover:bg-brand-orange"
                >
                  Registrati ora
                </button>
              </div>
          ) : step === 'shipping' ? (
            <button 
              disabled={!shippingForm.name || !shippingForm.street || !shippingForm.city || !shippingForm.zip || !shippingForm.province || !shippingForm.phone}
              onClick={() => setStep('methods')}
              className="w-full h-16 rounded-2xl bg-neutral-950 text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-dark/20 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Prosegui al Pagamento
            </button>
          ) : (
            <div className="space-y-4">
                <button 
                  onClick={() => setStep('shipping')}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-secondary hover:text-brand-dark transition-colors"
                >
                  Modifica Indirizzo di Spedizione
                </button>
                <button 
                  disabled={!selectedMethod || isProcessing}
                  onClick={() => {
                    if (step === 'methods') {
                      setStep('details');
                    } else {
                      handleConfirmOrder();
                    }
                  }}
                  className={`w-full h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${selectedMethod ? "bg-neutral-950 text-white hover:bg-black active:scale-[0.98] shadow-brand-dark/20" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  {isProcessing && <RefreshCw className="w-5 h-5 animate-spin" />}
                  {step === 'methods' ? "Vedi Riepilogo" : "Conferma Ordine"}
                </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

const CartDrawer = ({ items, onClose, onUpdateQuantity, onRemove, onCheckout }: { 
  items: CartItem[]; 
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  key?: string;
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold">Il tuo Carrello</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Il carrello è vuoto</p>
              <button onClick={onClose} className="mt-4 text-accent font-bold">Inizia lo shopping</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={item.id} 
                className="flex gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-accent font-bold text-sm">€{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-xs text-red-500 font-medium">Rimuovi</button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gray-50 border-t border-gray-100 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Totale</span>
              <span className="text-2xl font-bold">€{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white h-14 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
            >
              Procedi al Pagamento
            </button>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

const SideMenu = ({ isOpen, onClose, onSelectCategory, companySettings, pageSettings, products = [], onOpenProfile, onOpenOrders, onLogout }: { isOpen: boolean; onClose: () => void; onSelectCategory: (c: string, sub?: string) => void; companySettings: any; pageSettings: any; products?: any[]; onOpenProfile?: () => void; onOpenOrders?: () => void; onLogout?: () => void; key?: string }) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="side-menu-drawer fixed top-0 left-0 bottom-0 w-[min(100vw-0.75rem,17.5rem)] md:w-80 bg-white text-neutral-900 z-[70] shadow-2xl flex flex-col p-4 md:p-6 font-['Montserrat',sans-serif] border-r border-neutral-200"
          >
            {/* Header del Menu laterale */}
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-neutral-100">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-light tracking-[0.28em] text-neutral-950 uppercase">
                  VINCENT
                </span>
                <span className="text-[10px] font-light tracking-[0.3em] text-neutral-400 uppercase">
                  STORE
                </span>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full transition-colors"
                aria-label="Chiudi menu"
              >
                <X className="w-5 h-5 stroke-[1.4]" />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6 overflow-y-auto no-scrollbar flex-1 pr-0.5">
              {/* Sezione Account — desktop: card; mobile: compatto */}
              <div className="space-y-0 md:space-y-2 border-b md:border-b-0 border-neutral-100 pb-3 md:pb-0">
                <h3 className="text-[9px] md:text-[10px] font-normal text-neutral-400 uppercase tracking-[0.22em] mb-2 px-0.5">Account</h3>
                <button 
                  onClick={() => { if (onOpenProfile) onOpenProfile(); onClose(); }}
                  className="flex items-center gap-3 w-full min-h-[44px] md:min-h-0 p-2.5 md:p-3 md:bg-neutral-50 hover:bg-neutral-50 md:hover:bg-neutral-100 md:border md:border-neutral-100 rounded-lg md:rounded-xl transition-colors text-left"
                >
                  <User className="w-4 h-4 text-neutral-900 stroke-[1.4]" />
                  <span className="text-[11px] md:text-xs font-light md:font-normal tracking-[0.08em] md:tracking-wide text-neutral-900 uppercase md:normal-case">Il mio profilo</span>
                </button>
                <button 
                  onClick={() => { if (onOpenOrders) onOpenOrders(); onClose(); }}
                  className="flex items-center gap-3 w-full min-h-[44px] md:min-h-0 p-2.5 md:p-3 md:bg-neutral-50 hover:bg-neutral-50 md:hover:bg-neutral-100 md:border md:border-neutral-100 rounded-lg md:rounded-xl transition-colors text-left"
                >
                  <ShoppingCart className="w-4 h-4 text-neutral-900 stroke-[1.4]" />
                  <span className="text-[11px] md:text-xs font-light md:font-normal tracking-[0.08em] md:tracking-wide text-neutral-900 uppercase md:normal-case">I miei ordini</span>
                </button>
              </div>

              {/* Sezione Categorie — mobile: lista minimal come admin categorie */}
              <div className="space-y-0 md:space-y-2">
                <div className="flex items-center justify-between mb-1 md:mb-2 px-0.5">
                  <h3 className="text-[9px] md:text-[10px] font-normal text-neutral-400 uppercase tracking-[0.22em]">Categorie</h3>
                  <button 
                    onClick={() => { onSelectCategory("Tutti"); onClose(); }}
                    className="text-[10px] font-semibold text-neutral-900 uppercase tracking-wider hover:underline"
                  >
                    Resetta
                  </button>
                </div>
                
                <ul className="md:space-y-1 border-t border-neutral-200/80 md:border-t-0 divide-y divide-neutral-200/80 md:divide-y-0">
                {/* I Tuoi Preferiti */}
                <li>
                <button
                  onClick={() => {
                    onSelectCategory("Preferiti");
                    onClose();
                  }}
                  className="flex items-center justify-between w-full min-h-[48px] md:min-h-0 py-3 md:p-3 px-0.5 hover:bg-neutral-50 md:rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 fill-red-500 stroke-[1.4]" />
                    <span className="text-[11px] md:text-xs font-light md:font-medium uppercase tracking-[0.14em] md:tracking-[0.16em] text-neutral-900">Preferiti</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-300 stroke-[1.3]" />
                </button>
                </li>

                {/* Lista Categorie e Sottocategorie Espandibili */}
                {pageSettings.categories.filter((cat: string) => cat !== "Tutti").map((cat: string) => {
                  const count = products.filter((p: any) => p.category === cat).length;
                  const subcategories = pageSettings.subcategories?.[cat] || [];
                  const isExpanded = expandedCat === cat;

                  return (
                    <li key={cat}>
                      <div className="flex items-center gap-0.5 w-full min-h-[48px] md:min-h-0 py-2 md:p-2.5 hover:bg-neutral-50 md:rounded-xl transition-colors group">
                        {subcategories.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedCat(isExpanded ? null : cat)}
                            className="w-8 h-8 md:w-7 md:h-7 shrink-0 flex items-center justify-center text-neutral-400 hover:text-neutral-900"
                            aria-label="Espandi sottocategorie"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
                            )}
                          </button>
                        ) : (
                          <span className="w-8 shrink-0" aria-hidden />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat, 'Tutti');
                            onClose();
                          }}
                          className="flex-1 min-w-0 text-left py-1"
                        >
                          <span className="text-[11px] md:text-xs font-light uppercase tracking-[0.14em] text-neutral-900">{cat}</span>
                          <span className="block md:inline text-[10px] text-neutral-400 md:ml-2">{count} prodotti</span>
                        </button>
                      </div>

                      {isExpanded && subcategories.length > 0 && (
                        <ul className="pb-2 pl-9 md:pl-4 border-l border-neutral-200 ml-3 md:ml-2 space-y-0 divide-y divide-neutral-100 md:divide-y-0 md:space-y-0.5">
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCategory(cat, 'Tutti');
                                onClose();
                              }}
                              className="w-full text-left py-2.5 md:py-1.5 px-1 text-[10px] font-light uppercase tracking-[0.12em] text-neutral-600 hover:text-black"
                            >
                              Tutte
                            </button>
                          </li>
                          {subcategories.map((sub: string) => (
                            <li key={sub}>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectCategory(cat, sub);
                                  onClose();
                                }}
                                className="w-full text-left py-2.5 md:py-1.5 px-1 text-[10px] font-light uppercase tracking-[0.12em] text-neutral-500 hover:text-black flex items-center justify-between"
                              >
                                <span>{sub}</span>
                                <ChevronRight className="w-3 h-3 text-neutral-300 md:hidden" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
                </ul>
              </div>

              {/* Supporto */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h3 className="text-[10px] font-normal text-neutral-400 uppercase tracking-[0.25em] mb-2">Concierge & Boutique</h3>
                <button className="flex items-center gap-3 w-full p-2.5 hover:bg-neutral-50 rounded-xl transition-colors text-left">
                  <Phone className="w-4 h-4 text-neutral-900 stroke-[1.4]" />
                  <span className="text-xs font-light text-neutral-800">+39 02 8901234</span>
                </button>
                <button className="flex items-center gap-3 w-full p-2.5 hover:bg-neutral-50 rounded-xl transition-colors text-left">
                  <Mail className="w-4 h-4 text-neutral-900 stroke-[1.4]" />
                  <span className="text-xs font-light text-neutral-800">concierge@vincentstore.it</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <button 
                onClick={() => { if (onLogout) onLogout(); onClose(); }}
                className="w-full bg-neutral-950 hover:bg-black text-white py-3.5 rounded-xl font-normal uppercase text-xs tracking-[0.2em] shadow-sm active:scale-95 transition-all"
              >
                Esci dal Profilo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
// --- Main App ---

const HERO_IMAGES = [
  "https://picsum.photos/seed/electronics-1/1200/600",
  "https://picsum.photos/seed/electronics-2/1200/600",
  "https://picsum.photos/seed/electronics-3/1200/600",
  "https://picsum.photos/seed/electronics-4/1200/600",
  "https://picsum.photos/seed/electronics-5/1200/600",
];

const PROMO_ITEMS = [
  { id: 1, title: "Nuovi Arrivi", subtitle: "Scopri la collezione", color: "bg-brand-blue", seed: "gadgets" },
  { id: 2, title: "Best Seller", subtitle: "I più amati", color: "bg-brand-yellow", seed: "tech-best" },
  { id: 3, title: "Sconti Flash", subtitle: "Solo per oggi", color: "bg-red-500", seed: "flash" },
  { id: 4, title: "Illuminazione", subtitle: "Luce perfetta", color: "bg-green-600", seed: "light" },
  { id: 5, title: "Audio Pro", subtitle: "Suono puro", color: "bg-purple-600", seed: "audio" },
  { id: 6, title: "Smart Home", subtitle: "Casa connessa", color: "bg-orange-500", seed: "smart" },
  { id: 7, title: "Gaming", subtitle: "Livello pro", color: "bg-indigo-600", seed: "gaming" },
  { id: 8, title: "Accessori", subtitle: "Tutto il resto", color: "bg-gray-800", seed: "acc" },
];

const SlideSection = ({ slides, darken = false }: { slides: any[], darken?: boolean }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[index];

  return (
    <section className="px-4 mb-12">
      <div className="relative aspect-[21/9] rounded-[32px] overflow-hidden shadow-xl group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            {/* Dark Overlay (Triggle) */}
            {darken && (
              <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            )}

            {currentSlide.link ? (
              <a href={currentSlide.link} className="block w-full h-full">
                {currentSlide.url && (
                  <img 
                    src={currentSlide.url} 
                    alt={currentSlide.alt} 
                    title={currentSlide.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </a>
            ) : (
              currentSlide.url && (
                <img 
                  src={currentSlide.url} 
                  alt={currentSlide.alt} 
                  title={currentSlide.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )
            )}
            
            {(currentSlide.title || currentSlide.alt) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-black text-white uppercase tracking-tighter mb-1"
                >
                  {currentSlide.title}
                </motion.h3>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 text-sm font-bold"
                >
                  {currentSlide.alt}
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="absolute bottom-4 right-8 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button 
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === index ? "bg-brand-yellow w-6" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default function App({ hideStorefront = false }: { hideStorefront?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();


  const { 
    products, setProducts,
    selectedCategory, setSelectedCategory,
    selectedSubcategory, setSelectedSubcategory,
    selectedProduct, handleProductSelect: setSelectedProduct,
    searchQuery, setSearchQuery,
    selectedBrand, setSelectedBrand,
    isAdminOpen, setIsAdminOpen,
    sortBy, setSortBy,
    isGlobalFiltersExpanded, setIsGlobalFiltersExpanded,
    cart, setCart,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen,
    paymentSettings, setPaymentSettings,
    orders, setOrders,
    isAuthOpen, setIsAuthOpen,
    authStep, setAuthStep,
    currentUser, setCurrentUser,
    pageSettings, setPageSettings,
    companySettings, setCompanySettings,
    returnRequests, setReturnRequests,
    productReviews, setProductReviews,
    favorites, toggleFavorite,
    toasts, addToast, dismissToast,
    isDesktop,
    adminActiveTab, setAdminActiveTab,
    isSideMenuOpen, setIsSideMenuOpen,
    logout,
    syncProductToSupabase,
    deleteProductFromSupabase,
  } = useApp();

  useEffect(() => {
    // hideStorefront indicates Next.js StorefrontShell is hosting App.
    // Modals (ProductSheet, CartDrawer, etc.) are rendered by App without forcing admin mode.
  }, [hideStorefront]);

  // --- Sincronizzazione URL -> Stato (solo storefront legacy; Next.js usa StorefrontShell) ---
  useEffect(() => {
    if (hideStorefront) return;

    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);

    if (parts[0] === 'category') {
      const cat = decodeURIComponent(parts[1]);
      if (cat !== selectedCategory) setSelectedCategory(cat);
      if (selectedProduct) setSelectedProduct(null);
    } else if (parts[0] === 'product') {
      const productId = parts[1];
      const product = products.find(p => p.id === productId);
      if (product) {
        if (!selectedProduct || selectedProduct.id !== productId) {
          setSelectedProduct(product);
        }
        // SEO: Se lo slug manca o è diverso, reindirizziamo alla URL corretta
        const correctSlug = slugify(product.name);
        if (parts[2] !== correctSlug) {
          navigate(`/product/${productId}/${correctSlug}`, { replace: true });
        }
      } else if (products.length > 0) {
        // Prodotto non trovato: torna alla home invece di mostrare pagina bianca
        navigate('/', { replace: true });
      }
    } else if (path === '/') {
      if (selectedCategory !== "Tutti") setSelectedCategory("Tutti");
      if (selectedProduct) setSelectedProduct(null);
    }
  }, [location.pathname, products, hideStorefront]);

  const handleCategorySelect = (cat: string) => {
    if (cat === "Tutti") {
      navigate("/");
      setSelectedSubcategory("Tutti");
    } else {
      navigate(`/category/${encodeURIComponent(cat)}`);
      const subcats = pageSettings.subcategories[cat] || [];
      if (subcats.length > 0) {
        setSelectedSubcategory(subcats[0]);
      } else {
        setSelectedSubcategory("Tutti");
      }
    }
  };

  const handleProductSelect = (p: Product | null) => {
    if (p) navigate(`/product/${p.id}/${slugify(p.name)}`);
    else {
      setSelectedProduct(null);
      if (selectedCategory && selectedCategory !== "Tutti") navigate(`/category/${encodeURIComponent(selectedCategory)}`);
      else navigate("/");
    }
  };

  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showSpecialOnly, setShowSpecialOnly] = useState(false);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("Tutti");
  const [adminBrandFilter, setAdminBrandFilter] = useState("Tutti");
  const [adminChannelFilter, setAdminChannelFilter] = useState("Tutti"); // Tutti, Web, Amazon, Ebay
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authLoginId, setAuthLoginId] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authProvince, setAuthProvince] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [comuniList, setComuniList] = useState<any[]>([]);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComuniList(data);
        }
      })
      .catch(err => console.error("Error fetching Italian comuni:", err));
  }, []);

  const uniqueProvinces = useMemo(() => {
    const provincesMap = new Map<string, string>();
    comuniList.forEach(c => {
      if (c.provincia?.nome) {
        provincesMap.set(c.provincia.nome, c.sigla);
      }
    });
    return Array.from(provincesMap.entries()).map(([nome, sigla]) => ({ nome, sigla })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [comuniList]);

  const filteredCities = useMemo(() => {
    if (!authProvince) return [];
    return comuniList
      .filter(c => c.provincia?.nome === authProvince)
      .map(c => c.nome)
      .sort((a, b) => a.localeCompare(b));
  }, [authProvince, comuniList]);
  
  const [profileEditForm, setProfileEditForm] = useState({
    nameFirst: '',
    nameLast: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressZip: '',
    addressProvince: '',
    taxCode: ''
  });
  
  useEffect(() => {
    if (currentUser) {
      setProfileEditForm({
        nameFirst: currentUser.name?.split(' ')[0] || '',
        nameLast: currentUser.name?.split(' ').slice(1).join(' ') || '',
        phone: currentUser.phone || '',
        addressStreet: currentUser.addressStreet || '',
        addressCity: currentUser.addressCity || '',
        addressZip: currentUser.addressZip || '',
        addressProvince: currentUser.addressProvince || '',
        taxCode: currentUser.taxCode || ''
      });
    }
  }, [currentUser, authStep]);
  const [isMobileAdminMenuOpen, setIsMobileAdminMenuOpen] = useState(false);

  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [showAllSeoCategories, setShowAllSeoCategories] = useState(false);
  const [activeUserView, setActiveUserView] = useState<'profile' | 'returns' | 'return_form' | 'review_form' | 'menu' | 'favorites'>('profile');
  const [favoritesViewMode, setFavoritesViewMode] = useState<'carousel' | 'grid'>('grid');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any>(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState<any>(null);
  const [selectedReturnDetail, setSelectedReturnDetail] = useState<any>(null);
  const [userReturnMsg, setUserReturnMsg] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [isReturnSubmitting, setIsReturnSubmitting] = useState(false);
  const [returnQty, setReturnQty] = useState(1);
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);

  const parseOrderDate = (dStr: string) => {
    const months: any = { jan:0,gen:0,feb:1,mar:2,apr:3,may:4,mag:4,jun:5,giu:5,jul:6,lug:6,aug:7,ago:7,sep:8,set:8,oct:9,ott:9,nov:10,dec:11,dic:11 };
    const parts = dStr.replace('.', '').split(' ');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[2]), months[parts[1].toLowerCase().substring(0,3)] || 0, parseInt(parts[0]));
  };

  useEffect(() => {
    localStorage.setItem('vincent_returns', JSON.stringify(returnRequests));
  }, [returnRequests]);
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGeneralSaveSuccess, setIsGeneralSaveSuccess] = useState(false);
  const [availableVariants, setAvailableVariants] = useState<string[]>(['Colore', 'Taglia']);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<string | null>(null);
  const [adminProductView, setAdminProductView] = useState<'list' | 'single' | 'mass'>('list');
  const [editingAdminProduct, setEditingAdminProduct] = useState<Product | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [expandedUserOrders, setExpandedUserOrders] = useState<Record<string, boolean>>({});
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [adminTopIdx, setAdminTopIdx] = useState(0);
  const [adminMidIdx, setAdminMidIdx] = useState(0);
  const [adminBotIdx, setAdminBotIdx] = useState(0);
  const [slideToDelete, setSlideToDelete] = useState<{ id: string; type: string; position: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: string; subcategory: string } | null>(null);
  const [editSubcategoryValue, setEditSubcategoryValue] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<{ categories: string[], subcategories: Record<string, string[]> } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [categoryFilterSearch, setCategoryFilterSearch] = useState("");

  const adminUniqueBrands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort() as string[], [products]);
  const [adminConfirmAction, setAdminConfirmAction] = useState<{ active: boolean, title: string, message: string, onConfirm: () => void, color: string } | null>(null);

  const handleUserReturnMessage = (requestId: string, text: string) => {
    if (!text.trim()) return;
    setReturnRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = {
          ...req,
          messages: [...req.messages, { role: 'user', text, date: new Date().toLocaleString('it-IT') }]
        };
        if (selectedReturnDetail?.id === requestId) setSelectedReturnDetail(updated);
        return updated;
      }
      return req;
    }));
    setUserReturnMsg('');
  };

  const handleReturnPhotoMessage = (requestId: string, url: string) => {
    setReturnRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = {
          ...req,
          photos: [...(req.photos || []), url],
          messages: [...req.messages, { role: 'user', text: "Nuova foto caricata per la pratica", date: new Date().toLocaleString('it-IT') }]
        };
        if (selectedReturnDetail?.id === requestId) setSelectedReturnDetail(updated);
        return updated;
      }
      return req;
    }));
    addToast("Foto aggiunta con successo alla pratica!", "success");
  };
  
  const handleShare = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Guarda questo prodotto su BesPoint: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Errore durante la condivisione", err);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        addToast("L'indirizzo del sito è stato copiato negli appunti!", "success");
      });
    }
  };

  // Dynamic Favicon Update
  useEffect(() => {
    if (companySettings.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = companySettings.favicon;
    }
  }, [companySettings.favicon]);

  // Force BesPoint branding if it's still the old one
  useEffect(() => {
    if (companySettings.name === "BESPOINT") {
      setCompanySettings(prev => ({ ...prev, name: "BesPoint" }));
    }
  }, [companySettings.name]);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for compression
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
          callback(compressedUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analizza questi prodotti e suggerisci una struttura gerarchica di categorie e sottocategorie. 
        Restituisci un oggetto JSON con un array 'categories' (stringhe) e un oggetto 'subcategories' (che mappa i nomi delle categorie ad array di stringhe).
        Includi solo categorie e sottocategorie rilevanti per i prodotti forniti.
        Prodotti: ${JSON.stringify(PRODUCTS.map(p => ({ name: p.name, category: p.category, subcategory: p.subcategory })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categories: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              subcategories: {
                type: Type.OBJECT,
                properties: {
                  // Dynamic keys are tricky in responseSchema, but we can describe it generally
                }
              }
            },
            required: ["categories", "subcategories"]
          }
        }
      });
      
      const jsonStr = response.text.trim();
      const suggestions = JSON.parse(jsonStr);
      
      // Ensure "Tutti" is in categories
      if (!suggestions.categories.includes("Tutti")) {
        suggestions.categories.unshift("Tutti");
      }
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI Suggestion error:", error);
      addToast("Errore durante il suggerimento AI. Riprova.", "error");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const [heroIndex, setHeroIndex] = useState(0);
  const [cartTrigger, setCartTrigger] = useState(0);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsHeaderHidden(latest > 100);
    lastScrollY.current = latest;
  });

  const adminTopSlides = useMemo(() => pageSettings.homeSlides.filter((s: any) => s.position === 'home_top' || !s.position), [pageSettings.homeSlides]);
  const adminMidSlides = useMemo(() => pageSettings.homeSlides.filter((s: any) => s.position === 'home_middle'), [pageSettings.homeSlides]);
  const adminBotSlides = useMemo(() => pageSettings.homeSlides.filter((s: any) => s.position === 'home_bottom'), [pageSettings.homeSlides]);

  const topSlides = useMemo(() => adminTopSlides.filter((s: any) => s.url), [adminTopSlides]);
  const middleSlides = useMemo(() => adminMidSlides.filter((s: any) => s.url), [adminMidSlides]);
  const bottomSlides = useMemo(() => adminBotSlides.filter((s: any) => s.url), [adminBotSlides]);

  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        adminSearchQuery === '' ||
        p.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
        (p.ean && p.ean.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
        `BP-${p.id.padStart(4, '0')}`.toLowerCase().includes(adminSearchQuery.toLowerCase());
      const matchesCategory = adminCategoryFilter === 'Tutti' || p.category === adminCategoryFilter;
      const matchesBrand = adminBrandFilter === 'Tutti' || p.brand === adminBrandFilter;
      let matchesChannel = true;
      if (adminChannelFilter === 'Web') matchesChannel = (p.stock || 0) > 0;
      if (adminChannelFilter === 'Amazon') matchesChannel = (p.amazonStock || 0) > 0;
      const matchesFeatured = !showFeaturedOnly || p.isFeatured;
      const matchesSpecial = !showSpecialOnly || p.isSpecialPromotion;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesChannel &&
        matchesFeatured &&
        matchesSpecial
      );
    });
  }, [
    products,
    adminSearchQuery,
    adminCategoryFilter,
    adminBrandFilter,
    adminChannelFilter,
    showFeaturedOnly,
    showSpecialOnly,
  ]);

  useEffect(() => {
    if (topSlides.length <= 1) {
      setHeroIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % topSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [topSlides.length]);

  useEffect(() => {
    if (hideStorefront) return;
    if (isAdminOpen) {
      document.body.style.overflow = 'hidden';
      setIsMobileAdminMenuOpen(false);
    } else {
      document.body.style.overflow = '';
      setIsMobileAdminMenuOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAdminOpen, hideStorefront]);

  useEffect(() => {
    setSelectedSubcategory("Tutti");
  }, [selectedCategory]);

  const featuredProducts = useMemo(() => {
    return products.filter(p => p.isFeatured).slice(0, pageSettings.maxFeatured || 8);
  }, [products, cartTrigger, pageSettings.maxFeatured]);

  const specialCategoryProducts = useMemo(() => {
    if (!pageSettings.isSpecialCategoryEnabled) return [];
    return products.filter(p => p.isSpecialPromotion)
      .slice(0, pageSettings.specialCategoryMax || 8);
  }, [products, pageSettings.isSpecialCategoryEnabled, pageSettings.specialCategoryMax, cartTrigger]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchesCategory = selectedCategory === "Tutti" || p.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === "Tutti" || p.subcategory === selectedSubcategory;
      const matchesBrand = selectedBrand === "Tutti" || p.brand === selectedBrand;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Il filtro stock è rimosso: tutti i prodotti vengono mostrati indipendentemente dalla giacenza
      const matchesFeatured = !showFeaturedOnly || p.isFeatured;
      const matchesSpecial = !showSpecialOnly || p.isSpecialPromotion;
      return matchesCategory && matchesSubcategory && matchesBrand && matchesSearch && matchesFeatured && matchesSpecial;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return parseInt(b.id) - parseInt(a.id);
      return 0;
    });
  }, [products, selectedCategory, selectedSubcategory, selectedBrand, searchQuery, sortBy, cartTrigger]);

  const mapSessionUser = (user: { id: string; username: string; email: string; name?: string; [k: string]: unknown }) => ({
    ...user,
    name: user.name || user.username,
  });

  const resetAuthFields = () => {
    setAuthEmail('');
    setAuthUsername('');
    setAuthLoginId('');
    setAuthPassword('');
    setAuthName('');
    setAuthFirstName('');
    setAuthLastName('');
    setAuthCity('');
    setAuthProvince('');
    setAuthStep('email');
  };

  const handleAuthEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail.includes('@')) {
      setAuthError('Email non valida');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: authEmail.toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Verifica email non riuscita');
        return;
      }
      setAuthLoginId(authEmail.toLowerCase());
      setAuthStep(data.exists ? 'login' : 'register');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const login = (authLoginId || authEmail).trim();
    if (!login || authPassword.length < 1) {
      setAuthError('Inserisci username/email e password');
      return;
    }
    setAuthSubmitting(true);
    try {
      const { user, error } = await authLogin(login, authPassword);
      if (error || !user) {
        setAuthError(error || 'Accesso non riuscito');
        return;
      }
      const mapped = mapSessionUser(user);
      setCurrentUser(mapped);
      localStorage.setItem('vincent_current_user', JSON.stringify(mapped));
      setIsAuthOpen(false);
      resetAuthFields();
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    const updatedName = `${profileEditForm.nameFirst} ${profileEditForm.nameLast}`.trim();
    const payload = {
      name: updatedName || currentUser.name,
      phone: profileEditForm.phone,
      addressStreet: profileEditForm.addressStreet,
      addressCity: profileEditForm.addressCity,
      addressZip: profileEditForm.addressZip,
      addressProvince: profileEditForm.addressProvince,
      taxCode: profileEditForm.taxCode,
    };
    setAuthSubmitting(true);
    try {
      const { user, error } = await authUpdateProfile(payload);
      if (error || !user) {
        setAuthError(error || 'Salvataggio profilo non riuscito');
        return;
      }
      const mapped = mapSessionUser(user);
      setCurrentUser(mapped);
      localStorage.setItem('vincent_current_user', JSON.stringify(mapped));
      setAuthStep('profile');
      addToast('Dati di spedizione e profilo salvati con successo!', 'success');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authPassword.length < 6) {
      setAuthError('La password deve contenere almeno 6 caratteri');
      return;
    }
    setAuthSubmitting(true);
    try {
      const username = authUsername.trim().toLowerCase() || undefined;
      const { user, error } = await authRegister({
        username,
        email: authEmail.toLowerCase(),
        password: authPassword,
        firstName: authFirstName.trim() || undefined,
        lastName: authLastName.trim() || undefined,
        addressCity: authCity || undefined,
        addressProvince: authProvince || undefined,
      });
      if (error || !user) {
        setAuthError(error || 'Registrazione non riuscita');
        return;
      }
      const mapped = mapSessionUser(user);
      setCurrentUser(mapped);
      localStorage.setItem('vincent_current_user', JSON.stringify(mapped));
      setIsAuthOpen(false);
      resetAuthFields();
      addToast('Account creato con successo! Benvenuto in Vincent.', 'success');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const ok = window.confirm(
      'Eliminare definitivamente il tuo account? Perderai accesso a ordini e preferiti associati.'
    );
    if (!ok) return;
    setAuthSubmitting(true);
    try {
      const { ok: deleted, error } = await authDeleteAccount();
      if (!deleted) {
        setAuthError(error || 'Eliminazione non riuscita');
        return;
      }
      logout();
      setIsAuthOpen(false);
      resetAuthFields();
      addToast('Account eliminato correttamente', 'success');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartTrigger(prev => prev + 1);
  };


  const getProductCount = (category: string, subcategory?: string | null) => {
    return products.filter(p => {
      const matchesCat = p.category === category || category === "Tutti";
      const matchesSub = !subcategory || subcategory === "Tutti" || p.subcategory === subcategory;
      return matchesCat && matchesSub;
    }).length;
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Smooth scroll-driven animations
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const heroOpacity = useTransform(smoothScrollY, [0, 150], [1, 0]);
  const heroY = useTransform(smoothScrollY, [0, 150], [0, -40]);

  // Header animations with springs for "weight"
  // Header animations - define all transforms unconditionally to follow Rules of Hooks
  const legacyDesktopHeight = useTransform(smoothScrollY, [0, 1], [64, 64]);
  const legacyMobileHeight = useTransform(smoothScrollY, [0, 100], [64, 0]);
  const headerTopHeight = useSpring(isDesktop ? legacyDesktopHeight : legacyMobileHeight, { stiffness: 400, damping: 40 });
  
  const legacyDesktopOpacity = useTransform(smoothScrollY, [0, 1], [1, 1]);
  const legacyMobileOpacity = useTransform(smoothScrollY, [0, 80], [1, 0]);
  const headerTopOpacity = useSpring(isDesktop ? legacyDesktopOpacity : legacyMobileOpacity, { stiffness: 400, damping: 40 });
  
  const legacyDesktopScale = useTransform(smoothScrollY, [0, 1], [1, 1]);
  const legacyMobileScale = useTransform(smoothScrollY, [0, 100], [1, 0.98]);
  const headerTopScale = useSpring(isDesktop ? legacyDesktopScale : legacyMobileScale, { stiffness: 400, damping: 40 });

  const headerShadowOpacity = useTransform(smoothScrollY, [0, 100], [0, 0.2]);

  return (
    <div className={hideStorefront ? "" : "min-h-screen pb-24 bg-gray-100"}>
      {!hideStorefront && (
        <>
          {/* Top Bar */}
          <div className="h-10 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border-b border-gray-800 text-white overflow-hidden relative">
            {(pageSettings.topBarMode ?? 'static') === 'image' && pageSettings.topBarImage ? (
              <img src={pageSettings.topBarImage} alt="Top bar" className="w-full h-full object-cover object-center" />
            ) : (pageSettings.topBarMode ?? 'static') === 'marquee' ? (
              <div className="marquee-topbar h-full w-full overflow-hidden">
                <div
                  className="marquee-topbar-track h-full items-center text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ animationDuration: `${Math.max(8, Number(pageSettings.topBarMarqueeSpeed) || 30)}s` }}
                >
                  <span className="px-8">{pageSettings.topBarMarqueeText || 'Consegna rapida in tutta Italia | Resi facili entro 30 giorni | Supporto clienti 24/7'}</span>
                  <span className="px-8" aria-hidden="true">{pageSettings.topBarMarqueeText || 'Consegna rapida in tutta Italia | Resi facili entro 30 giorni | Supporto clienti 24/7'}</span>
                </div>
              </div>
            ) : (
              <div className="px-4 h-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest w-full">
                <div className="flex items-center gap-2">
                  <span className="opacity-70">{pageSettings.topBarLeftText || `Consegna a Massimo - Roma`}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="opacity-70">{pageSettings.topBarRightText || `Aiuto Resi e Ordine`}</span>
                </div>
              </div>
            )}
          </div>

          {/* Header */}
          <motion.header 
            style={{ 
              boxShadow: useTransform(headerShadowOpacity, (v) => `0 10px 30px -10px rgba(0,0,0,${v})`)
            }}
            className="sticky top-0 z-40 bg-gradient-to-b from-[#111111] to-black"
          >
            {/* Animated Top Section (Logo, Desktop Search, Actions) */}
            <motion.div 
              style={{ height: headerTopHeight, opacity: headerTopOpacity, scale: headerTopScale }}
              className="px-4 flex items-center justify-between gap-4 overflow-hidden origin-top"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSideMenuOpen(true)}
                  className="text-white hover:text-brand-yellow transition-colors"
                >
                  <Menu className="w-7 h-7" />
                </button>
                <div className="flex items-center gap-3">
                  <div className={companySettings.imageLogo ? "h-10 flex items-center" : "w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center overflow-hidden"}>
                    {companySettings.imageLogo ? (
                      <img src={companySettings.imageLogo} alt="Logo" className="h-full object-contain" referrerPolicy="no-referrer" />
                    ) : companySettings.logo.startsWith('http') ? (
                      <img src={companySettings.logo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-brand-dark font-black text-lg">{companySettings.logo}</span>
                    )}
                  </div>
                  {!companySettings.imageLogo && (
                    <h1 className="text-xl font-bold tracking-tight text-white">{companySettings.name}</h1>
                  )}
                </div>
              </div>
              
              <div className="flex-1 relative hidden md:block">
                <input 
                  type="text" 
                  placeholder={`Cerca su ${companySettings.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-white rounded-md pl-4 pr-10 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                />
                <button className="absolute right-0 top-0 h-full px-3 bg-brand-yellow rounded-r-md">
                  <Search className="w-5 h-5 text-brand-dark" />
                </button>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => {
                    if (currentUser) {
                      setAuthStep('profile');
                      setActiveUserView('profile');
                    } else {
                      setAuthStep('email');
                    }
                    setIsAuthOpen(true);
                  }}
                  className="flex flex-col items-center text-white hover:text-brand-yellow transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{currentUser ? currentUser.name.split(' ')[0] : 'Accedi'}</span>
                </button>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center text-white gap-1"
                >
                  <motion.div 
                    key={cartTrigger}
                    animate={cartTrigger > 0 ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative"
                  >
                    <ShoppingCart className="w-7 h-7" />
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-neutral-950 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-blue"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </motion.div>
                  <span className="text-sm font-bold hidden sm:inline">Carrello</span>
                </button>
              </div>
            </motion.div>

            {/* Secondary Nav / Categories (NOW ABOVE SEARCH) */}
            <div className="bg-brand-blue border-t border-white/10 px-4 py-2 flex items-center text-xs font-bold text-white/90 overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar gap-4 items-center flex-1 scroll-smooth">
                {/* Icona Home Gialla e Nome Categoria Attiva */}
                <div className="flex items-center gap-3 pr-2 border-r border-white/10 flex-shrink-0">
                  <button 
                    onClick={() => handleCategorySelect("Tutti")}
                    className="flex items-center group"
                    title="Torna alla Home"
                  >
                    <div className="w-6 h-6 rounded-md bg-brand-yellow flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-brand-yellow/20">
                      <Home className="w-3.5 h-3.5 text-brand-dark" />
                    </div>
                  </button>
                  {selectedCategory !== "Tutti" && (
                    <span className="text-brand-yellow font-black uppercase text-[10px] tracking-[0.15em] whitespace-nowrap">
                      {selectedCategory}
                    </span>
                  )}
                </div>

                {(selectedCategory === "Tutti" 
                  ? pageSettings.categories.filter((c: string) => c !== "Tutti") 
                  : (pageSettings.subcategories[selectedCategory] || []).filter((c: string) => c !== "Tutti")
                ).map((cat, idx) => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${selectedCategory}-${cat}-${idx}`}
                    onClick={() => selectedCategory === "Tutti" ? handleCategorySelect(cat) : setSelectedSubcategory(cat)}
                    className={`whitespace-nowrap pb-1 border-b-2 transition-all ${
                      (selectedCategory === "Tutti" ? selectedCategory === cat : selectedSubcategory === cat)
                        ? "border-brand-yellow text-white" 
                        : "border-transparent hover:text-white"
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mobile Search Bar (NOW BELOW CATEGORIES) */}
            <div className="px-4 py-2 md:hidden border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cerca su Vincent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 bg-white rounded-lg pl-4 pr-12 text-base shadow-inner focus:outline-none"
                />
                <button className="absolute right-0 top-0 h-full px-4 bg-brand-yellow rounded-lg">
                  <Search className="w-5 h-5 text-brand-dark" />
                </button>
              </div>
            </div>
          </motion.header>

          <main className="relative z-10">
            {/* Hero Banner (Amazon Style) */}
            {selectedCategory === "Tutti" && pageSettings.isHeroEnabled !== false ? (
              <section 
                className="relative w-full overflow-hidden mb-8 origin-top h-[460px] sm:h-[550px]"
              >
                <div className="h-full w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/40 to-transparent z-10" />
                  <div className="w-full h-full relative">
                    {topSlides.map((slide, idx) => (
                      <div 
                        key={idx}
                        className={`absolute inset-0 w-full h-full ${heroIndex === idx ? 'block z-10' : 'hidden z-0'}`}
                      >
                        {/* Dark Overlay (Triggle) */}
                        {pageSettings.slidesOverlayEnabled && (
                          <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                        )}

                        {slide.link ? (
                          <a href={slide.link} className="block w-full h-full">
                            <img 
                              src={slide.url || "https://picsum.photos/seed/hero/1920/1080"} 
                              alt={slide.alt || "Hero Context"} 
                              title={slide.title || ""}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        ) : (
                          <img 
                            src={slide.url || "https://picsum.photos/seed/hero/1920/1080"} 
                            alt={slide.alt || "Hero Context"} 
                            title={slide.title || ""}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 z-20">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-lg">
                      {topSlides[heroIndex]?.title || "Le scelte migliori per te"}
                    </h2>
                    <p className="text-sm text-white/90 mb-4 font-bold drop-shadow-md">
                      {topSlides[heroIndex]?.alt || "Risparmia fino al 40% su tutta la tecnologia Vincent."}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full h-48 sm:h-64 overflow-hidden mb-8"
              >
                {pageSettings.categoryBanners[selectedCategory]?.link ? (
                  <a href={pageSettings.categoryBanners[selectedCategory].link} className="block w-full h-full">
                    <img 
                      src={pageSettings.categoryBanners[selectedCategory]?.url || `https://picsum.photos/seed/${selectedCategory.toLowerCase()}/1200/600`} 
                      alt={pageSettings.categoryBanners[selectedCategory]?.alt || selectedCategory}
                      title={pageSettings.categoryBanners[selectedCategory]?.title || selectedCategory}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </a>
                ) : (
                  <img 
                    src={pageSettings.categoryBanners[selectedCategory]?.url || `https://picsum.photos/seed/${selectedCategory.toLowerCase()}/1200/600`} 
                    alt={pageSettings.categoryBanners[selectedCategory]?.alt || selectedCategory}
                    title={pageSettings.categoryBanners[selectedCategory]?.title || selectedCategory}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/40 to-transparent flex flex-col justify-center px-6 sm:px-12 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-2">
                      {pageSettings.categoryBanners[selectedCategory]?.title || selectedCategory}
                    </h2>
                    <div className="w-16 h-1 bg-brand-yellow mb-4" />
                    <p className="text-white/80 font-bold text-sm max-w-md">
                      {pageSettings.categoryBanners[selectedCategory]?.alt || `Esplora la nostra selezione premium di prodotti per ${selectedCategory.toLowerCase()}. Qualità garantita BesPoint.`}
                    </p>
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* Global Filters Section (Universal Filters for all sections) */}
            <section className="px-4 mb-8">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                {/* Mobile Toggle / Desktop Header */}
                <div 
                  onClick={() => !isDesktop && setIsGlobalFiltersExpanded(!isGlobalFiltersExpanded)}
                  className={`p-4 sm:p-6 flex items-center justify-between cursor-pointer md:cursor-default ${!isDesktop && "hover:bg-gray-50 active:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-brand-yellow rounded-full"></div>
                    <p className="text-[11px] font-black uppercase text-brand-dark tracking-[0.2em] pointer-events-none">
                      {isDesktop ? "Affina la ricerca nel catalogo" : (isGlobalFiltersExpanded ? "Chiudi filtri avanzati" : "Affina la tua ricerca")}
                    </p>
                  </div>
                  {!isDesktop && (
                    <motion.div
                      animate={{ rotate: isGlobalFiltersExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-brand-yellow"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  )}
                </div>

                {/* Desktop Filters / Mobile Expanded Content */}
                <AnimatePresence>
                  {(isDesktop || isGlobalFiltersExpanded) && (
                    <motion.div
                      initial={isDesktop ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                      <div className="px-6 pb-8 md:pt-0 pt-2 flex flex-col md:flex-row items-center md:justify-between gap-6 border-t md:border-t-0 border-gray-50">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8 w-full md:w-auto">
                          {/* Brand Filter */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <label htmlFor="brand-global" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Filtra Marca:</label>
                            <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                              <select 
                                id="brand-global"
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 sm:py-2.5 pr-10 text-xs font-black text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm cursor-pointer transition-all"
                              >
                                <option value="Tutti">Tutti i Produttori</option>
                                {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort().map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-yellow">
                                <ChevronRight size={14} className="rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:block w-px h-6 bg-gray-100"></div>

                          {/* Sort Filter */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                            <label htmlFor="sort-global" className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ordina Risultati:</label>
                            <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
                              <select 
                                id="sort-global"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 sm:py-2.5 pr-10 text-xs font-black text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-sm cursor-pointer transition-all"
                              >
                                <option value="newest">Novità & Arrivi</option>
                                <option value="price-asc">Prezzo: decrescente</option>
                                <option value="price-desc">Prezzo: crescente</option>
                                <option value="rating">Migliori Recensioni</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-yellow">
                                <ChevronRight size={14} className="rotate-90" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Promo Horizontal Scroll */}
            {selectedCategory === "Tutti" && pageSettings.isQuickLinksEnabled && (
              <>
                <section className="px-4 mb-12">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-4"
                  >
                    <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">LE SCELTE MIGLIORI PER TE</h2>
                  </motion.div>
                  <div className="flex overflow-x-auto lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:h-[450px] no-scrollbar gap-4 pb-4">
                    {(pageSettings.linkRapidi || []).map((item: any, idx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 15, 
                          delay: idx * 0.1 
                        }}
                        key={item.id}
                        onClick={() => {
                          setSelectedCategory(item.category || "Tutti");
                          setSelectedSubcategory(item.subcategory || "Tutti");
                        }}
                        className={`${item.imageUrl ? 'bg-gray-800' : item.color} rounded-2xl p-4 h-40 lg:h-full min-w-[160px] sm:min-w-[200px] flex flex-col justify-between overflow-hidden relative group cursor-pointer flex-shrink-0 shadow-lg ${
                          idx === 0 ? "lg:col-span-4 lg:row-span-2" : 
                          idx === 1 ? "lg:col-span-4 lg:row-span-1" :
                          idx === 2 ? "lg:col-span-4 lg:row-span-1" :
                          idx === 3 ? "lg:col-span-2 lg:row-span-1" :
                          idx === 4 ? "lg:col-span-3 lg:row-span-1" :
                          idx === 5 ? "lg:col-span-3 lg:row-span-1" :
                          "lg:hidden"
                        }`}
                      >
                        {/* Background image if set */}
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {/* Dark overlay for readability */}
                        {item.imageUrl && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          className="z-10 relative"
                        >
                          <h3 className="text-white font-bold text-sm mb-1 drop-shadow-md">
                            {item.title}
                          </h3>
                          <p className={`${!item.imageUrl && item.color === "bg-brand-yellow" ? "text-brand-blue" : "text-brand-yellow"} text-[10px] font-bold drop-shadow-sm`}>
                            {item.subtitle}
                          </p>
                        </motion.div>
                        {!item.imageUrl && (
                          <motion.img 
                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                            animate={{ opacity: 0.5, scale: 1, rotate: 0 }}
                            transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                            src={`https://picsum.photos/seed/${item.seed}/300/300`} 
                            className="absolute right-[-20px] bottom-[-20px] w-24 h-24 object-cover rounded-full group-hover:scale-110 transition-transform" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </section>

                {pageSettings.isMiddleSlidesEnabled !== false && middleSlides.length > 0 && (
                  <SlideSection slides={middleSlides} darken={pageSettings.slidesOverlayEnabled} />
                )}
              </>
            )}

            {/* Vetrina (Featured) Section */}
            {selectedCategory === "Tutti" && searchQuery === "" && pageSettings.isFeaturedEnabled && featuredProducts.length > 0 && (
              <section className="px-4 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-brand-yellow rounded-full"></div>
                    <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">
                      {pageSettings.featuredTitle || "IN VETRINA"}
                    </h2>
                  </div>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product, index) => (
                    <ProductCard 
                      key={`featured-${product.id}`} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      reviews={productReviews}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Scelti Per Te (Special Promotion) Section */}
            {selectedCategory === "Tutti" && searchQuery === "" && pageSettings.isSpecialCategoryEnabled && specialCategoryProducts.length > 0 && (
              <section className="px-4 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">
                      {pageSettings.specialCategoryTitle || "SCELTI PER TE"}
                    </h2>
                  </div>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {specialCategoryProducts.map((product, index) => (
                    <ProductCard 
                      key={`special-${product.id}`} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      reviews={productReviews}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Product Grid Section (Ultimi Arrivi / Categoria / Ricerca) */}
            {(pageSettings.isNewArrivalsEnabled || selectedCategory !== "Tutti" || searchQuery !== "") && (
              <section className="px-4 relative z-10 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                >
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter leading-none">
                      {selectedCategory === "Tutti" ? (pageSettings.newArrivalsTitle || "NUOVI ARRIVI") : selectedCategory}
                    </h2>
                  </div>
                </motion.div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={() => handleProductSelect(product)} 
                      onAddToCart={addToCart}
                      index={index}
                      reviews={productReviews}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recensioni Clienti Section */}
            {selectedCategory === "Tutti" && searchQuery === "" && (
              <section className="px-4 mb-24 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 bg-brand-blue/5 text-brand-blue px-4 py-1.5 rounded-full mb-4">
                    <Star className="w-4 h-4 fill-brand-blue" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Feedback Verificati</span>
                  </div>
                  <h2 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-2 italic">Dicono di noi</h2>
                  <p className="text-gray-400 font-bold text-sm">La soddisfazione dei nostri clienti è la nostra priorità assoluta.</p>
                </motion.div>

                <div className="flex overflow-x-auto no-scrollbar gap-6 pb-8 snap-x">
                  {productReviews.filter(r => r.status === 'approved').length > 0 ? (
                    productReviews.filter(r => r.status === 'approved').slice(-6).reverse().map((rev, idx) => {
                      const product = PRODUCTS.find(p => p.id === rev.productId);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: 50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          key={rev.id} 
                          className="flex-shrink-0 w-[320px] bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-xl shadow-brand-dark/5 snap-center relative group"
                        >
                          <div className="absolute top-8 right-8 text-6xl font-black text-gray-50 opacity-50 select-none group-hover:text-brand-yellow/30 transition-colors">"</div>
                          
                          <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-100'}`} />
                            ))}
                          </div>

                          <p className="text-brand-dark font-bold text-sm leading-relaxed mb-8 italic relative z-10">
                            {rev.comment || "Recensione rilasciata senza commento testuale."}
                          </p>

                          <div className="flex items-center gap-4 mt-auto">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 p-1 shrink-0 overflow-hidden">
                              <img src={product?.image || "https://picsum.photos/seed/product/50/50"} alt="Prod" className="w-full h-full object-contain" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-black text-brand-dark text-xs uppercase tracking-tight truncate">{rev.customerName}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rev.date}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                      <div className="w-full py-20 text-center bg-white border border-dashed border-gray-200 rounded-[3rem]">
                        <p className="text-gray-300 font-black uppercase tracking-widest text-xs">Nessuna recensione ancora presente</p>
                      </div>
                  )}
                </div>

                <div className="mt-8 flex justify-center">
                   <div className="bg-brand-dark text-white px-8 py-4 rounded-2xl flex items-center gap-6 shadow-2xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Media Voto</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black italic">4.9/5.0</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-brand-yellow text-brand-yellow" />)}
                          </div>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-white/10"></div>
                      <div>
                         <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Google Business</span>
                         <p className="text-xs font-bold leading-tight uppercase tracking-tight">Prossimamente integrato</p>
                      </div>
                   </div>
                </div>
              </section>
            )}

            {selectedCategory === "Tutti" && pageSettings.isBottomSlidesEnabled !== false && bottomSlides.length > 0 && (
              <SlideSection slides={bottomSlides} darken={pageSettings.slidesOverlayEnabled} />
            )}

            {/* Parallax Floating Banner */}
            {selectedCategory === "Tutti" && (
              <section className="px-4 mb-16 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                >
                  <motion.div 
                    style={{ y: parallaxY }}
                    className="absolute inset-0 w-full h-[120%]"
                  >
                    <img 
                      src="https://picsum.photos/seed/parallax-tech/1200/800" 
                      alt="Parallax" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-brand-blue/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-8">
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-lg"
                    >
                      BESPOINT EXPERIENCE
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="text-white/90 font-bold max-w-md drop-shadow-md mb-6"
                    >
                      {companySettings.mission}
                    </motion.p>
                    <motion.button 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="bg-white text-brand-blue px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all transform hover:scale-105 shadow-xl"
                    >
                      Esplora il Brand
                    </motion.button>
                  </div>
                </motion.div>
              </section>
            )}

            {/* Footer */}
            <footer className="bg-brand-dark text-white pt-16 pb-32 px-6 no-print">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Company Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                      <span className="text-brand-dark font-black text-xl italic">{companySettings.logo}</span>
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter">{companySettings.name}</h1>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {companySettings.mission}
                  </p>
                  <div className="flex gap-4">
                    <a href={companySettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href={companySettings.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href={companySettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-bold mb-6 text-brand-yellow">Link Rapidi</h3>
                  <ul className="space-y-4 text-gray-400 text-sm">
                    <li className="hover:text-white cursor-pointer transition-colors">Chi Siamo</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Prodotti</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Offerte</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Lavora con noi</li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h3 className="text-lg font-bold mb-6 text-brand-yellow">Supporto</h3>
                  <ul className="space-y-4 text-gray-400 text-sm">
                    <li className="hover:text-white cursor-pointer transition-colors">Centro Assistenza</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Spedizioni</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Resi e Rimborsi</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Termini e Condizioni</li>
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-bold mb-6 text-brand-yellow">Contatti</h3>
                  <ul className="space-y-4 text-gray-400 text-sm">
                    <li className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-brand-blue" />
                      <span>{companySettings.legalAddress}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-brand-blue" />
                      <span>{companySettings.phone}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-brand-blue" />
                      <span>{companySettings.email}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-xs flex flex-col items-center gap-4">
                <p>© 2026 {companySettings.name}. Tutti i diritti riservati - {companySettings.legalName}</p>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-black hover:text-white transition-all opacity-20 hover:opacity-100"
                >
                  <Shield className="w-5 h-5" />
                </button>
              </div>
            </footer>
          </main>
        </>
      )}

      {/* Modals & Sheets — scheda prodotto solo nel storefront legacy (Next: StorefrontShell) */}
      {!hideStorefront && selectedProduct && (
        <ProductSheet 
          key={`product-sheet-${selectedProduct.id}`}
          product={selectedProduct} 
          onClose={() => {
            setSelectedProduct(null);
            handleProductSelect(null);
          }} 
          onAddToCart={addToCart}
          isDesktop={isDesktop}
          reviews={productReviews}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onShare={handleShare}
          onSelectProduct={handleProductSelect}
          allProducts={products}
        />
      )}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer 
            key="cart-drawer"
            items={cart} 
            onClose={() => setIsCartOpen(false)} 
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutSheet 
            onClose={() => setIsCheckoutOpen(false)} 
            items={cart}
            settings={paymentSettings}
            currentUser={currentUser}
            onAuthOpen={() => {
              setIsCheckoutOpen(false);
              setAuthStep('register');
              setIsAuthOpen(true);
            }}
            appOrders={orders}
            setAppOrders={setOrders}
            setCart={setCart}
            companySettings={companySettings}
            addToast={addToast}
            comuniList={comuniList}
            setCurrentUser={setCurrentUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <SideMenu 
          key="side-menu"
          isOpen={isSideMenuOpen} 
          onClose={() => setIsSideMenuOpen(false)} 
          onSelectCategory={handleCategorySelect}
          companySettings={companySettings}
          pageSettings={pageSettings}
          products={products}
          onOpenProfile={() => {
            if (currentUser) {
              setAuthStep('profile');
            } else {
              setAuthStep('email');
            }
            setIsAuthOpen(true);
          }}
          onOpenOrders={() => {
            if (currentUser) {
              setAuthStep('orders');
            } else {
              setAuthStep('email');
            }
            setIsAuthOpen(true);
          }}
          onLogout={logout}
        />
      </AnimatePresence>
        {/* CartSplash disattivato: usa icona fluttuante unica */ null}
        <AnimatePresence>
          {isAdminOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex bg-brand-dark/20 backdrop-blur-xl animate-in fade-in duration-500"
            >
              {/* Admin Container */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300, mass: 1 }}
                className="admin-panel-root flex flex-col md:flex-row w-full h-full bg-white shadow-2xl relative overflow-hidden"
              >
                {/* Mobile Admin Header */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white z-[60] safe-area-top">
                  <h3 className="font-black text-brand-dark uppercase tracking-tight text-base">Admin Panel</h3>
                  <button
                    type="button"
                    onClick={() => setIsMobileAdminMenuOpen(!isMobileAdminMenuOpen)}
                    className="h-11 w-11 flex items-center justify-center text-brand-dark hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                    aria-label={isMobileAdminMenuOpen ? 'Chiudi menu admin' : 'Apri menu admin'}
                  >
                    {isMobileAdminMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>

                {isMobileAdminMenuOpen && (
                  <button
                    type="button"
                    className="md:hidden fixed inset-0 top-14 bg-brand-dark/40 z-[50]"
                    aria-label="Chiudi menu"
                    onClick={() => setIsMobileAdminMenuOpen(false)}
                  />
                )}

            {/* Sidebar Menu */}
            <motion.div
              initial={false}
              animate={{
                width: isSidebarCollapsed ? 83 : 256,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className={`bg-gray-50 border-r border-gray-100 flex flex-col relative z-[55] h-full overflow-hidden flex-shrink-0
                max-md:fixed max-md:left-0 max-md:top-14 max-md:bottom-0 max-md:!w-[min(100vw,19rem)] max-md:max-h-[calc(100dvh-3.5rem)] max-md:shadow-2xl max-md:transition-transform max-md:duration-300 max-md:ease-out
                ${isMobileAdminMenuOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full max-md:pointer-events-none'}
                md:relative md:top-auto md:translate-x-0 md:pointer-events-auto md:max-h-none`}
            >
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-[43px] h-[43px] bg-white border-2 border-brand-yellow rounded-full items-center justify-center z-[70] hover:scale-110 transition-all group active:scale-95"
                  title={isSidebarCollapsed ? "Espandi Menu" : "Contrai Menu"}
                >
                  <div className="flex items-center justify-center mr-0.5">
                    {isSidebarCollapsed ? <Plus className="w-5 h-5 text-brand-dark rotate-45" /> : <ChevronLeft className="w-5 h-5 text-brand-dark" />}
                  </div>
                </button>

                <div className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-6'} mt-6 mb-10 overflow-hidden`}>
                  <div className="w-10 h-10 bg-brand-blue rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-brand-yellow" />
                  </div>
                  {!isSidebarCollapsed && (
                    <h3 className="font-black text-brand-dark uppercase tracking-tighter whitespace-nowrap">Admin Panel</h3>
                  )}
                </div>

                <nav className="space-y-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar max-md:overscroll-contain max-md:pb-2">
                  {[
                    { tab: 'dashboard', label: 'Panoramica', icon: Home, color: 'bg-brand-yellow text-brand-dark font-black shadow-sm' },
                    { tab: 'company', label: 'Azienda', icon: Grid, color: 'bg-brand-yellow text-brand-dark font-black' },
                    { tab: 'slides', label: 'Slide', icon: Play, color: 'bg-brand-yellow text-brand-dark' },
                    { tab: 'link_rapidi', label: 'Link Rapidi', icon: Box, color: 'bg-brand-yellow text-brand-dark' },
                    { tab: 'categories', label: 'Categorie', icon: Compass, color: 'bg-brand-yellow text-brand-dark' },
                    { tab: 'products', label: 'Prodotti', icon: Package, color: 'bg-brand-yellow text-brand-dark' },
                    { tab: 'image_linker', label: 'Bulk Images', icon: ImageIcon, color: 'bg-indigo-500 text-white' },
                    { tab: 'couriers', label: 'Corrieri', icon: Truck, color: 'bg-brand-yellow text-brand-dark' },
                    { tab: 'orders', label: 'Ordini', icon: ShoppingBag, color: 'bg-brand-blue text-white font-black' },
                    { tab: 'users', label: 'Archivio Utenti', icon: Users, color: 'bg-blue-600 text-white' },
                    { tab: 'returns', label: 'Gestione Resi', icon: RefreshCw, color: 'bg-red-500 text-white' },
                    { tab: 'seo', label: 'SEO & Google', icon: Globe, color: 'bg-indigo-700 text-white' },
                    { tab: 'analytics', label: 'Analytics', icon: BarChart2, color: 'bg-indigo-600 text-white' },
                    { tab: 'marketplaces', label: 'Marketplace', icon: Globe, color: 'bg-amber-600 text-white' },
                    { tab: 'payments', label: 'Pagamenti', icon: CreditCard, color: 'bg-green-600 text-white font-black' },
                    { tab: 'marketing', label: 'Marketing', icon: Target, color: 'bg-orange-500 text-white' },
                    /* Recensioni sospese */
                  ].map((item) => (
                    <div key={item.tab} className="px-3">
                      <button 
                        onClick={() => {
                          setAdminActiveTab(item.tab as any);
                          setIsMobileAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center max-md:gap-3 max-md:px-4 ${isSidebarCollapsed ? 'md:justify-center md:px-0 md:gap-0' : 'gap-3 px-4'} py-3.5 md:py-2.5 rounded-xl font-bold text-sm transition-all ${adminActiveTab === item.tab ? item.color : 'text-gray-400 hover:bg-gray-100/50'}`}
                        title={isSidebarCollapsed ? item.label : ''}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{item.label}</span>
                      </button>
                    </div>
                  ))}
                </nav>

                <button
                  type="button"
                  onClick={() => { setIsAdminOpen(false); setIsMobileAdminMenuOpen(false); if (hideStorefront) window.location.href = '/'; }}
                  className={`md:hidden shrink-0 mt-auto m-3 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-black text-sm uppercase tracking-wide text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-md border-2 border-red-700`}
                >
                  <X className="w-5 h-5 shrink-0" />
                  <span>Esci da Admin Panel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className={`hidden md:flex mt-auto w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all`}
                >
                  <X className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Esci</span>}
                </button>
            </motion.div>

              {/* Content Area */}
              <div className="admin-mobile-content flex-1 min-w-0 min-h-0 w-full overflow-y-auto overflow-x-hidden pt-[3.75rem] px-3 pb-8 md:pt-0 md:p-10 bg-gray-50/50 overscroll-contain">
                {adminActiveTab === 'dashboard' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Welcome & Command Bar Banner */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-400/25 text-brand-dark flex-shrink-0">
                          <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight uppercase">Bentornato nel Control Center</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Store Attivo
                            </span>
                          </div>
                          <p className="text-xs md:text-sm font-semibold text-gray-400">Panoramica strategica • Vendite in tempo reale, magazzino e spedizioni</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 relative z-10">
                        <button 
                          onClick={() => setAdminActiveTab('products')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-white hover:bg-black font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 hover:shadow-lg"
                        >
                          <Package className="w-4 h-4 text-brand-yellow" />
                          <span>+ Nuovo Prodotto</span>
                        </button>
                        <button 
                          onClick={() => setAdminActiveTab('orders')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 font-black text-xs uppercase tracking-wider transition-all active:scale-95"
                        >
                          <ShoppingBag className="w-4 h-4 text-indigo-600" />
                          <span>Tutti gli Ordini</span>
                        </button>
                        <div className="hidden xl:flex items-center gap-3 pl-3 border-l border-gray-100 text-right">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In tempo reale</p>
                            <p className="text-sm font-black text-brand-dark flex items-center gap-1.5 justify-end">
                              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                              38 Utenti Online
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-50/50 via-transparent to-transparent pointer-events-none"></div>
                    </div>

                    {/* 4 Dynamic Distinct Color Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* 1. Fatturato Totale - Warm Amber / Gold */}
                      <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-white p-7 rounded-[2.5rem] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group border border-amber-300/80 shadow-lg shadow-amber-500/5">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="p-3.5 bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950 rounded-2xl shadow-md shadow-amber-400/30 group-hover:rotate-12 transition-transform">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-950 border border-amber-300/70 shadow-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-amber-900" />
                            +18.4%
                          </span>
                        </div>
                        <div className="mt-6 relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">Fatturato Complessivo</p>
                          <h4 className="text-[32px] font-black tracking-tight text-amber-950">€128.430</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-amber-900/75">
                            <span>Target Mese: 88%</span>
                            <span className="font-black">€145.000</span>
                          </div>
                          <div className="w-full h-1.5 bg-amber-200/60 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full w-[88%]"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-amber-300/30 rounded-full blur-2xl pointer-events-none"></div>
                      </div>

                      {/* 2. Ordini Ricevuti - Electric Indigo / Cobalt */}
                      <div className="bg-gradient-to-br from-blue-500/10 via-indigo-100/30 to-white p-7 rounded-[2.5rem] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group border border-blue-300/80 shadow-lg shadow-blue-500/5">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl shadow-md shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-500/15 text-blue-900 border border-blue-300/70 shadow-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-800" />
                            +12.6%
                          </span>
                        </div>
                        <div className="mt-6 relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900/60 mb-1">Ordini Elaborati</p>
                          <h4 className="text-[32px] font-black tracking-tight text-indigo-950">1.243</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-indigo-900/75">
                            <span>In Transito Corrieri</span>
                            <span className="font-black text-indigo-600">34 ordini</span>
                          </div>
                          <div className="w-full h-1.5 bg-blue-200/60 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full w-[76%]"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-blue-300/30 rounded-full blur-2xl pointer-events-none"></div>
                      </div>

                      {/* 3. Resi & Assistenza - Rose / Crimson */}
                      <div className="bg-gradient-to-br from-rose-500/10 via-pink-100/30 to-white p-7 rounded-[2.5rem] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group border border-rose-300/80 shadow-lg shadow-rose-500/5">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="p-3.5 bg-gradient-to-tr from-rose-500 to-pink-500 text-white rounded-2xl shadow-md shadow-rose-500/30 group-hover:rotate-12 transition-transform">
                            <RefreshCw className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-300/70 shadow-sm flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-emerald-700" />
                            -5.2%
                          </span>
                        </div>
                        <div className="mt-6 relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-900/60 mb-1">Resi Gestiti</p>
                          <h4 className="text-[32px] font-black tracking-tight text-rose-950">12</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-rose-900/75">
                            <span>Tasso di Reso Store</span>
                            <span className="font-black text-emerald-600">0.9% (Ottimo)</span>
                          </div>
                          <div className="w-full h-1.5 bg-rose-200/60 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full w-[12%]"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-rose-300/30 rounded-full blur-2xl pointer-events-none"></div>
                      </div>

                      {/* 4. Nuovi Clienti - Emerald Mint */}
                      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-100/30 to-white p-7 rounded-[2.5rem] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group border border-emerald-300/80 shadow-lg shadow-emerald-500/5">
                        <div className="flex justify-between items-start relative z-10">
                          <div className="p-3.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl shadow-md shadow-emerald-500/30 group-hover:rotate-12 transition-transform">
                            <UserPlus className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-950 border border-emerald-300/70 shadow-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-800" />
                            +22.0%
                          </span>
                        </div>
                        <div className="mt-6 relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 mb-1">Clienti Registrati</p>
                          <h4 className="text-[32px] font-black tracking-tight text-emerald-950">342</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-900/75">
                            <span>Scontrino Medio</span>
                            <span className="font-black text-emerald-800">€103,50</span>
                          </div>
                          <div className="w-full h-1.5 bg-emerald-200/60 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[84%]"></div>
                          </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Main Analytics Row: Interactive Sales Chart + Top Visual Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Obsidian Glow Sales Trend Chart (Span 2) */}
                      <div className="lg:col-span-2 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-8 md:p-10 rounded-[3rem] border border-neutral-800 shadow-2xl relative overflow-hidden space-y-8 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-white">Andamento Vendite</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  Live Analytics
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-white/50 mt-1">Ricavi mensili distribuiti nell'anno fiscale corrente</p>
                            </div>

                            <div className="flex p-1 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                              {['Settimana', 'Mese', 'Anno'].map(t => (
                                <button key={t} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Mese' ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 shadow-md font-black' : 'text-white/60 hover:text-white font-bold'}`}>
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Chart Bars */}
                          <div className="h-72 flex items-end gap-2.5 sm:gap-3 px-2 sm:px-4 mt-8 relative z-10">
                            {[35, 45, 30, 75, 90, 65, 85, 40, 60, 95, 70, 80].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full justify-end">
                                <div className="w-full relative h-[85%] flex items-end">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="w-full bg-gradient-to-t from-amber-400/30 via-amber-400/80 to-yellow-300 rounded-2xl group-hover:from-amber-400/60 group-hover:to-yellow-200 transition-all duration-300 shadow-sm"
                                  />
                                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-neutral-900 border border-amber-400/50 text-amber-300 px-3 py-1.5 rounded-xl text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap scale-75 group-hover:scale-100 shadow-2xl z-20">
                                    €{(h * 1500).toLocaleString('it-IT')}
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter group-hover:text-amber-300 transition-colors">
                                  M{i+1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chart Bottom KPI Strip */}
                        <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Conversione</p>
                            <p className="text-sm sm:text-base font-black text-white flex items-center gap-1 mt-0.5">
                              <span className="text-emerald-400">3.84%</span>
                              <span className="text-[10px] text-white/40 font-bold">+0.6%</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Scontrino Medio</p>
                            <p className="text-sm sm:text-base font-black text-white mt-0.5">€103,30</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Spediti in 24h</p>
                            <p className="text-sm sm:text-base font-black text-white mt-0.5">98.2%</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Picco Mese</p>
                            <p className="text-sm sm:text-base font-black text-amber-400 mt-0.5">M10 (€142k)</p>
                          </div>
                        </div>

                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none"></div>
                      </div>

                      {/* Right Column: Visual Product Showcases with REAL IMAGES */}
                      <div className="space-y-6">
                        {/* Top Bestseller Products with Images */}
                        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5 relative overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-brand-dark">
                              <Sparkles className="w-5 h-5 text-amber-500" /> Top Venduti
                            </h3>
                            <button 
                              onClick={() => setAdminActiveTab('products')}
                              className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors"
                            >
                              Tutti &rarr;
                            </button>
                          </div>

                          <div className="space-y-3.5">
                            {(products && products.length >= 3 ? products.slice(0, 3) : PRODUCTS.slice(0, 3)).map((p, i) => {
                              const rankColors = [
                                'bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950 shadow-amber-400/30',
                                'bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-800 shadow-slate-300/30',
                                'bg-gradient-to-tr from-amber-700 to-amber-600 text-white shadow-amber-700/30'
                              ];
                              const salesCount = [432, 285, 219][i] || 150;
                              const trends = ['+28%', '+19%', '+14%'][i] || '+10%';

                              return (
                                <div 
                                  key={p.id || i}
                                  onClick={() => handleProductSelect(p)}
                                  className="group flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-amber-50/60 rounded-2xl border border-gray-100/80 hover:border-amber-200 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative flex-shrink-0">
                                      <img 
                                        src={p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'} 
                                        alt={p.name}
                                        className="w-13 h-13 rounded-xl object-cover border border-gray-200/80 shadow-sm group-hover:scale-105 transition-transform"
                                      />
                                      <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm ${rankColors[i] || rankColors[0]}`}>
                                        #{i + 1}
                                      </div>
                                    </div>
                                    <div className="min-w-0 pr-2">
                                      <p className="text-xs font-black text-brand-dark truncate group-hover:text-amber-900 transition-colors">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                        {p.category} • <span className="text-brand-dark font-black">€{Number(p.price || 0).toFixed(2)}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                      {trends}
                                    </span>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1">{salesCount} ordini</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Inventory & Actions Box with Images */}
                        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-brand-dark">
                              <AlertTriangle className="w-5 h-5 text-orange-500" /> Scorte & Attenzioni
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              Azione Rapida
                            </span>
                          </div>

                          <div className="space-y-3.5">
                            {(products && products.length >= 5 ? products.slice(3, 5) : PRODUCTS.slice(3, 5)).map((p, i) => (
                              <div key={p.id || i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img 
                                    src={p.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80'} 
                                    alt={p.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0"
                                  />
                                  <div className="min-w-0 pr-2">
                                    <p className="text-xs font-black text-brand-dark truncate">{p.name}</p>
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-0.5">
                                      {i === 0 ? 'Solo 3 pezzi rimasti' : 'Vendite basse (-40%)'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 flex-shrink-0">
                                  {i === 0 ? 'Rifornisci' : 'Sconto 20%'}
                                </span>
                              </div>
                            ))}

                            <button 
                              onClick={() => {
                                addToast("Campagna sconto strategico attivata sui prodotti a bassa rotazione!", "success");
                              }}
                              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Attiva Sconto Strategico -20%</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sales Channels & Fulfillment Logistics Strip */}
                    <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Distribuzione Canali di Vendita & Magazzino</h4>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">Aggiornato in tempo reale con i marketplace sincronizzati</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                          <p className="text-[10px] font-black uppercase tracking-wider text-amber-900/60">Vincent Direct Store</p>
                          <p className="text-xl font-black text-amber-950 mt-1">72% <span className="text-xs font-bold text-amber-900/70">(€92.470)</span></p>
                          <div className="w-full h-1.5 bg-amber-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full w-[72%]"></div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                          <p className="text-[10px] font-black uppercase tracking-wider text-blue-900/60">Amazon Brand Store</p>
                          <p className="text-xl font-black text-blue-950 mt-1">18% <span className="text-xs font-bold text-blue-900/70">(€23.117)</span></p>
                          <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full w-[18%]"></div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">Ebay & Partner Marketplace</p>
                          <p className="text-xl font-black text-emerald-950 mt-1">10% <span className="text-xs font-bold text-emerald-900/70">(€12.843)</span></p>
                          <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[10%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                                {adminActiveTab === 'company' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Configurazione Azienda</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-blue border-l-4 border-brand-yellow pl-3">Brand & Identity</h4>
                        
                        {/* Image Logo Upload */}
                        <div className="space-y-2">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Logo Aziendale (Rettangolo Orizzontale)</span>
                          <div className="flex gap-4 items-start">
                            <label className="flex-1 cursor-pointer group">
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-6 bg-gray-50 group-hover:bg-gray-100 group-hover:border-brand-yellow transition-all">
                                <Upload className="w-8 h-8 text-brand-blue mb-2" />
                                <span className="text-[10px] font-black uppercase text-gray-500">Seleziona Immagine Logo</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, (url) => setCompanySettings({...companySettings, imageLogo: url}))}
                                />
                              </div>
                            </label>
                            {companySettings.imageLogo && (
                              <div className="w-32 h-32 bg-white border border-gray-100 rounded-2xl p-2 flex items-center justify-center relative">
                                <img src={companySettings.imageLogo} className="max-w-full max-h-full object-contain" />
                                <button 
                                  onClick={() => setCompanySettings({...companySettings, imageLogo: ""})}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition-transform"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 font-bold italic leading-tight">
                            * Caricando un logo immagine, il Nome Brand e il Logo Testo verranno disabilitati nella barra superiore per far spazio alla grafica del logo.
                          </p>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-2">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Favicon (100x100px)</span>
                          <div className="flex gap-4 items-center">
                            <label className="flex-1 cursor-pointer group">
                              <div className="flex items-center gap-4 border-2 border-dashed border-gray-100 rounded-2xl px-6 py-4 bg-gray-50 group-hover:bg-gray-100 group-hover:border-brand-yellow transition-all">
                                <Camera className="w-6 h-6 text-brand-blue" />
                                <span className="text-[10px] font-black uppercase text-gray-500">Carica Favicon</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, (url) => setCompanySettings({...companySettings, favicon: url}))}
                                />
                              </div>
                            </label>
                            {companySettings.favicon && (
                              <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl p-1 flex items-center justify-center relative">
                                <img src={companySettings.favicon} className="w-full h-full object-contain rounded-lg" />
                                <button 
                                  onClick={() => setCompanySettings({...companySettings, favicon: ""})}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <label className={`block transition-opacity ${companySettings.imageLogo ? 'opacity-40' : 'opacity-100'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logo (Solo Testo)</span>
                            <input 
                              type="text" 
                              disabled={!!companySettings.imageLogo}
                              value={companySettings.logo}
                              onChange={(e) => setCompanySettings({...companySettings, logo: e.target.value})}
                              className={`mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow ${companySettings.imageLogo ? 'cursor-not-allowed' : ''}`}
                            />
                          </label>
                          <label className={`block transition-opacity ${companySettings.imageLogo ? 'opacity-40' : 'opacity-100'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Brand (Testo)</span>
                            <input 
                              type="text" 
                              disabled={!!companySettings.imageLogo}
                              value={companySettings.name}
                              onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                              className={`mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow ${companySettings.imageLogo ? 'cursor-not-allowed' : ''}`}
                            />
                          </label>
                        </div>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ragione Sociale</span>
                          <input 
                            type="text" 
                            value={companySettings.legalName}
                            onChange={(e) => setCompanySettings({...companySettings, legalName: e.target.value})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partita IVA</span>
                            <input 
                              type="text" 
                              value={companySettings.vatNumber || ''}
                              onChange={(e) => setCompanySettings({...companySettings, vatNumber: e.target.value})}
                              className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Codice Univoco (SDI)</span>
                            <input 
                              type="text" 
                              value={companySettings.sdiCode || ''}
                              onChange={(e) => setCompanySettings({...companySettings, sdiCode: e.target.value})}
                              className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow uppercase"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-blue border-l-4 border-brand-yellow pl-3">Contatti</h4>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sede Legale</span>
                          <input 
                            type="text" 
                            value={companySettings.legalAddress}
                            onChange={(e) => setCompanySettings({...companySettings, legalAddress: e.target.value})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Telefono</span>
                          <input 
                            type="text" 
                            value={companySettings.phone}
                            onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Email</span>
                          <input 
                            type="email" 
                            value={companySettings.email}
                            onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black uppercase tracking-widest text-brand-blue">Email Mittente Stato Ordine</span>
                          <input 
                            type="email" 
                            value={companySettings.orderStatusSenderEmail || ''}
                            onChange={(e) => setCompanySettings({...companySettings, orderStatusSenderEmail: e.target.value})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                            placeholder="es. ordini@iltuosito.it"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Mission & Bio */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-blue border-l-4 border-brand-yellow pl-3">Identità</h4>
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Mission Aziendale</span>
                        <textarea 
                          rows={3}
                          value={companySettings.mission}
                          onChange={(e) => setCompanySettings({...companySettings, mission: e.target.value})}
                          className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Link Bio / Social Linktree</span>
                        <input 
                          type="text" 
                          value={companySettings.bioLink}
                          onChange={(e) => setCompanySettings({...companySettings, bioLink: e.target.value})}
                          className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                        />
                      </label>
                    </div>

                    {/* Socials */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-blue border-l-4 border-brand-yellow pl-3">Social Media</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="block">
                          <span className="text-[10px] font-black uppercase text-gray-400">Facebook URL</span>
                          <input 
                            type="text" 
                            value={companySettings.socials.facebook}
                            onChange={(e) => setCompanySettings({...companySettings, socials: {...companySettings.socials, facebook: e.target.value}})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase text-gray-400">Instagram URL</span>
                          <input 
                            type="text" 
                            value={companySettings.socials.instagram}
                            onChange={(e) => setCompanySettings({...companySettings, socials: {...companySettings.socials, instagram: e.target.value}})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase text-gray-400">Twitter URL</span>
                          <input 
                            type="text" 
                            value={companySettings.socials.twitter}
                            onChange={(e) => setCompanySettings({...companySettings, socials: {...companySettings.socials, twitter: e.target.value}})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase text-gray-400">YouTube URL</span>
                          <input 
                            type="text" 
                            value={companySettings.socials.youtube}
                            onChange={(e) => setCompanySettings({...companySettings, socials: {...companySettings.socials, youtube: e.target.value}})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-black uppercase text-gray-400">TikTok URL</span>
                          <input 
                            type="text" 
                            value={companySettings.socials.tiktok}
                            onChange={(e) => setCompanySettings({...companySettings, socials: {...companySettings.socials, tiktok: e.target.value}})}
                            className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}



                {adminActiveTab === 'seo' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div>
                          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter leading-none mb-2">SEO & Indicizzazione</h2>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-yellow rounded-full" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ottimizzazione Motori di Ricerca & Google</p>
                          </div>
                       </div>
                       <button className="bg-neutral-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center gap-3">
                         <Globe className="w-5 h-5" />
                         <span>Invia Sitemap</span>
                       </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 space-y-8">
                          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100">
                             <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <Globe className="w-6 h-6 text-brand-blue" /> Configurazione Meta Tags Globali
                             </h3>
                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Title Default</label>
                                   <input type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all font-mono" placeholder="BesPoint | Il meglio del tech e della casa" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Description Default</label>
                                   <textarea className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all font-mono" rows={3}></textarea>
                                </div>
                             </div>
                          </div>

                          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100">
                             <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <Search className="w-6 h-6 text-brand-blue" /> Generatore Snippet URL Automatico
                             </h3>
                             <div className="p-8 bg-brand-dark rounded-[2.5rem] text-white space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Esempio Anteprima Google</p>
                                <p className="text-blue-400 text-sm font-bold">https://vincentstore.it/categoria/lampade-led</p>
                                <p className="text-lg font-black leading-tight uppercase">Lampade Led Minimal - BesPoint</p>
                                <p className="text-xs text-gray-400 leading-relaxed">Le migliori lampade led dal design unico... acquista ora su BesPoint con spedizione rapida.</p>
                             </div>
                             <div className="mt-8">
                                <button className="flex items-center gap-2 text-brand-blue font-black uppercase text-[10px] tracking-widest hover:text-brand-dark transition-colors">
                                   <Sparkles className="w-4 h-4" /> Rigenera tutti gli slug del catalogo
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-8">
                          <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-3">
                             <Activity className="w-6 h-6 text-green-500" /> Health Check SEO
                          </h3>
                          <div className="space-y-6">
                             {[
                               { label: 'Indice Google', val: '85%', color: 'bg-green-500' },
                               { label: 'Mobile Friendly', val: '100%', color: 'bg-green-500' },
                               { label: 'Pagine Duplicate', val: '0', color: 'bg-blue-500' },
                               { label: 'Link Rotti', val: '3', color: 'bg-orange-500' }
                             ].map((h, i) => (
                               <div key={i} className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-500 uppercase">{h.label}</span>
                                  <div className="flex items-center gap-3">
                                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${h.color}`} style={{ width: h.val === '100%' ? '100%' : h.val }}></div>
                                     </div>
                                     <span className="text-xs font-black text-brand-dark w-10 text-right">{h.val}</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                          <div className="pt-6 border-t border-gray-50">
                             <p className="text-[9px] font-bold text-gray-400 uppercase italic">Ultima scansione: Oggi, 04:30 AM</p>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'slides' && (
                  <div className="w-full">
                    <div className="space-y-8">
                    
                    {/* Top Bar Configurator */}
                    <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-8 mb-12">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-3">
                            <Monitor className="w-6 h-6 text-brand-blue" /> Configurazione Top Bar (1920x40px)
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personalizza il testo e l'immagine della barra superiore</p>
                        </div>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 self-start">
                          {(['static', 'marquee', 'image'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setPageSettings({ ...pageSettings, topBarMode: mode })}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(pageSettings.topBarMode ?? 'static') === mode ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              {mode === 'static' ? 'Testo Fisso' : mode === 'marquee' ? 'Scorrimento' : 'Immagine'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {(pageSettings.topBarMode ?? 'static') === 'static' && (
                          <>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Testo Sinistra</label>
                               <input 
                                 type="text" 
                                 value={pageSettings.topBarLeftText}
                                 onChange={(e) => setPageSettings({ ...pageSettings, topBarLeftText: e.target.value })}
                                 className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all"
                                 placeholder="Es: Consegna a Massimo - Roma"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Testo Destra</label>
                               <input 
                                 type="text" 
                                 value={pageSettings.topBarRightText}
                                 onChange={(e) => setPageSettings({ ...pageSettings, topBarRightText: e.target.value })}
                                 className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all"
                                 placeholder="Es: Aiuto Resi e Ordini"
                               />
                            </div>
                          </>
                        )}

                        {(pageSettings.topBarMode ?? 'static') === 'marquee' && (
                          <div className="col-span-2 space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Testo a Scorrimento</label>
                               <textarea 
                                 value={pageSettings.topBarMarqueeText}
                                 onChange={(e) => setPageSettings({ ...pageSettings, topBarMarqueeText: e.target.value })}
                                 className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all whitespace-pre-wrap"
                                 rows={2}
                                 placeholder="Inserisci il testo che scorrerà..."
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-1 text-center block">Velocità Scorrimento (Lento - Veloce)</label>
                               <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-black text-gray-400">Lento</span>
                                 <input 
                                   type="range" 
                                   min="5" 
                                   max="60" 
                                   step="1"
                                   value={70 - pageSettings.topBarMarqueeSpeed} 
                                   onChange={(e) => setPageSettings({ ...pageSettings, topBarMarqueeSpeed: 70 - parseInt(e.target.value) })}
                                   className="flex-1 accent-brand-yellow" 
                                 />
                                 <span className="text-[10px] font-black text-gray-400">Veloce</span>
                                 <span className="bg-brand-blue text-white px-3 py-1 rounded-lg text-[10px] font-black">{Math.round(100 / (pageSettings.topBarMarqueeSpeed / 10))}%</span>
                               </div>
                            </div>
                          </div>
                        )}

                        {(pageSettings.topBarMode ?? 'static') === 'image' && (
                          <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Immagine Top Bar (Dimensioni: 1920x40px)</label>
                               <div className="flex gap-4">
                                  <input 
                                    type="text" 
                                    value={pageSettings.topBarImage}
                                    onChange={(e) => setPageSettings({ ...pageSettings, topBarImage: e.target.value })}
                                    className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-brand-dark focus:border-brand-yellow focus:bg-white transition-all"
                                    placeholder="https://..."
                                  />
                                  <label className="cursor-pointer bg-neutral-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-orange transition-all flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    <span>Carica</span>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(e, (url) => setPageSettings({ ...pageSettings, topBarImage: url }))}
                                    />
                                  </label>
                               </div>
                            </div>
                            {pageSettings.topBarImage && (
                              <div className="w-full h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                <img src={pageSettings.topBarImage} className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-900 overflow-hidden">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 py-2 border-b border-gray-800">Anteprima top bar (40px)</p>
                        <div className="h-10 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 text-white overflow-hidden relative">
                          {(pageSettings.topBarMode ?? 'static') === 'image' && pageSettings.topBarImage ? (
                            <img src={pageSettings.topBarImage} alt="" className="w-full h-full object-cover object-center" />
                          ) : (pageSettings.topBarMode ?? 'static') === 'marquee' ? (
                            <div className="marquee-topbar h-full w-full overflow-hidden flex items-center">
                              <div
                                className="marquee-topbar-track text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{ animationDuration: `${Math.max(8, Number(pageSettings.topBarMarqueeSpeed) || 30)}s` }}
                              >
                                <span className="px-8">{pageSettings.topBarMarqueeText || 'Testo scorrimento…'}</span>
                                <span className="px-8" aria-hidden="true">{pageSettings.topBarMarqueeText || 'Testo scorrimento…'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full px-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="opacity-80 truncate max-w-[45%]">{pageSettings.topBarLeftText || 'Testo sinistra'}</span>
                              <span className="opacity-80 truncate max-w-[45%] text-right">{pageSettings.topBarRightText || 'Testo destra'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">GESTIONE SLIDE</h2>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scura Slide</span>
                          <button 
                            onClick={() => setPageSettings({ ...pageSettings, slidesOverlayEnabled: !pageSettings.slidesOverlayEnabled })}
                            className={`w-12 h-6 rounded-full transition-all relative ${pageSettings.slidesOverlayEnabled ? 'bg-brand-blue' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pageSettings.slidesOverlayEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newSlides: any[] = [];
                          const categories = pageSettings.categories.filter(c => c !== "Tutti");
                          
                          // Only one Top Slide (first category)
                          if (categories.length > 0) {
                            const cat = categories[0];
                            newSlides.push({ 
                              id: `top-${cat}-${Date.now()}`, 
                              url: `https://picsum.photos/seed/${cat.toLowerCase()}-top/1920/1080`, 
                              alt: `Scopri ${cat}`, 
                              title: cat, 
                              link: "", 
                              position: "home_top" 
                            });
                          }

                          categories.forEach(cat => {
                            newSlides.push({ 
                              id: `mid-${cat}-${Date.now()}`, 
                              url: `https://picsum.photos/seed/${cat.toLowerCase()}-mid/1920/600`, 
                              alt: `Offerte ${cat}`, 
                              title: `Specialisti in ${cat}`, 
                              link: "", 
                              position: "home_middle" 
                            });
                            newSlides.push({ 
                              id: `bot-${cat}-${Date.now()}`, 
                              url: `https://picsum.photos/seed/${cat.toLowerCase()}-bot/1920/600`, 
                              alt: `Qualità ${cat}`, 
                              title: `Il meglio di ${cat}`, 
                              link: "", 
                              position: "home_bottom" 
                            });
                          });
                          setPageSettings({ ...pageSettings, homeSlides: newSlides });
                        }}
                        className="bg-brand-blue text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all active:scale-95"
                      >
                        Genera Slide per Categoria
                      </button>
                    </div>

                    {/* Home Slides Management */}
                    <div className="space-y-6">
                                    <div className="admin-slides-block bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                          <h3 className="text-sm md:text-lg font-light md:font-black text-neutral-900 md:text-brand-dark uppercase tracking-[0.14em] md:tracking-tighter flex items-center gap-2">
                            <span className="w-1 h-5 md:w-1.5 md:h-6 bg-brand-yellow rounded-full"></span>
                            Slide Top (Hero) <span className="text-neutral-400 md:text-brand-blue text-[10px] md:text-xs ml-2">1920×1080</span>
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button
                              type="button"
                              title={pageSettings.isHeroEnabled !== false ? 'Nascondi hero dalla home' : 'Mostra hero in home'}
                              onClick={() => setPageSettings({ ...pageSettings, isHeroEnabled: pageSettings.isHeroEnabled === false })}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${pageSettings.isHeroEnabled !== false ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}
                            >
                              {pageSettings.isHeroEnabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{pageSettings.isHeroEnabled !== false ? 'Visibile' : 'Nascosta'}</span>
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
                            <div className="flex items-center">
                              <button 
                                onClick={() => setAdminTopIdx(prev => Math.max(0, prev - 1))}
                                disabled={adminTopIdx === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="px-3 min-w-[60px] text-center">
                                <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-none">
                                  {adminTopSlides.length > 0 ? `${adminTopIdx + 1} / ${adminTopSlides.length}` : '0 / 0'}
                                </span>
                              </div>
                              <button 
                                onClick={() => setAdminTopIdx(prev => Math.min(adminTopSlides.length - 1, prev + 1))}
                                disabled={adminTopIdx >= adminTopSlides.length - 1 || adminTopSlides.length === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            
                            <button 
                              onClick={() => {
                                const newId = Date.now().toString();
                                setPageSettings({
                                  ...pageSettings,
                                  homeSlides: [...pageSettings.homeSlides, { id: newId, url: "", alt: "", title: "", link: "", position: "home_top" }]
                                });
                                setAdminTopIdx(adminTopSlides.length);
                              }}
                              className="p-2 bg-brand-yellow text-brand-dark rounded-xl hover:bg-brand-orange transition-all active:scale-90"
                              title="Aggiungi Slide"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            
                          </div>
                        </div>

                        <AdminSlidePickerList
                          slides={adminTopSlides}
                          activeIdx={adminTopIdx}
                          setActiveIdx={setAdminTopIdx}
                          deleteTypeLabel="Hero"
                          position="home_top"
                          setSlideToDelete={setSlideToDelete}
                        />
                        
                        <div className="grid grid-cols-1 gap-4">
                          {adminTopSlides.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                              <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nessuna slide top configurata</p>
                              <button 
                                onClick={() => {
                                  const newId = Date.now().toString();
                                  setPageSettings({
                                    ...pageSettings,
                                    homeSlides: [...pageSettings.homeSlides, { id: newId, url: "", alt: "", title: "", link: "", position: "home_top" }]
                                  });
                                  setAdminTopIdx(0);
                                }}
                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-blue border-b border-brand-blue"
                              >
                                Crea la prima slide
                              </button>
                            </div>
                          ) : (
                            <div key={adminTopSlides[adminTopIdx]?.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-right-2 duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Sorgente Immagine</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={adminTopSlides[adminTopIdx]?.url || ""}
                                        onChange={(e) => {
                                          const slideId = adminTopSlides[adminTopIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: e.target.value } : s)
                                          });
                                        }}
                                        className="flex-1 bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="https://..."
                                      />
                                      <label className="cursor-pointer bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Upload className="w-5 h-5 text-brand-blue" />
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={(e) => handleFileChange(e, (url) => {
                                            const slideId = adminTopSlides[adminTopIdx].id;
                                            setPageSettings({
                                              ...pageSettings,
                                              homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: url } : s)
                                            });
                                          })}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Link Destinazione</label>
                                    <input 
                                      type="text" 
                                      value={adminTopSlides[adminTopIdx]?.link || ""}
                                      onChange={(e) => {
                                        const slideId = adminTopSlides[adminTopIdx].id;
                                        setPageSettings({
                                          ...pageSettings,
                                          homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, link: e.target.value } : s)
                                        });
                                      }}
                                      className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      placeholder="/categoria/..."
                                    />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Titolo SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminTopSlides[adminTopIdx]?.title || ""}
                                        onChange={(e) => {
                                          const slideId = adminTopSlides[adminTopIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, title: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Alt Text SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminTopSlides[adminTopIdx]?.alt || ""}
                                        onChange={(e) => {
                                          const slideId = adminTopSlides[adminTopIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, alt: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                  </div>
                                  {adminTopSlides[adminTopIdx]?.url && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white bg-white group-hover:scale-[1.01] transition-transform">
                                      <img src={adminTopSlides[adminTopIdx].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                      </div>
                    </div>

                    {/* MIDDLE SLIDES */}
                      <div className="admin-slides-block bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                          <h3 className="text-sm md:text-lg font-light md:font-black text-neutral-900 md:text-brand-dark uppercase tracking-[0.14em] md:tracking-tighter flex items-center gap-2">
                            <span className="w-1 h-5 md:w-1.5 md:h-6 bg-brand-blue rounded-full"></span>
                            Slide Middle <span className="text-neutral-400 md:text-brand-dark text-[10px] md:text-xs ml-2">1920×600</span>
                          </h3>
                          
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button
                              type="button"
                              title={pageSettings.isMiddleSlidesEnabled !== false ? 'Nascondi slide middle dalla home' : 'Mostra slide middle in home'}
                              onClick={() => setPageSettings({
                                ...pageSettings,
                                isMiddleSlidesEnabled: pageSettings.isMiddleSlidesEnabled === false,
                              })}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${pageSettings.isMiddleSlidesEnabled !== false ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}
                            >
                              {pageSettings.isMiddleSlidesEnabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{pageSettings.isMiddleSlidesEnabled !== false ? 'Visibile' : 'Nascosta'}</span>
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <div className="flex items-center">
                              <button 
                                onClick={() => setAdminMidIdx(prev => Math.max(0, prev - 1))}
                                disabled={adminMidIdx === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="px-3 min-w-[60px] text-center">
                                <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-none">
                                  {adminMidSlides.length > 0 ? `${adminMidIdx + 1} / ${adminMidSlides.length}` : '0 / 0'}
                                </span>
                              </div>
                              <button 
                                onClick={() => setAdminMidIdx(prev => Math.min(adminMidSlides.length - 1, prev + 1))}
                                disabled={adminMidIdx >= adminMidSlides.length - 1 || adminMidSlides.length === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            
                            <button 
                              onClick={() => {
                                const newId = Date.now().toString();
                                setPageSettings({
                                  ...pageSettings,
                                  homeSlides: [...pageSettings.homeSlides, { id: newId, url: "", alt: "", title: "", link: "", position: "home_middle" }]
                                });
                                setAdminMidIdx(adminMidSlides.length);
                              }}
                              className="p-2 bg-brand-yellow text-brand-dark rounded-xl hover:bg-brand-orange transition-all active:scale-90"
                              title="Aggiungi Slide"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            
                          </div>
                        </div>

                        <AdminSlidePickerList
                          slides={adminMidSlides}
                          activeIdx={adminMidIdx}
                          setActiveIdx={setAdminMidIdx}
                          deleteTypeLabel="Middle"
                          position="home_middle"
                          setSlideToDelete={setSlideToDelete}
                        />
                        
                        <div className="grid grid-cols-1 gap-4">
                          {adminMidSlides.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                              <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nessuna slide middle configurata</p>
                            </div>
                          ) : (
                            <div key={adminMidSlides[adminMidIdx]?.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-right-2 duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Sorgente Immagine</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={adminMidSlides[adminMidIdx]?.url || ""}
                                        onChange={(e) => {
                                          const slideId = adminMidSlides[adminMidIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: e.target.value } : s)
                                          });
                                          }}
                                        className="flex-1 bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="https://..."
                                      />
                                      <label className="cursor-pointer bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Upload className="w-5 h-5 text-brand-blue" />
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={(e) => handleFileChange(e, (url) => {
                                            const slideId = adminMidSlides[adminMidIdx].id;
                                            setPageSettings({
                                              ...pageSettings,
                                              homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: url } : s)
                                            });
                                          })}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Link Destinazione</label>
                                    <input 
                                      type="text" 
                                      value={adminMidSlides[adminMidIdx]?.link || ""}
                                      onChange={(e) => {
                                        const slideId = adminMidSlides[adminMidIdx].id;
                                        setPageSettings({
                                          ...pageSettings,
                                          homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, link: e.target.value } : s)
                                        });
                                      }}
                                      className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      placeholder="/categoria/..."
                                    />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Titolo SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminMidSlides[adminMidIdx]?.title || ""}
                                        onChange={(e) => {
                                          const slideId = adminMidSlides[adminMidIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, title: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Alt Text SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminMidSlides[adminMidIdx]?.alt || ""}
                                        onChange={(e) => {
                                          const slideId = adminMidSlides[adminMidIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, alt: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                  </div>
                                  {adminMidSlides[adminMidIdx]?.url && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white bg-white group-hover:scale-[1.01] transition-transform">
                                      <img src={adminMidSlides[adminMidIdx].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            )
                          }
                        </div>
                      </div>

                      {/* BOTTOM SLIDES */}
                      <div className="admin-slides-block bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                          <h3 className="text-sm md:text-lg font-light md:font-black text-neutral-900 md:text-brand-dark uppercase tracking-[0.14em] md:tracking-tighter flex items-center gap-2">
                            <span className="w-1 h-5 md:w-1.5 md:h-6 bg-red-500 rounded-full"></span>
                            Slide Bottom <span className="text-neutral-400 md:text-red-500 text-[10px] md:text-xs ml-2">1920×600</span>
                          </h3>
                          
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button
                              type="button"
                              title={pageSettings.isBottomSlidesEnabled !== false ? 'Nascondi slide bottom dalla home' : 'Mostra slide bottom in home'}
                              onClick={() => setPageSettings({
                                ...pageSettings,
                                isBottomSlidesEnabled: pageSettings.isBottomSlidesEnabled === false,
                              })}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${pageSettings.isBottomSlidesEnabled !== false ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}
                            >
                              {pageSettings.isBottomSlidesEnabled !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{pageSettings.isBottomSlidesEnabled !== false ? 'Visibile' : 'Nascosta'}</span>
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <div className="flex items-center">
                              <button 
                                onClick={() => setAdminBotIdx(prev => Math.max(0, prev - 1))}
                                disabled={adminBotIdx === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="px-3 min-w-[60px] text-center">
                                <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-none">
                                  {adminBotSlides.length > 0 ? `${adminBotIdx + 1} / ${adminBotSlides.length}` : '0 / 0'}
                                </span>
                              </div>
                              <button 
                                onClick={() => setAdminBotIdx(prev => Math.min(adminBotSlides.length - 1, prev + 1))}
                                disabled={adminBotIdx >= adminBotSlides.length - 1 || adminBotSlides.length === 0}
                                className="p-2 text-brand-dark hover:bg-white rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            
                            <button 
                              onClick={() => {
                                const newId = Date.now().toString();
                                setPageSettings({
                                  ...pageSettings,
                                  homeSlides: [...pageSettings.homeSlides, { id: newId, url: "", alt: "", title: "", link: "", position: "home_bottom" }]
                                });
                                setAdminBotIdx(adminBotSlides.length);
                              }}
                              className="p-2 bg-brand-yellow text-brand-dark rounded-xl hover:bg-brand-orange transition-all active:scale-90"
                              title="Aggiungi Slide"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            
                          </div>
                        </div>

                        <AdminSlidePickerList
                          slides={adminBotSlides}
                          activeIdx={adminBotIdx}
                          setActiveIdx={setAdminBotIdx}
                          deleteTypeLabel="Bottom"
                          position="home_bottom"
                          setSlideToDelete={setSlideToDelete}
                        />
                        
                        <div className="grid grid-cols-1 gap-4">
                          {adminBotSlides.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                              <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nessuna slide bottom configurata</p>
                            </div>
                          ) : (
                            <div key={adminBotSlides[adminBotIdx]?.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-right-2 duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Sorgente Immagine</label>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={adminBotSlides[adminBotIdx]?.url || ""}
                                        onChange={(e) => {
                                          const slideId = adminBotSlides[adminBotIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: e.target.value } : s)
                                          });
                                          }}
                                        className="flex-1 bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                        placeholder="https://..."
                                      />
                                      <label className="cursor-pointer bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Upload className="w-5 h-5 text-brand-blue" />
                                        <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={(e) => handleFileChange(e, (url) => {
                                            const slideId = adminBotSlides[adminBotIdx].id;
                                            setPageSettings({
                                              ...pageSettings,
                                              homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, url: url } : s)
                                            });
                                          })}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Link Destinazione</label>
                                    <input 
                                      type="text" 
                                      value={adminBotSlides[adminBotIdx]?.link || ""}
                                      onChange={(e) => {
                                        const slideId = adminBotSlides[adminBotIdx].id;
                                        setPageSettings({
                                          ...pageSettings,
                                          homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, link: e.target.value } : s)
                                        });
                                      }}
                                      className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      placeholder="/categoria/..."
                                    />
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Titolo SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminBotSlides[adminBotIdx]?.title || ""}
                                        onChange={(e) => {
                                          const slideId = adminBotSlides[adminBotIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, title: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Alt Text SEO</label>
                                      <input 
                                        type="text" 
                                        value={adminBotSlides[adminBotIdx]?.alt || ""}
                                        onChange={(e) => {
                                          const slideId = adminBotSlides[adminBotIdx].id;
                                          setPageSettings({
                                            ...pageSettings,
                                            homeSlides: pageSettings.homeSlides.map((s: any) => s.id === slideId ? { ...s, alt: e.target.value } : s)
                                          });
                                        }}
                                        className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue"
                                      />
                                    </div>
                                  </div>
                                  {adminBotSlides[adminBotIdx]?.url && (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white bg-white group-hover:scale-[1.01] transition-transform">
                                      <img src={adminBotSlides[adminBotIdx].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            )
                          }
                        </div>
                      </div>

                    <div className="space-y-5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-l-4 border-brand-yellow pl-3">Banner Categorie</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {Object.keys(pageSettings.categoryBanners).map((catName) => (
                          <div key={catName} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group hover:border-brand-yellow transition-all">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                              <h5 className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-4 bg-brand-yellow rounded-full"></span>
                                {catName}
                              </h5>
                              <span className="text-[8px] font-black uppercase bg-brand-yellow/20 text-brand-dark px-2 py-1 rounded-md">
                                Banner Home Categoria
                              </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between ml-1">
                                    <span className="text-[8px] font-black uppercase text-gray-400">Sorgente Immagine</span>
                                    <div className="flex gap-2">
                                      <label className="cursor-pointer flex items-center gap-1 text-[8px] font-black uppercase text-brand-blue hover:text-brand-dark transition-colors">
                                        <Upload className="w-2.5 h-2.5" />
                                        <span>Carica</span>
                                        <input 
                                          type="file" 
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleFileChange(e, (url) => {
                                            setPageSettings({
                                              ...pageSettings,
                                              categoryBanners: {
                                                ...pageSettings.categoryBanners,
                                                [catName]: { ...pageSettings.categoryBanners[catName], url: url }
                                              }
                                            });
                                          })}
                                        />
                                      </label>
                                      <label className="cursor-pointer flex items-center gap-1 text-[8px] font-black uppercase text-brand-blue hover:text-brand-dark transition-colors">
                                        <Camera className="w-2.5 h-2.5" />
                                        <span>Foto</span>
                                        <input 
                                          type="file" 
                                          accept="image/*"
                                          capture="environment"
                                          className="hidden"
                                          onChange={(e) => handleFileChange(e, (url) => {
                                            setPageSettings({
                                              ...pageSettings,
                                              categoryBanners: {
                                                ...pageSettings.categoryBanners,
                                                [catName]: { ...pageSettings.categoryBanners[catName], url: url }
                                              }
                                            });
                                          })}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={pageSettings.categoryBanners[catName].url}
                                    onChange={(e) => setPageSettings({
                                      ...pageSettings,
                                      categoryBanners: {
                                        ...pageSettings.categoryBanners,
                                        [catName]: { ...pageSettings.categoryBanners[catName], url: e.target.value }
                                      }
                                    })}
                                    placeholder="https://..."
                                    className="block w-full bg-white border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Link Destinazione (Opzionale)</label>
                                  <input 
                                    type="text" 
                                    value={pageSettings.categoryBanners[catName].link || ""}
                                    onChange={(e) => setPageSettings({
                                      ...pageSettings,
                                      categoryBanners: {
                                        ...pageSettings.categoryBanners,
                                        [catName]: { ...pageSettings.categoryBanners[catName], link: e.target.value }
                                      }
                                    })}
                                    className="block w-full bg-white border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                    placeholder="/categoria/..."
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Titolo SEO</label>
                                    <input 
                                      type="text" 
                                      value={pageSettings.categoryBanners[catName].title}
                                      onChange={(e) => setPageSettings({
                                        ...pageSettings,
                                        categoryBanners: {
                                          ...pageSettings.categoryBanners,
                                          [catName]: { ...pageSettings.categoryBanners[catName], title: e.target.value }
                                        }
                                      })}
                                      className="block w-full bg-white border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">Alt Text SEO</label>
                                    <input 
                                      type="text" 
                                      value={pageSettings.categoryBanners[catName].alt}
                                      onChange={(e) => setPageSettings({
                                        ...pageSettings,
                                        categoryBanners: {
                                          ...pageSettings.categoryBanners,
                                          [catName]: { ...pageSettings.categoryBanners[catName], alt: e.target.value }
                                        }
                                      })}
                                      className="block w-full bg-white border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                    />
                                  </div>
                                </div>
                                {pageSettings.categoryBanners[catName].url && (
                                  <div className="w-full h-24 rounded-2xl overflow-hidden border-2 border-gray-100 bg-white group-hover:scale-[1.02] transition-transform">
                                    <img src={pageSettings.categoryBanners[catName].url} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {adminActiveTab === 'categories' && (
                  <AdminCategoriesSection
                    pageSettings={pageSettings}
                    setPageSettings={setPageSettings}
                    products={products}
                    setProducts={setProducts}
                    categoryFilterSearch={categoryFilterSearch}
                    setCategoryFilterSearch={setCategoryFilterSearch}
                    isAddingCategory={isAddingCategory}
                    setIsAddingCategory={setIsAddingCategory}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    collapsedCategories={collapsedCategories}
                    setCollapsedCategories={setCollapsedCategories}
                    editingCategory={editingCategory}
                    setEditingCategory={setEditingCategory}
                    editCategoryValue={editCategoryValue}
                    setEditCategoryValue={setEditCategoryValue}
                    addingSubcategoryTo={addingSubcategoryTo}
                    setAddingSubcategoryTo={setAddingSubcategoryTo}
                    newSubcategoryName={newSubcategoryName}
                    setNewSubcategoryName={setNewSubcategoryName}
                    editingSubcategory={editingSubcategory}
                    setEditingSubcategory={setEditingSubcategory}
                    editSubcategoryValue={editSubcategoryValue}
                    setEditSubcategoryValue={setEditSubcategoryValue}
                    addToast={addToast}
                    getProductCount={getProductCount}
                    setAdminConfirmAction={setAdminConfirmAction}
                  />
                )}
                {adminActiveTab === ('link_rapidi' as any) && (
                   <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                     <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${pageSettings.isQuickLinksEnabled ? 'bg-brand-yellow' : 'bg-gray-100'}`}>
                           <Box className={`w-7 h-7 ${pageSettings.isQuickLinksEnabled ? 'text-brand-dark' : 'text-gray-400'}`} />
                         </div>
                         <div>
                           <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Sezione Link Rapidi</h2>
                           <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Gestisci la visibilità e il contenuto dei Promo Box in Homepage</p>
                         </div>
                       </div>
                       
                       <label className="flex items-center cursor-pointer group">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={pageSettings.isQuickLinksEnabled}
                              onChange={() => setPageSettings({ ...pageSettings, isQuickLinksEnabled: !pageSettings.isQuickLinksEnabled })}
                            />
                            <div className={`w-20 h-10 rounded-full transition-all duration-300 border-2 ${pageSettings.isQuickLinksEnabled ? 'bg-brand-yellow border-brand-yellow' : 'bg-gray-100 border-gray-200'}`}></div>
                            <div className={`absolute top-2 w-6 h-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg ${pageSettings.isQuickLinksEnabled ? 'left-12 bg-white' : 'left-2 bg-gray-400'}`}>
                              {pageSettings.isQuickLinksEnabled ? <Check className="w-4 h-4 text-brand-yellow" /> : <X className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                          <span className={`ml-4 text-xs font-black uppercase tracking-widest transition-colors ${pageSettings.isQuickLinksEnabled ? 'text-brand-dark' : 'text-gray-400'}`}>
                            {pageSettings.isQuickLinksEnabled ? 'Attivato' : 'Nascosto'}
                          </span>
                       </label>
                     </div>

                     <div className="flex justify-between items-center">
                       <h2 className="text-xl font-black text-brand-dark uppercase tracking-tighter ml-6">Personalizzazione Box</h2>
                       <button 
                        onClick={() => {
                          const newId = Date.now().toString();
                          setPageSettings({
                            ...pageSettings,
                            linkRapidi: [...(pageSettings.linkRapidi || []), { 
                              id: newId, 
                              title: "Nuovo Link", 
                              subtitle: "Sottotitolo", 
                              color: "bg-brand-blue", 
                              seed: "new-" + newId,
                              category: "Tutti",
                              subcategory: "Tutti"
                            }]
                          });
                        }}
                        className="bg-neutral-950 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-orange transition-all flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> Aggiungi Box
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(pageSettings.linkRapidi || []).map((item: any, idx: number) => (
                        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 space-y-4 hover:bg-gray-50 transition-all group overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center`}>
                              <Box className="w-6 h-6 text-white" />
                            </div>
                            <button 
                              onClick={() => {
                                setPageSettings({
                                  ...pageSettings,
                                  linkRapidi: pageSettings.linkRapidi.filter((l: any) => l.id !== item.id)
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Titolo</span>
                              <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const newLinks = [...pageSettings.linkRapidi];
                                  newLinks[idx] = { ...item, title: e.target.value };
                                  setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                }}
                                className="mt-1 block w-full bg-gray-50 border-transparent rounded-xl px-4 py-2 text-sm font-bold focus:ring-brand-yellow focus:bg-white"
                              />
                            </label>

                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Sottotitolo</span>
                              <input 
                                type="text"
                                value={item.subtitle}
                                onChange={(e) => {
                                  const newLinks = [...(pageSettings.linkRapidi || [])];
                                  newLinks[idx] = { ...item, subtitle: e.target.value };
                                  setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                }}
                                className="mt-1 block w-full bg-gray-50 border-transparent rounded-xl px-4 py-2 text-sm font-bold focus:ring-brand-yellow focus:bg-white"
                              />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Categoria Filtro</span>
                                <select 
                                  value={item.category}
                                  onChange={(e) => {
                                    const newLinks = [...(pageSettings.linkRapidi || [])];
                                    newLinks[idx] = { ...item, category: e.target.value, subcategory: "Tutti" };
                                    setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                  }}
                                  className="mt-1 block w-full bg-gray-50 border-transparent rounded-xl px-4 py-2 text-xs font-bold focus:ring-brand-yellow"
                                >
                                  {pageSettings.categories.map((c: string) => <option key={c} value={c} className="text-neutral-900 bg-white">{c}</option>)}
                                </select>
                              </label>

                              <label className="block">
                                <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Sottocategoria</span>
                                <select 
                                  value={item.subcategory}
                                  onChange={(e) => {
                                    const newLinks = [...(pageSettings.linkRapidi || [])];
                                    newLinks[idx] = { ...item, subcategory: e.target.value };
                                    setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                  }}
                                  className="mt-1 block w-full bg-gray-50 border-transparent rounded-xl px-4 py-2 text-xs font-bold focus:ring-brand-yellow"
                                >
                                  <option value="Tutti">Tutti</option>
                                  {(pageSettings.subcategories[item.category] || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </label>
                            </div>

                            <div className="pt-2">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Colore Background</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {["bg-brand-blue", "bg-brand-yellow", "bg-red-500", "bg-green-600", "bg-purple-600", "bg-orange-500", "bg-indigo-600", "bg-gray-800"].map(color => (
                                  <button 
                                    key={color}
                                    onClick={() => {
                                      const newLinks = [...pageSettings.linkRapidi];
                                      newLinks[idx] = { ...item, color: color };
                                      setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                    }}
                                    className={`w-6 h-6 rounded-full ${color} border-2 ${item.color === color ? 'border-brand-dark' : 'border-white'}`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* IMAGE OPTION */}
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1">
                                <Camera className="w-3 h-3" /> Immagine Box (opzionale)
                              </span>
                              <p className="text-[9px] text-gray-400 ml-1">Se impostata, sostituisce il colore come sfondo del box.</p>
                              <input
                                type="text"
                                value={item.imageUrl || ''}
                                onChange={(e) => {
                                  const newLinks = [...pageSettings.linkRapidi];
                                  newLinks[idx] = { ...item, imageUrl: e.target.value };
                                  setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                }}
                                placeholder="https://... oppure incolla URL immagine"
                                className="block w-full bg-gray-50 border-transparent rounded-xl px-3 py-2 text-xs font-medium focus:ring-brand-yellow focus:bg-white"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-brand-yellow/20 border-2 border-dashed border-gray-300 rounded-xl py-2 cursor-pointer transition-all text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                  <Upload className="w-3 h-3" />
                                  Carica dal dispositivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const newLinks = [...pageSettings.linkRapidi];
                                        newLinks[idx] = { ...item, imageUrl: ev.target?.result as string };
                                        setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>
                                {item.imageUrl && (
                                  <button
                                    onClick={() => {
                                      const newLinks = [...pageSettings.linkRapidi];
                                      newLinks[idx] = { ...item, imageUrl: '' };
                                      setPageSettings({ ...pageSettings, linkRapidi: newLinks });
                                    }}
                                    className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all"
                                  >
                                    Rimuovi
                                  </button>
                                )}
                              </div>
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt="preview" className="w-full h-20 object-cover rounded-xl border border-gray-200" referrerPolicy="no-referrer" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminActiveTab === 'seo' && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Configurazione SEO</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-yellow rounded-full"></span>
                            Meta Tag Globali
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Title Principale</span>
                              <input 
                                type="text" 
                                value={companySettings.name}
                                onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                                className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                placeholder="Titolo del sito per Google"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Meta Description</span>
                              <textarea 
                                rows={4}
                                value={companySettings.mission}
                                onChange={(e) => setCompanySettings({...companySettings, mission: e.target.value})}
                                className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-base font-bold focus:ring-brand-yellow focus:border-brand-yellow"
                                placeholder="Descrizione del sito per i motori di ricerca"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 space-y-4">
                          <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                            Parole Chiave (Keywords)
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {["E-commerce", "Moda", "Tecnologia", "Casa", "Sport"].map(tag => (
                              <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                                {tag}
                              </span>
                            ))}
                            <button className="px-3 py-1.5 bg-brand-yellow/10 text-brand-dark rounded-full text-xs font-bold border border-brand-yellow/20 hover:bg-brand-yellow transition-all">
                              + Aggiungi Keyword
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-brand-dark p-8 rounded-3xl text-white space-y-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-brand-yellow" />
                          <h3 className="text-xl font-black uppercase tracking-tighter">Ottimizzazione AI</h3>
                        </div>
                        <p className="text-gray-400 text-sm font-bold">
                          Utilizza l'intelligenza artificiale per generare meta descrizioni e titoli accattivanti basati sul tuo catalogo prodotti.
                        </p>
                        <button className="bg-neutral-950 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-brand-orange transition-all">
                          Analizza e Suggerisci SEO
                        </button>
                      </div>

                      {/* Google Verification Section */}
                      <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                            Proprietà Google & Verifica
                          </h3>
                          <div className="grid grid-cols-1 gap-6">
                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Codice HTML di Verifica (Meta Tag)</span>
                              <input 
                                type="text" 
                                value={companySettings.googleVerificationTag || ""}
                                onChange={(e) => setCompanySettings({...companySettings, googleVerificationTag: e.target.value})}
                                className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-brand-yellow focus:border-brand-yellow"
                                placeholder='<meta name="google-site-verification" content="..." />'
                              />
                            </label>
                            
                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Snippet Google Analytics / Search Console (Script)</span>
                              <textarea 
                                rows={4}
                                value={companySettings.googleAnalyticsSnippet || ""}
                                onChange={(e) => setCompanySettings({...companySettings, googleAnalyticsSnippet: e.target.value})}
                                className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-brand-yellow focus:border-brand-yellow"
                                placeholder='<!-- Global site tag (gtag.js) - Google Analytics -->'
                              />
                            </label>

                            <label className="block">
                              <span className="text-[10px] font-black uppercase text-gray-400 ml-1">Contenuto ads.txt</span>
                              <textarea 
                                rows={3}
                                value={companySettings.adsTxtContent || ""}
                                onChange={(e) => setCompanySettings({...companySettings, adsTxtContent: e.target.value})}
                                className="mt-1 block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-brand-yellow focus:border-brand-yellow"
                                placeholder="google.com, pub-000, DIRECT, ..."
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* SEO per Categorie */}
                      <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-black text-brand-dark uppercase tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-brand-yellow rounded-full"></span>
                            SEO per Categorie (SERP Preview)
                          </h3>
                                             {pageSettings.categories.filter((cat: string) => cat !== "Tutti").slice(0, showAllSeoCategories ? pageSettings.categories.length : 3).map((cat: string) => (
                              <div key={cat} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-5 group hover:border-brand-yellow transition-all">
                                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-100">
                                  <span className="text-xs font-black uppercase text-brand-blue flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full"></span>
                                    {cat}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setPageSettings({
                                        ...pageSettings,
                                        categorySeo: {
                                          ...pageSettings.categorySeo,
                                          [cat]: {
                                            metaTitle: `${cat} di Alta Qualità - BesPoint`,
                                            metaDescription: `Scopri la nostra selezione esclusiva di ${cat}. Qualità garantita, spedizione veloce e i migliori prezzi del mercato su BesPoint.`
                                          }
                                        }
                                      });
                                    }}
                                    className="text-[9px] font-black uppercase text-white bg-neutral-950 px-3 py-1 rounded-lg hover:bg-brand-orange transition-all active:scale-95"
                                  >
                                    Autocompila Default
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Meta Title</label>
                                    <input 
                                      className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue transition-all"
                                      placeholder={`Meta Title per ${cat}...`}
                                      value={pageSettings.categorySeo[cat]?.metaTitle || ""}
                                      onChange={(e) => setPageSettings({
                                        ...pageSettings,
                                        categorySeo: {
                                          ...pageSettings.categorySeo,
                                          [cat]: { ...pageSettings.categorySeo[cat], metaTitle: e.target.value }
                                        }
                                      })}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Meta Description</label>
                                    <input 
                                      className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue transition-all"
                                      placeholder={`Meta Description per ${cat}...`}
                                      value={pageSettings.categorySeo[cat]?.metaDescription || ""}
                                      onChange={(e) => setPageSettings({
                                        ...pageSettings,
                                        categorySeo: {
                                          ...pageSettings.categorySeo,
                                          [cat]: { ...pageSettings.categorySeo[cat], metaDescription: e.target.value }
                                        }
                                      })}
                                    />
                                  </div>
                                </div>

                                {/* Google SERP Preview */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 border-l-4 border-l-blue-600">
                                  <div className="text-[11px] text-[#202124] flex items-center gap-1 mb-1">
                                    <span>https://vincentstore.it</span>
                                    <ChevronRight className="w-2.5 h-2.5 text-[#5f6368]" />
                                    <span className="text-[#5f6368]">{cat.toLowerCase()}</span>
                                  </div>
                                  <div className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight mb-1">
                                    {pageSettings.categorySeo[cat]?.metaTitle || `${cat} di Alta Qualità - BesPoint`}
                                  </div>
                                  <div className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                                    {pageSettings.categorySeo[cat]?.metaDescription || `Scopri la nostra selezione esclusiva di ${cat}. Qualità garantita, spedizione veloce e i migliori prezzi del mercato su BesPoint.`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          {!showAllSeoCategories && pageSettings.categories.length > 3 && (
                            <button 
                              onClick={() => setShowAllSeoCategories(true)}
                              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all border border-gray-200">
                              Vedi tutte le categorie
                            </button>
                          )}
                          {showAllSeoCategories && (
                            <button 
                              onClick={() => setShowAllSeoCategories(false)}
                              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all">
                              Mostra meno
                            </button>
                          )}
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'image_linker' && (
                  <AdminImageLinker 
                    products={products} 
                    setProducts={setProducts} 
                    onBack={() => setAdminActiveTab('products')} 
                  />
                )}

                {adminActiveTab === 'analytics' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Analytics & Traffico</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Monitoraggio in tempo reale del tuo store</p>
                      </div>
                      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        {['Oggi', '7 Giorni', '30 Giorni', 'Anno'].map(t => (
                          <button key={t} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${t === '30 Giorni' ? 'bg-white text-brand-dark' : 'text-gray-400 hover:text-brand-dark'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: 'Visite Totali', value: '12.430', change: '+12.5%', color: 'text-blue-600', icon: Users },
                        { label: 'Impressioni SEO', value: '45.200', change: '+8.2%', color: 'text-purple-600', icon: Search },
                        { label: 'Click Diretti', value: '3.120', change: '+15.4%', color: 'text-green-600', icon: MousePointer2 },
                        { label: 'Permanenza Media', value: '3:45', change: '-2.1%', color: 'text-orange-600', icon: Clock }
                      ].map((stat, i) => (stat && (
                        <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                              <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                          <h4 className="text-3xl font-black text-brand-dark">{stat.value}</h4>
                        </div>
                      )))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-brand-dark p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full blur-[100px] opacity-10 -mr-20 -mt-20"></div>
                        <div className="flex justify-between items-center relative z-10">
                          <h3 className="text-xl font-black uppercase tracking-tighter">Traffico Mensile</h3>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-brand-yellow"></span>
                              <span className="text-[10px] font-bold uppercase text-gray-400">Organico</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                              <span className="text-[10px] font-bold uppercase text-gray-400">Social</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-64 flex items-end gap-2 relative z-10 px-4">
                          {[40, 60, 35, 90, 65, 45, 80, 55, 75, 45, 95, 70].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-full relative">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  className="w-full bg-gradient-to-t from-brand-yellow/20 to-brand-yellow rounded-lg group-hover:brightness-125 transition-all"
                                />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-brand-dark px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {h * 120} Visite
                                </div>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">M{i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 space-y-6">
                        <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Dispositivi</h3>
                        <div className="space-y-6">
                          {[
                            { label: 'Mobile', value: 65, icon: Smartphone, color: 'bg-neutral-950 text-white' },
                            { label: 'Desktop', value: 30, icon: Monitor, color: 'bg-brand-blue text-white' },
                            { label: 'Tablet', value: 5, icon: Tablet, color: 'bg-gray-100 text-gray-400' }
                          ].map((dev, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                  <dev.icon className="w-4 h-4" />
                                  <span>{dev.label}</span>
                                </div>
                                <span>{dev.value}%</span>
                              </div>
                              <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${dev.value}%` }}
                                  className={`h-full ${dev.color.split(' ')[0]} rounded-full`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'marketing' && (
                  <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[3rem] border border-gray-100">
                    I controlli per la Vetrina e i Nuovi Arrivi sono stati spostati in <span className="text-brand-yellow bg-brand-dark px-2 py-0.5 rounded ml-1">Gestione Prodotti</span>
                  </div>
                )}

                {adminActiveTab === 'products' && (
                  <div className="admin-products-panel space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                      <h2 className="text-2xl md:text-3xl font-black text-brand-dark uppercase tracking-tighter">
                        {adminProductView === 'list' && "Gestione Prodotti"}
                        {adminProductView === 'single' && "Nuovo Prodotto Multi-Canale"}
                        {adminProductView === 'mass' && "Importazione Massiva"}
                      </h2>
                      {adminProductView === 'list' && (
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center w-full md:w-auto">
                            <div className="relative w-full sm:w-auto">
                              <button 
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="w-full sm:w-auto bg-white text-gray-500 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-50 border border-gray-100 transition-all flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" /> Esporta <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                              </button>
                              
                              <AnimatePresence>
                                {isExportMenuOpen && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-2 right-0 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl z-50 overflow-hidden"
                                  >
                                    {[
                                      { label: 'CSV (Excel)', format: 'csv', icon: FileSpreadsheet },
                                      { label: 'Excel (.xlsx)', format: 'xlsx', icon: Table },
                                      { label: 'PDF Report', format: 'pdf', icon: FileText },
                                      { label: 'JSON Data', format: 'json', icon: FileCode }
                                    ].map((opt) => (
                                      <button 
                                        key={opt.format}
                                        onClick={() => {
                                          if (opt.format === 'csv') {
                                            const headers = "ID,Name,Category,Subcategory,Price,SKU\n";
                                            const rows = products.map(p => `${p.id},"${p.name}","${p.category}","${p.subcategory}",${p.price},BP-${p.id.padStart(4, '0')}`).join("\n");
                                            const blob = new Blob([headers + rows], { type: 'text/csv' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.setAttribute('href', url);
                                            a.setAttribute('download', 'vincent_catalogo.csv');
                                            a.click();
                                          } else {
                                            addToast(`Esportazione ${opt.label} completata correttamente!`, "success");
                                          }
                                          setIsExportMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase text-gray-500 hover:bg-black hover:text-white transition-all border-b border-gray-50 last:border-none"
                                      >
                                        <opt.icon className="w-4 h-4" /> {opt.label}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <button 
                              onClick={() => setAdminProductView('mass')}
                              className="w-full sm:w-auto bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <FileSpreadsheet className="w-4 h-4" /> Importa
                            </button>
                            <button 
                              onClick={() => {
                                setEditingAdminProduct(null);
                                setAdminProductView('single');
                              }}
                              className="w-full sm:w-auto bg-brand-dark text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Crea Nuovo
                            </button>
                          </div>
                      )}
                      {adminProductView !== 'list' && (
                        <button 
                          onClick={() => setAdminProductView('list')}
                          className="bg-gray-100 text-brand-dark px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Torna alla Lista
                        </button>
                      )}
                    </div>
                    
                    {adminProductView === 'list' && (
                      <div className="space-y-6">
                        {/* Limits & Filters Row */}
                        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 space-y-6">
                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-brand-dark" />
                                 </div>
                                 <div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-brand-dark">Display Home Controls</h3>
                                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Configura i limiti di visualizzazione per la homepage</p>
                                 </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4">
                                   {/* Vetrina Toggle */}
                                   <div className="bg-gray-50 pr-4 pl-2 py-2 rounded-xl border border-gray-100 flex items-center gap-3 group">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                         <input 
                                           type="checkbox" 
                                           className="sr-only peer" 
                                           checked={pageSettings.isFeaturedEnabled} 
                                           onChange={() => setPageSettings(prev => ({ ...prev, isFeaturedEnabled: !prev.isFeaturedEnabled }))}
                                         />
                                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow relative"></div>
                                      </label>
                                      <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2">
                                           <input 
                                             type="text" 
                                             value={pageSettings.featuredTitle}
                                             onChange={e => setPageSettings(prev => ({ ...prev, featuredTitle: e.target.value }))}
                                             placeholder="Titolo Vetrina"
                                             className="bg-transparent text-[10px] font-black uppercase text-brand-dark focus:outline-none border-b border-brand-yellow/30 w-24"
                                           />
                                         </div>
                                         <div className="flex items-center gap-0.5">
                                           <span className="text-[8px] text-gray-400 font-black uppercase">Max:</span>
                                           <input 
                                             type="number" 
                                             value={pageSettings.maxFeatured}
                                             onChange={e => setPageSettings(prev => ({ ...prev, maxFeatured: Number(e.target.value) }))}
                                             className="w-10 bg-transparent text-[10px] font-black text-gray-500 focus:outline-none border-b border-gray-200 p-0"
                                           />
                                         </div>
                                      </div>
                                   </div>

                                   {/* Special Category Toggle */}
                                   <div className="bg-gray-50 pr-4 pl-2 py-2 rounded-xl border border-gray-100 flex items-center gap-3 group">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                         <input 
                                           type="checkbox" 
                                           className="sr-only peer" 
                                           checked={pageSettings.isSpecialCategoryEnabled} 
                                           onChange={() => setPageSettings(prev => ({ ...prev, isSpecialCategoryEnabled: !prev.isSpecialCategoryEnabled }))}
                                         />
                                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                                      </label>
                                      <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2">
                                           <input 
                                             type="text" 
                                             value={pageSettings.specialCategoryTitle}
                                             onChange={e => setPageSettings(prev => ({ ...prev, specialCategoryTitle: e.target.value }))}
                                             placeholder="Titolo Scelti"
                                             className="bg-transparent text-[10px] font-black uppercase text-brand-dark focus:outline-none border-b border-indigo-600/30 w-24"
                                           />
                                         </div>
                                         <div className="flex items-center gap-0.5">
                                           <span className="text-[8px] text-gray-400 font-black uppercase">Max:</span>
                                           <input 
                                             type="number" 
                                             value={pageSettings.specialCategoryMax}
                                             onChange={e => setPageSettings(prev => ({ ...prev, specialCategoryMax: Number(e.target.value) }))}
                                             className="w-10 bg-transparent text-[10px] font-black text-gray-500 focus:outline-none border-b border-gray-200 p-0"
                                           />
                                         </div>
                                      </div>
                                   </div>

                                   {/* New Arrivals Toggle */}
                                   <div className="bg-gray-50 pr-4 pl-2 py-2 rounded-xl border border-gray-100 flex items-center gap-3 group">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                         <input 
                                           type="checkbox" 
                                           className="sr-only peer" 
                                           checked={pageSettings.isNewArrivalsEnabled} 
                                           onChange={() => setPageSettings(prev => ({ ...prev, isNewArrivalsEnabled: !prev.isNewArrivalsEnabled }))}
                                         />
                                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                                      </label>
                                      <div className="flex flex-col gap-1">
                                         <div className="flex items-center gap-2">
                                           <input 
                                             type="text" 
                                             value={pageSettings.newArrivalsTitle || "NUOVI ARRIVI"}
                                             onChange={e => setPageSettings(prev => ({ ...prev, newArrivalsTitle: e.target.value }))}
                                             placeholder="Titolo Novità"
                                             className="bg-transparent text-[10px] font-black uppercase text-brand-dark focus:outline-none border-b border-green-500/30 w-24"
                                           />
                                         </div>
                                         <div className="flex items-center gap-0.5">
                                           <span className="text-[8px] text-gray-400 font-black uppercase">Max:</span>
                                           <input 
                                             type="number" 
                                             value={pageSettings.maxNewArrivals}
                                             onChange={e => setPageSettings(prev => ({ ...prev, maxNewArrivals: Number(e.target.value) }))}
                                             className="w-10 bg-transparent text-[10px] font-black text-gray-500 focus:outline-none border-b border-gray-200 p-0"
                                           />
                                         </div>
                                      </div>
                                   </div>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-gray-50">
                              <div className="md:col-span-2 relative">
                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                 <input 
                                   type="text" 
                                   placeholder="Cerca per Nome, SKU o EAN..." 
                                   value={adminSearchQuery}
                                   onChange={e => setAdminSearchQuery(e.target.value)}
                                   className="w-full bg-gray-50 border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-yellow transition-all"
                                 />
                              </div>
                              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 md:col-span-2">
                                <button 
                                  onClick={() => setShowAdvancedFilters(true)}
                                  className="col-span-2 sm:col-span-1 sm:flex-1 bg-white border border-gray-100 hover:border-brand-yellow text-brand-dark px-3 py-3 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 group"
                                >
                                  <Layers className="w-4 h-4 text-brand-yellow group-hover:rotate-12 transition-transform" />
                                  Filtri Avanzati
                                </button>
                                 <button 
                                   onClick={() => {
                                     const newVal = !showFeaturedOnly;
                                     setShowFeaturedOnly(newVal);
                                     if (newVal) setShowSpecialOnly(false);
                                   }}
                                   className={`px-2 sm:px-4 py-3 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest transition-all border flex items-center justify-center gap-1.5 ${showFeaturedOnly ? 'bg-neutral-950 text-white border-brand-yellow shadow-lg' : 'bg-white text-gray-500 border-gray-100'}`}
                                 >
                                   <Sparkles className={`w-4 h-4 shrink-0 ${showFeaturedOnly ? 'fill-current' : ''}`} />
                                   {showFeaturedOnly ? 'Solo Vetrina' : 'Vetrina'}
                                 </button>
                                 <button 
                                   onClick={() => {
                                     const newVal = !showSpecialOnly;
                                     setShowSpecialOnly(newVal);
                                     if (newVal) setShowFeaturedOnly(false);
                                   }}
                                   className={`px-2 sm:px-4 py-3 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest transition-all border flex items-center justify-center gap-1.5 ${showSpecialOnly ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100'}`}
                                 >
                                   <Star className={`w-4 h-4 shrink-0 ${showSpecialOnly ? 'fill-current' : ''}`} />
                                   {showSpecialOnly ? 'Solo Scelti' : 'Scelti'}
                                 </button>
                                <button 
                                  onClick={() => {
                                    setAdminSearchQuery("");
                                    setAdminCategoryFilter("Tutti");
                                    setAdminBrandFilter("Tutti");
                                    setAdminChannelFilter("Tutti");
                                    setShowFeaturedOnly(false);
                                    setShowSpecialOnly(false);
                                  }}
                                  className="bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl p-3 transition-all"
                                  title="Reset Filtri"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </div>
                           </div>
                        </div>

                        {/* Modal Filtri Avanzati */}
                        <AnimatePresence>
                          {showAdvancedFilters && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAdvancedFilters(false)}
                                className="absolute inset-0 bg-brand-dark/20 backdrop-blur-md"
                              />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white w-full max-w-4xl rounded-[3rem] p-10 border border-gray-100 overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 p-8">
                                  <button onClick={() => setShowAdvancedFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-brand-dark">
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>

                                <div className="space-y-8">
                                  <div className="border-l-4 border-brand-yellow pl-4">
                                    <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Filtri di Precisione</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Configura i parametri di ricerca avanzata</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                        <Package className="w-3 h-3" /> Categoria
                                      </span>
                                      <div className="relative">
                                        <select 
                                          value={adminCategoryFilter}
                                          onChange={e => setAdminCategoryFilter(e.target.value)}
                                          className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-5 text-base font-bold text-neutral-900 focus:ring-4 focus:ring-brand-yellow/30 transition-all appearance-none"
                                        >
                                          <option value="Tutti" className="text-neutral-900 bg-white">Tutte le Categorie</option>
                                          {pageSettings.categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Marca / Brand
                                      </span>
                                      <div className="relative">
                                        <select 
                                          value={adminBrandFilter}
                                          onChange={e => setAdminBrandFilter(e.target.value)}
                                          className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-5 text-base font-bold focus:ring-4 focus:ring-brand-yellow/30 transition-all appearance-none"
                                        >
                                          <option value="Tutti" className="text-neutral-900 bg-white">Tutti i Brand</option>
                                          {adminUniqueBrands.map(b => (
                                            <option key={b} value={b} className="text-neutral-900 bg-white">{b}</option>
                                          ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Canale Vendita
                                      </span>
                                      <div className="relative">
                                        <select 
                                          value={adminChannelFilter}
                                          onChange={e => setAdminChannelFilter(e.target.value)}
                                          className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-5 text-base font-bold focus:ring-4 focus:ring-brand-yellow/30 transition-all appearance-none"
                                        >
                                          <option value="Tutti" className="text-neutral-900 bg-white">Tutti i Canali</option>
                                          <option value="Web" className="text-neutral-900 bg-white">Sito Web BesPoint</option>
                                          <option value="Amazon" className="text-neutral-900 bg-white">Amazon Market</option>
                                          <option value="Ebay" className="text-neutral-900 bg-white">eBay Market</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-4 pt-4">
                                    <button 
                                      onClick={() => {
                                        setAdminBrandFilter("Tutti");
                                        setAdminChannelFilter("Tutti");
                                      }}
                                      className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                      Svuota Filtri
                                    </button>
                                    <button 
                                      onClick={() => setShowAdvancedFilters(false)}
                                      className="flex-[2] py-5 bg-neutral-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
                                    >
                                      Applica Filtri
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </AnimatePresence>

                        <div className="md:hidden space-y-7">
                          {adminFilteredProducts.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-200">
                              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-base font-bold text-gray-400">Nessun prodotto trovato</p>
                              <p className="text-xs text-gray-400 mt-1">Prova a cambiare i filtri o la ricerca</p>
                            </div>
                          ) : (
                            adminFilteredProducts.map((p, index) => {
                              const stockQty = p.stock ?? 0;
                              const isLowStock = stockQty > 0 && stockQty <= 5;
                              const isOutOfStock = stockQty === 0;
                              const hasVariants = Boolean(p.variants && p.variants.length > 0);

                              return (
                                <article 
                                  key={`m-${p.id}`} 
                                  className="rounded-[2.2rem] border-2 border-gray-200/90 bg-white shadow-md hover:shadow-lg transition-all overflow-hidden relative"
                                >
                                  {/* Linea d'accento superiore colorata */}
                                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200" />

                                  <div className="p-4 sm:p-5 space-y-4">
                                    {/* RIGA 1: Codice SKU, Marchio e Stato Magazzino */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-gray-100 pb-3">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200/80">
                                          SKU: {p.sku || `BP-${p.id.padStart(4, '0')}`}
                                        </span>
                                        {p.brand && (
                                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                                            {p.brand}
                                          </span>
                                        )}
                                      </div>

                                      {/* Badge Disponibilità */}
                                      <div className="shrink-0">
                                        {isOutOfStock ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Esaurito (0)
                                          </span>
                                        ) : isLowStock ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                            Scorte Basse ({stockQty})
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            In Stock ({stockQty})
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* RIGA 2: Foto Prodotto + Titolo + Prezzo Base in Risalto */}
                                    <div className="flex gap-3.5 items-start">
                                      <div className="relative shrink-0">
                                        <img 
                                          src={p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'} 
                                          alt={p.name} 
                                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm bg-gray-50" 
                                        />
                                        {p.rating ? (
                                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neutral-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 whitespace-nowrap">
                                            <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                            <span>{p.rating}</span>
                                          </div>
                                        ) : null}
                                      </div>

                                      <div className="min-w-0 flex-1 space-y-1">
                                        <h3 className="font-black text-base text-brand-dark leading-snug break-words">
                                          {p.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2 pt-0.5">
                                          <span className="text-xl font-black text-brand-dark">
                                            €{Number(p.price || 0).toFixed(2)}
                                          </span>
                                          {p.originalPrice && p.originalPrice > p.price && (
                                            <span className="text-xs text-gray-400 line-through font-bold">
                                              €{Number(p.originalPrice).toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGA 3: Categoria, Sottocategoria & Canali Vendita */}
                                    <div className="p-3 bg-gray-50/90 rounded-2xl border border-gray-100 space-y-2">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-md border border-amber-300">
                                            {p.category}
                                          </span>
                                          {p.subcategory && (
                                            <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2.5 py-0.5 rounded-md">
                                              {p.subcategory}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                          <span className="flex items-center gap-1 text-emerald-700 font-black">
                                            <Check className="w-3.5 h-3.5" /> Web
                                          </span>
                                          <span className={`flex items-center gap-1 ${p.amazonActive !== false ? 'text-amber-800 font-bold' : 'text-gray-400 line-through'}`}>
                                            Amazon {p.amazonActive !== false ? '✓' : '✗'}
                                          </span>
                                          <span className={`flex items-center gap-1 ${p.ebayActive !== false ? 'text-blue-800 font-bold' : 'text-gray-400 line-through'}`}>
                                            eBay {p.ebayActive !== false ? '✓' : '✗'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGA 4: Descrizione Prodotto Dettagliata su Più Righe */}
                                    {p.description && (
                                      <div className="bg-gray-50/90 rounded-2xl p-3 border border-gray-100 space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                          <FileText className="w-3 h-3 text-gray-400" />
                                          Descrizione Voce
                                        </p>
                                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                                          {p.description}
                                        </p>
                                      </div>
                                    )}

                                    {/* RIGA 5: Opzioni Visibilità & Promozioni */}
                                    <div className="p-3 bg-slate-50/70 rounded-2xl border border-gray-100 space-y-2.5">
                                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Opzioni Visibilità & Promozioni</p>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                        {/* Vetrina Toggle */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isFeatured: !prod.isFeatured } : prod));
                                            setCartTrigger(c => c + 1);
                                          }}
                                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-[11px] font-black uppercase ${
                                            p.isFeatured 
                                              ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs' 
                                              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                                          }`}
                                        >
                                          <span className="flex items-center gap-1.5">
                                            <Sparkles className={`w-4 h-4 ${p.isFeatured ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                                            Vetrina
                                          </span>
                                          <span className={`w-3.5 h-3.5 rounded-full ${p.isFeatured ? 'bg-amber-500' : 'bg-gray-200'}`} />
                                        </button>

                                        {/* Scelti Per Te Toggle */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isSpecialPromotion: !prod.isSpecialPromotion } : prod));
                                            setCartTrigger(c => c + 1);
                                          }}
                                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-[11px] font-black uppercase ${
                                            p.isSpecialPromotion 
                                              ? 'bg-indigo-100 border-indigo-300 text-indigo-950 shadow-xs' 
                                              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                                          }`}
                                        >
                                          <span className="flex items-center gap-1.5">
                                            <Star className={`w-4 h-4 ${p.isSpecialPromotion ? 'text-indigo-600 fill-indigo-500' : 'text-gray-400'}`} />
                                            Scelti
                                          </span>
                                          <span className={`w-3.5 h-3.5 rounded-full ${p.isSpecialPromotion ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* RIGA 6: Varianti Preview (Taglie & Colori) */}
                                    {hasVariants && (
                                      <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                                            <Layers className="w-3.5 h-3.5 text-amber-600" />
                                            Varianti Attive ({p.variants.length})
                                          </span>
                                          <span className="text-[9px] font-bold text-gray-500">Taglie / Colori</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                          {p.variants.map((v: any, vIdx: number) => (
                                            <span 
                                              key={v.id || vIdx} 
                                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-brand-dark px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs"
                                            >
                                              <span className="font-black text-amber-700">{v.type}:</span>
                                              <span>{v.value}</span>
                                              <span className="text-gray-400 text-[9px] font-mono">({v.webStock ?? v.stock ?? 0} pz)</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* RIGA 7: Modifica Rapida Prezzo & Stock */}
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                      <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                                          Prezzo Rapido (€)
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={p.price}
                                            disabled={hasVariants}
                                            onChange={(e) => {
                                              const newPrice = parseFloat(e.target.value) || 0;
                                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, price: newPrice } : prod));
                                            }}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-brand-dark focus:ring-2 focus:ring-amber-400 disabled:opacity-50 min-h-[40px]"
                                          />
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                                          Quantità Stock (Pz)
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={p.stock ?? 0}
                                            disabled={hasVariants}
                                            onChange={(e) => {
                                              const newStock = parseInt(e.target.value, 10) || 0;
                                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                                            }}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-center text-brand-dark focus:ring-2 focus:ring-amber-400 disabled:opacity-50 min-h-[40px]"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* RIGA 8: Barra Azioni Mobile Sempre Visibili e Comode */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingAdminProduct(p);
                                          setAdminProductView('single');
                                        }}
                                        className="flex-[2] py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[48px]"
                                      >
                                        <Edit2 className="w-4 h-4 text-brand-yellow" />
                                        <span>Modifica Scheda</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleProductSelect(p)}
                                        className="py-3.5 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-dark flex items-center justify-center transition-colors min-h-[48px] border border-gray-200"
                                        title="Visualizza nello Store"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAdminConfirmAction({
                                            active: true,
                                            title: 'Elimina Prodotto',
                                            message: `Eliminare definitivamente "${p.name}"? L'azione non è reversibile.`,
                                            color: 'bg-red-500',
                                            onConfirm: () => {
                                              setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                              void deleteProductFromSupabase(p.id);
                                              addToast('Prodotto eliminato dal catalogo.', 'success');
                                            },
                                          });
                                        }}
                                        className="py-3.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-colors min-h-[48px]"
                                        aria-label="Elimina Prodotto"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </article>
                              );
                            })
                          )}
                        </div>

                        <div className="hidden md:block bg-white rounded-[2.5rem] overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                                <th className="p-4">Prodotto</th>
                                <th className="p-4">Marca</th>
                                <th className="p-4 text-center">In Vetrina</th>
                                <th className="p-4 text-center">Scelti Per Te</th>
                                <th className="p-4">Categoria / Variante</th>
                                <th className="p-4">Prezzo</th>
                                <th className="p-4 text-center">Quantità (Stock)</th>
                                <th className="p-4 text-center">Canali Attivi</th>
                                <th className="p-4 text-right">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {adminFilteredProducts.map(p => (
                                <React.Fragment key={p.id}>
                                  <tr 
                                    className={`hover:bg-gray-50/50 transition-colors ${p.variants && p.variants.length > 0 ? 'cursor-pointer select-none' : ''}`}
                                    onClick={(e) => {
                                      const target = e.target as HTMLElement;
                                      if (target.closest('input, button, select, label, checkbox, a')) return;
                                      if (p.variants && p.variants.length > 0) {
                                        setExpandedProducts(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                      }
                                    }}
                                  >
                                    <td className="p-4">
                                      <div className="flex items-center gap-4">
                                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-brand-dark">{p.name}</p>
                                            {p.variants && p.variants.length > 0 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedProducts(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                                }}
                                                className="text-[8px] font-black px-1.5 py-0.5 bg-brand-yellow/20 text-brand-orange border border-brand-yellow rounded-md uppercase tracking-wider hover:bg-black hover:text-white transition-all flex items-center gap-1 active:scale-95 animate-pulse"
                                                title="Clicca per mostrare/nascondere le varianti"
                                              >
                                                <span>Varianti</span>
                                                <span className="text-[7px]">{expandedProducts[p.id] ? "▲" : "▼"}</span>
                                              </button>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 font-medium">SKU: {p.sku || `BP-${p.id.padStart(4, '0')}`}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className="text-xs font-black uppercase text-brand-blue tracking-tighter">{p.brand || "-"}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center">
                                           <label className="relative inline-flex items-center cursor-pointer group">
                                              <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={p.isFeatured} 
                                                onChange={() => {
                                                  const newFeatured = !p.isFeatured;
                                                  setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isFeatured: newFeatured } : prod));
                                                  setCartTrigger(c => c + 1); 
                                                }} 
                                              />
                                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow relative"></div>
                                           </label>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                       <div className="flex justify-center">
                                          <label className="relative inline-flex items-center cursor-pointer group">
                                             <input 
                                               type="checkbox" 
                                               className="sr-only peer" 
                                               checked={p.isSpecialPromotion} 
                                               onChange={() => {
                                                 const newSpecial = !p.isSpecialPromotion;
                                                 setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isSpecialPromotion: newSpecial } : prod));
                                                 setCartTrigger(c => c + 1); 
                                               }} 
                                             />
                                             <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                                             {p.isSpecialPromotion && <Star className="absolute left-[3px] top-[4px] w-3 h-3 text-white pointer-events-none z-10 fill-current" />}
                                          </label>
                                       </div>
                                   </td>
                                    <td className="p-4">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md w-fit">{p.category}</span>
                                        {p.variants && p.variants.length > 0 ? (
                                           <span className="text-[9px] font-black px-2 py-0.5 bg-neutral-950 text-white rounded-md w-fit uppercase tracking-wider">
                                             {p.variants.length} Varianti
                                           </span>
                                         ) : (
                                           <span className="text-xs text-gray-500">{p.subcategory}</span>
                                         )}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      {p.variants && p.variants.length > 0 ? (
                                        <span className="text-xs font-bold text-gray-400 italic">Vedi varianti</span>
                                      ) : (
                                        <div className="relative w-24">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">€</span>
                                          <input 
                                            type="number" 
                                            step="0.01"
                                            value={p.price} 
                                            onChange={e => {
                                              const newPrice = parseFloat(e.target.value) || 0;
                                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, price: newPrice } : prod));
                                            }}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-5 pr-1 py-1 text-xs font-black text-brand-dark focus:ring-1 focus:ring-brand-yellow focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4 text-center">
                                      {p.variants && p.variants.length > 0 ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedProducts(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                          }}
                                          className="font-black text-xs text-white bg-neutral-950/10 hover:bg-brand-yellow/30 px-3 py-1.5 rounded-xl border border-brand-yellow/20 inline-block transition-all active:scale-95 shadow-sm"
                                        >
                                          Tot: {p.variants.reduce((acc: number, curr: any) => acc + (Number(curr.webStock) || 0), 0)}
                                        </button>
                                      ) : (
                                        <input 
                                          type="number" 
                                          value={p.stock ?? 0} 
                                          onChange={e => {
                                            const newStock = parseInt(e.target.value) || 0;
                                            setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock: newStock } : prod));
                                          }}
                                          className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-black text-center text-brand-dark focus:ring-1 focus:ring-brand-yellow focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                      )}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex justify-center gap-2">
                                        {(p.amazonStock || 0) > 0 && (
                                          <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center cursor-help overflow-hidden hover:scale-110 transition-transform" title={`Amazon.it (${p.amazonStock})`}>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" className="w-3 h-3 object-contain" alt="Amazon" />
                                          </span>
                                        )}
                                        {(p.ebayStock || 0) > 0 && (
                                          <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center cursor-help overflow-hidden hover:scale-110 transition-transform" title={`eBay (${p.ebayStock})`}>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" className="w-3 h-3 object-contain" alt="eBay" />
                                          </span>
                                        )}
                                        {(p.stock || 0) > 0 && (
                                          <span className="w-6 h-6 rounded-full bg-neutral-950 text-white flex items-center justify-center cursor-help overflow-hidden hover:scale-110 transition-transform" title={`Sito Web (${p.stock})`}>
                                            <Layers className="w-3 h-3" />
                                          </span>
                                        )}
                                        {!(p.stock || 0) && !(p.amazonStock || 0) && !(p.ebayStock || 0) && (
                                          <span className="text-[9px] font-black text-red-500 uppercase">Esaurito</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button 
                                          onClick={() => {
                                            setEditingAdminProduct(p);
                                            setAdminProductView('single');
                                          }}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-brand-yellow hover:bg-black hover:text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs transition-all active:scale-95"
                                          title="Modifica Prodotto"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                          <span>Modifica</span>
                                        </button>
                                        <button 
                                          onClick={() => handleProductSelect(p)}
                                          className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-brand-dark rounded-xl transition-all border border-gray-200"
                                          title="Visualizza nello Store"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setAdminConfirmAction({
                                              active: true,
                                              title: "Elimina Prodotto",
                                              message: `Sei sicuro di voler eliminare definitivamente "${p.name}"? Questa operazione non può essere annullata.`,
                                              color: "bg-red-500",
                                              onConfirm: () => {
                                                setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                                void deleteProductFromSupabase(p.id);
                                                addToast("Prodotto eliminato con successo!", "success");
                                              }
                                            });
                                          }}
                                          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-200 shadow-2xs"
                                          title="Elimina Prodotto"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* RIGA ESPANDIBILE VARIANTI */}
                                  {expandedProducts[p.id] && p.variants && p.variants.length > 0 && (
                                    <tr className="bg-brand-yellow/5">
                                      <td colSpan={9} className="p-6 border-b border-gray-100">
                                        <div className="bg-white rounded-[2rem] border border-brand-yellow/30 p-6 space-y-4 shadow-lg">
                                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-2">
                                              <Layers className="w-5 h-5 text-brand-orange" />
                                              <h4 className="text-sm font-black text-brand-dark uppercase tracking-tight">Dettaglio Varianti per: {p.name}</h4>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-brand-orange bg-brand-yellow/20 px-3 py-1 rounded-full">
                                              {p.variants.length} Varianti Attive
                                            </span>
                                          </div>
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                              <thead>
                                                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                  <th className="py-2 px-4">Valore Variante</th>
                                                  <th className="py-2 px-4">SKU</th>
                                                  <th className="py-2 px-4 text-center">Quantità (Stock Web)</th>
                                                  <th className="py-2 px-4 text-center">Prezzo Variante (€)</th>
                                                  <th className="py-2 px-4 text-center">Spedizione</th>
                                                  <th className="py-2 px-4 text-right">Azione</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-50">
                                                {p.variants.map((v: any, vIdx: number) => {
                                                  const basePrice = p.price || 0;
                                                  let varPrice = basePrice;
                                                  if (v.costType === 'fixed') varPrice = v.costValue || basePrice;
                                                  else if (v.costType === 'delta') varPrice = basePrice + (v.costValue || 0);
                                                  else if (v.costType === 'percent') varPrice = basePrice * (1 + (v.costValue || 0) / 100);

                                                  return (
                                                    <tr key={v.id || vIdx} className="hover:bg-gray-50/50 transition-colors">
                                                      <td className="py-3 px-4 font-bold text-xs text-brand-dark uppercase">{v.value}</td>
                                                      <td className="py-3 px-4 font-mono text-[10px] text-gray-500">{v.sku || 'N/A'}</td>
                                                      
                                                      {/* Quantità modificabile inline */}
                                                      <td className="py-3 px-4 text-center">
                                                        <input 
                                                          type="number" 
                                                          value={v.webStock ?? 0}
                                                          onChange={e => {
                                                            const newStock = parseInt(e.target.value) || 0;
                                                            const updatedVariants = p.variants.map((varItem: any, idx: number) => 
                                                              idx === vIdx ? { ...varItem, webStock: newStock } : varItem
                                                            );
                                                            const totalStock = updatedVariants.reduce((acc: number, curr: any) => acc + (Number(curr.webStock) || 0), 0);
                                                            setProducts(prev => prev.map(prod => prod.id === p.id ? { 
                                                              ...prod, 
                                                              variants: updatedVariants,
                                                              stock: totalStock 
                                                            } : prod));
                                                          }}
                                                          className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-black text-center text-brand-dark focus:ring-1 focus:ring-brand-yellow focus:bg-white"
                                                        />
                                                      </td>
                                                      
                                                      {/* Prezzo modificabile inline */}
                                                      <td className="py-3 px-4 text-center">
                                                        <div className="relative w-24 mx-auto">
                                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">€</span>
                                                          <input 
                                                            type="number" 
                                                            step="0.01"
                                                            value={v.costValue === 0 ? "" : v.costValue}
                                                            placeholder={basePrice.toFixed(2)}
                                                            onChange={e => {
                                                              const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                              const updatedVariants = p.variants.map((varItem: any, idx: number) => 
                                                                idx === vIdx ? { ...varItem, costValue: val } : varItem
                                                              );
                                                              setProducts(prev => prev.map(prod => prod.id === p.id ? { 
                                                                ...prod, 
                                                                variants: updatedVariants 
                                                              } : prod));
                                                            }}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-5 pr-1 py-1 text-xs font-black text-brand-dark focus:ring-1 focus:ring-brand-yellow focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                          />
                                                        </div>
                                                        <span className="text-[8px] text-gray-400 font-bold block mt-0.5">
                                                          Finito: €{varPrice.toFixed(2)} ({v.costType})
                                                        </span>
                                                      </td>
                                                      
                                                      {/* Spedizione modello */}
                                                      <td className="py-3 px-4 text-center">
                                                        <button
                                                          onClick={() => {
                                                            const updatedVariants = p.variants.map((varItem: any, idx: number) => 
                                                              idx === vIdx ? { ...varItem, freeShipping: !varItem.freeShipping } : varItem
                                                            );
                                                            setProducts(prev => prev.map(prod => prod.id === p.id ? { 
                                                              ...prod, 
                                                              variants: updatedVariants 
                                                            } : prod));
                                                          }}
                                                          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all ${
                                                            v.freeShipping 
                                                              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                                                              : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                                                          }`}
                                                        >
                                                          {v.freeShipping ? 'Gratuita' : 'A Pagamento'}
                                                        </button>
                                                      </td>
                                                      
                                                      {/* Link rapidi */}
                                                      <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                          <button 
                                                            onClick={() => {
                                                              setIsAdminOpen(false);
                                                              handleProductSelect(p);
                                                            }}
                                                            className="px-2.5 py-1 bg-neutral-950 text-white hover:bg-brand-dark hover:text-brand-yellow rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                            title="Apri la scheda prodotto sul sito web"
                                                          >
                                                            Vedi sul Sito
                                                          </button>
                                                          <button 
                                                            onClick={() => {
                                                              setEditingAdminProduct(p);
                                                              setAdminProductView('single');
                                                            }}
                                                            className="px-2.5 py-1 bg-neutral-950 text-white hover:bg-black hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                                            title="Modifica variante"
                                                          >
                                                            Modifica
                                                          </button>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        </div>
                      </div>
                    )}

                    {adminProductView === 'single' && (
                      <AdminSingleProduct 
                        initialData={editingAdminProduct}
                        allProducts={products}
                        existingBrands={Array.from(new Set(products.map(p => p.brand).filter(Boolean)))}
                        existingCategories={pageSettings.categories}
                        existingSubcategories={pageSettings.subcategories}
                        availableVariants={availableVariants}
                        setAvailableVariants={setAvailableVariants}
                        enabledMarketplaces={pageSettings?.enabledMarketplaces || []}
                        onDelete={(id) => {
                          const p = products.find(prod => prod.id === id);
                          if (!p) return;
                          setAdminConfirmAction({
                            active: true,
                            title: "Elimina Prodotto",
                            message: `Sei sicuro di voler eliminare definitivamente "${p.name}"? Questa operazione non può essere annullata.`,
                            color: "bg-red-500",
                            onConfirm: () => {
                              setProducts(prev => prev.filter(prod => prod.id !== id));
                              void deleteProductFromSupabase(id);
                              setEditingAdminProduct(null);
                              setAdminProductView('list');
                              addToast("Prodotto eliminato con successo!", "success");
                            }
                          });
                        }}
                        onBack={() => {
                          setEditingAdminProduct(null);
                          setAdminProductView('list');
                          setCartTrigger(c => c + 1);
                        }} 
                        onSave={(newProduct) => {
                          // Update page settings if new category is added
                          if (newProduct.category && !pageSettings.categories.includes(newProduct.category)) {
                            setPageSettings(prev => ({
                              ...prev,
                              categories: [...prev.categories, newProduct.category],
                              subcategories: { ...prev.subcategories, [newProduct.category]: [newProduct.subcategory] }
                            }));
                          } else if (newProduct.subcategory && !pageSettings.subcategories[newProduct.category]?.includes(newProduct.subcategory)) {
                            setPageSettings(prev => ({
                              ...prev,
                              subcategories: { 
                                ...prev.subcategories, 
                                [newProduct.category]: [...(prev.subcategories[newProduct.category] || []), newProduct.subcategory] 
                              }
                            }));
                          }

                          setProducts(prev => {
                            const exists = prev.find(p => p.id === newProduct.id);
                            if (exists) {
                              return prev.map(p => p.id === newProduct.id ? newProduct : p);
                            } else {
                              return [newProduct, ...prev];
                            }
                          });
                          setCartTrigger(c => c + 1);
                          void syncProductToSupabase(newProduct);
                          addToast("Prodotto salvato con successo!", "success");
                        }}
                      />
                    )}

                    {adminProductView === 'mass' && (
                      <AdminMassiveImport 
                        products={products}
                        setProducts={setProducts}
                        pageSettings={pageSettings}
                        setPageSettings={setPageSettings}
                        onBack={() => setAdminProductView('list')} 
                      />
                    )}
                  </div>
                )}

                {adminActiveTab === 'orders' && (
                  <AdminOrders 
                    orders={orders} 
                    setOrders={setOrders} 
                    pageSettings={pageSettings} 
                    returnRequests={returnRequests} 
                    setReturnRequests={setReturnRequests}
                    onViewReturn={(id) => {
                      setAdminActiveTab('returns' as any);
                      setSelectedReturnId(id);
                    }}
                    initialSelectedOrderId={selectedAdminOrderId}
                    onClearSelectedOrderId={() => setSelectedAdminOrderId(null)}
                  />
                )}
                {adminActiveTab === 'reviews' && <AdminReviews reviews={productReviews} setReviews={setProductReviews} />}

                {adminActiveTab === 'couriers' && <AdminCouriers />}
                {adminActiveTab === ('returns' as any) && <AdminReturns returns={returnRequests} setReturns={setReturnRequests} initialSelectedId={selectedReturnId} />}
                {adminActiveTab === ('users' as any) && (
                  <AdminUsers 
                    orders={orders}
                    onViewOrder={(orderId) => {
                      setAdminActiveTab('orders');
                      setSelectedAdminOrderId(orderId);
                    }}
                  />
                )}

                {adminActiveTab === 'payments' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Metodi di Pagamento</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configura come i tuoi clienti possono pagare gli ordini</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Stripe Settings */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase tracking-tighter text-brand-dark">Stripe / Carte</h3>
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Credit Cards, Google Pay, Apple Pay</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.stripeEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, stripeEnabled: !prev.stripeEnabled }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Chiave Pubblicabile (PK)</span>
                            <input 
                              type="text" 
                              value={paymentSettings.stripeKey}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, stripeKey: e.target.value }))}
                              placeholder="pk_live_..." 
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all" 
                            />
                          </label>
                          <p className="text-[10px] text-gray-400 font-medium italic bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                            Stripe accetta automaticamente tutte le principali carte di credito e wallet digitali.
                          </p>
                        </div>
                      </div>

                      {/* PayPal Settings */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                              <ExternalLink className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase tracking-tighter text-brand-dark">PayPal</h3>
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pagamenti diretti e in 3 rate</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.paypalEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, paypalEnabled: !prev.paypalEnabled }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email Business PayPal</span>
                            <input 
                              type="email" 
                              value={paymentSettings.paypalEmail}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, paypalEmail: e.target.value }))}
                              placeholder="info@vincentstore.it" 
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all" 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Bank Transfer Settings */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600">
                              <Globe className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase tracking-tighter text-brand-dark">Bonifico Bancario</h3>
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pagamento manuale differito</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.bankEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, bankEnabled: !prev.bankEnabled }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600 relative"></div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Intestatario Conto</span>
                            <input 
                              type="text" 
                              value={paymentSettings.bankOwner}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankOwner: e.target.value }))}
                              placeholder="BESPOINT S.R.L." 
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gray-400 transition-all" 
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">IBAN</span>
                            <input 
                              type="text" 
                              value={paymentSettings.bankIban}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankIban: e.target.value }))}
                              placeholder="IT00 X 00000 00000 000000000000" 
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gray-400 transition-all" 
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Note per il cliente (Visualizzate al checkout)</span>
                            <textarea 
                              value={paymentSettings.bankNote}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankNote: e.target.value }))}
                              rows={2}
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gray-400 transition-all resize-none" 
                            ></textarea>
                          </label>
                        </div>
                      </div>

                      {/* COD Settings */}
                      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                              <Truck className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black uppercase tracking-tighter text-brand-dark">Contrassegno (COD)</h3>
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pagamento in contanti alla consegna</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.codEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, codEnabled: !prev.codEnabled }))}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 relative"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Note Istruzioni per il Cliente</span>
                            <textarea 
                              value={paymentSettings.codNote}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, codNote: e.target.value }))}
                              placeholder="Es: Assicurati di avere l'importo esatto pronto al momento della consegna." 
                              rows={2}
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all resize-none" 
                            ></textarea>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'marketplaces' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div>
                      <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-2">Integrazione Marketplaces</h2>
                      <p className="text-sm font-bold text-gray-400 font-bold">Configura i connettori API per sincronizzare stock, prezzi e ordini con le piattaforme esterne.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Amazon Config */}
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                              <Globe className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Amazon SP-API</h3>
                          </div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={pageSettings.enabledMarketplaces?.includes("Amazon")}
                              onChange={() => {
                                const current = pageSettings.enabledMarketplaces || [];
                                const next = current.includes("Amazon") ? current.filter(m => m !== "Amazon") : [...current, "Amazon"];
                                setPageSettings({ ...pageSettings, enabledMarketplaces: next });
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 relative"></div>
                          </label>
                        </div>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Seller ID</span>
                            <input type="text" placeholder="A1BCDEFGH2IJK" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-gray-300" />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Marketplace Region</span>
                            <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold">
                              <option>Europa (Amazon.it)</option>
                              <option>America</option>
                            </select>
                          </label>
                          <button className="w-full bg-brand-dark text-orange-500 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2">
                             Autorizza Canale
                          </button>
                        </div>
                      </div>

                      {/* eBay Config */}
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                              <ExternalLink className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">eBay Integration</h3>
                          </div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={pageSettings.enabledMarketplaces?.includes("eBay")}
                              onChange={() => {
                                const current = pageSettings.enabledMarketplaces || [];
                                const next = current.includes("eBay") ? current.filter(m => m !== "eBay") : [...current, "eBay"];
                                setPageSettings({ ...pageSettings, enabledMarketplaces: next });
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 relative"></div>
                          </label>
                        </div>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">RU Name</span>
                            <input type="text" placeholder="BesPoint-BesPoint-..." className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-gray-300" />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Environment</span>
                            <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold">
                              <option>Production (Live)</option>
                              <option>Sandbox (Test)</option>
                            </select>
                          </label>
                          <button className="w-full bg-brand-dark text-blue-500 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2">
                             Collega Account eBay
                          </button>
                        </div>
                      </div>

                      {/* Add More */}
                      <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-brand-yellow transition-all">
                        <div className="w-16 h-16 bg-white text-gray-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-brand-yellow group-hover:text-brand-dark transition-all mb-4">
                          <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-dark transition-colors">Aggiungi Canale</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">ManoMano, Temu, B2B VIP Extension</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setIsGeneralSaveSuccess(true)}
                    className="bg-neutral-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-orange transition-all shadow-lg hover:-translate-y-1 active:translate-y-0"
                  >
                    Salva Modifiche
                  </button>
                </div>

                {/* Success Modal for General Admin Saves */}
                <AnimatePresence>
                  {isGeneralSaveSuccess && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl"
                        onClick={() => setIsGeneralSaveSuccess(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                        
                        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                           <Check className="w-10 h-10 text-blue-500" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Impostazioni Salvate</h3>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-8 leading-relaxed">
                          Le modifiche alle configurazioni admin sono state applicate correttamente al sistema.
                        </p>
                        
                        <div className="space-y-3">
                          <button 
                            onClick={() => setIsGeneralSaveSuccess(false)}
                            className="w-full py-4 bg-neutral-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                          >
                            Rimani qui
                          </button>
                          
                          <button 
                            onClick={() => {
                              setIsGeneralSaveSuccess(false);
                              setIsAdminOpen(false);
                            }}
                            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                          >
                            Esci dall'Admin
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                  {slideToDelete && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
                      >
                        <div className="bg-red-500 p-8 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Trash2 className="w-40 h-40 -ml-10 -mt-10 rotate-12" />
                          </div>
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white/20 p-4 rounded-3xl mb-4 backdrop-blur-md border border-white/30">
                              <Trash2 className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter">Conferma Eliminazione</h4>
                          </div>
                        </div>
                        
                        <div className="p-8 text-center space-y-6">
                          <div className="space-y-2">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Stai per eliminare</p>
                            <p className="text-brand-dark font-black text-lg leading-tight uppercase tracking-tighter">
                              {slideToDelete.type}
                            </p>
                          </div>
                          
                          <p className="text-gray-500 text-sm font-bold leading-relaxed px-4">
                            Questa azione è irreversibile. La slide verrà rimossa definitivamente dal database.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3 pt-4">
                            <button 
                              onClick={() => setSlideToDelete(null)}
                              className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                            >
                              Annulla
                            </button>
                            <button 
                              onClick={() => {
                                const nextSlides = pageSettings.homeSlides.filter(
                                  (s: any) => s.id !== slideToDelete.id
                                );
                                setPageSettings({ ...pageSettings, homeSlides: nextSlides });
                                const clampIdx = (
                                  prev: number,
                                  position: string
                                ) => {
                                  const len = nextSlides.filter(
                                    (s: any) =>
                                      s.position === position ||
                                      (position === 'home_top' && !s.position)
                                  ).length;
                                  return len === 0 ? 0 : Math.min(prev, len - 1);
                                };
                                if (slideToDelete.position === 'home_top') {
                                  setAdminTopIdx((i) => clampIdx(i, 'home_top'));
                                }
                                if (slideToDelete.position === 'home_middle') {
                                  setAdminMidIdx((i) => clampIdx(i, 'home_middle'));
                                }
                                if (slideToDelete.position === 'home_bottom') {
                                  setAdminBotIdx((i) => clampIdx(i, 'home_bottom'));
                                }
                                setSlideToDelete(null);
                              }}
                              className="px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 active:scale-95"
                            >
                              Sì, Elimina
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="auth-modal-home fixed inset-0 z-[110] flex items-start justify-center pt-[5.5rem] pb-4 px-4 bg-neutral-950/40 backdrop-blur-md overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`auth-modal-panel bg-[#fafafa] rounded-2xl border border-neutral-200/80 shadow-2xl w-full ${['profile', 'edit_profile', 'orders', 'support'].includes(authStep) ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto overflow-x-hidden relative transition-all duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
            >
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-brand-dark transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-10">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-neutral-950 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <User className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-light text-neutral-950 tracking-wide uppercase">
                    {authStep === 'profile' ? `Ciao, ${currentUser?.name.split(' ')[0] || 'Utente'}!` : 
                     authStep === 'orders' ? 'I Miei Ordini' : 
                     authStep === 'edit_profile' ? 'Il Mio Profilo' : 
                     authStep === 'support' ? 'Assistenza Clienti' : 
                     authStep === 'email' ? 'Bentornato' : 
                     authStep === 'login' ? 'Inserisci Password' : 
                     'Crea Account'}
                  </h2>
                  <p className="text-neutral-500 font-light text-sm mt-2">
                    {authStep === 'profile' ? 'Gestisci la tua Area Personale' : 
                     authStep === 'orders' ? 'Lo storico dei tuoi acquisti' : 
                     authStep === 'edit_profile' ? 'Aggiorna i dettagli demografici e di fatturazione' : 
                     authStep === 'support' ? 'Siamo qui per aiutarti. Scegli come preferisci contattarci.' : 
                     authStep === 'email' ? 'Accedi o registrati per continuare' : 
                     authStep === 'login' ? `Bentornato, ${authEmail}` : 
                     'Inserisci i tuoi dati per registrarti'}
                  </p>
                </div>

                {authError && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center border border-red-100">
                    {authError}
                  </div>
                )}

                {['profile', 'edit_profile', 'orders', 'support'].includes(authStep) && (
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 order-2 md:order-1">
                      {authStep === 'profile' && (
                        <div className="space-y-6">
                          <>
                            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center text-white font-black text-2xl shadow-inner uppercase">
                                {currentUser?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="text-left">
                                <p className="text-lg font-normal text-neutral-950 leading-tight">{currentUser?.name}</p>
                                <p className="text-[11px] font-light text-neutral-500 tracking-wide mt-1">@{currentUser?.username || 'utente'} · {currentUser?.email}</p>
                              </div>
                            </div>


                          {activeUserView === 'profile' && (
                            <div className="space-y-6">
                              {/* Scheda Dati di Spedizione e Anagrafici */}
                              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                  <div>
                                    <h4 className="text-sm font-black uppercase tracking-wider text-brand-dark flex items-center gap-2">
                                      <Truck className="w-4 h-4 text-brand-blue" />
                                      Dati di Spedizione Predefiniti
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-medium">Utilizzati per precompilare automaticamente la consegna nei tuoi ordini</p>
                                  </div>
                                  <button
                                    onClick={() => setAuthStep('edit_profile')}
                                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs"
                                  >
                                    {currentUser?.addressStreet ? 'Modifica Dati' : '+ Aggiungi Dati'}
                                  </button>
                                </div>

                                {currentUser?.addressStreet ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Destinatario & Contatto</span>
                                      <p className="font-bold text-neutral-900 mt-1">{currentUser.name || 'Nome non specificato'}</p>
                                      <p className="text-gray-500 text-[11px] font-medium mt-0.5">{currentUser.phone ? `Tel: ${currentUser.phone}` : 'Nessun telefono registrato'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                      <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Indirizzo di Consegna</span>
                                      <p className="font-bold text-neutral-900 mt-1">{currentUser.addressStreet}</p>
                                      <p className="text-gray-500 text-[11px] font-medium mt-0.5">
                                        {[currentUser.addressZip, currentUser.addressCity, currentUser.addressProvince ? `(${currentUser.addressProvince})` : ''].filter(Boolean).join(' ')}
                                      </p>
                                    </div>
                                    {currentUser.taxCode && (
                                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 md:col-span-2">
                                        <span className="text-[9px] font-black uppercase text-gray-400 block tracking-wider">Codice Fiscale / P.IVA</span>
                                        <p className="font-mono font-bold text-neutral-800 text-[11px] mt-0.5">{currentUser.taxCode}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-bold text-amber-950">Nessun indirizzo di spedizione salvato</p>
                                      <p className="text-[10px] text-amber-800">Aggiungi indirizzo e numero di telefono per non doverli reinserire ad ogni acquisto.</p>
                                    </div>
                                    <button
                                      onClick={() => setAuthStep('edit_profile')}
                                      className="px-4 py-2 bg-brand-blue hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow-sm"
                                    >
                                      Compila ora
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button onClick={() => { setIsAuthOpen(false); }} className="w-full bg-brand-dark hover:bg-black hover:text-white text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
                                Torna allo Shopping
                              </button>
                            </div>
                          )}

                          {activeUserView === 'returns' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic">Resi in Corso</h3>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Monitora lo stato delle tue pratiche</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4 pt-4">
                                {returnRequests.filter(r => r.customerEmail === currentUser?.email).length > 0 ? (
                                   returnRequests.filter(r => r.customerEmail === currentUser?.email).map((req: any) => {
                                     const lastMsg = req.messages?.[req.messages.length - 1];
                                     const isAdminMsg = lastMsg?.role === 'admin';
                                     const needsPhoto = req.messages?.some((m: any) => m.role === 'admin' && (m.text.toLowerCase().includes('foto') || m.text.toLowerCase().includes('immagine')));
                                     
                                     return (
                                       <div 
                                         key={req.id} 
                                         onClick={() => {
                                           setSelectedReturnDetail(req);
                                           setActiveUserView('return_detail' as any);
                                         }}
                                         className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-brand-dark/5 flex flex-col md:flex-row items-center gap-6 group cursor-pointer hover:border-brand-yellow hover:scale-[1.02] transition-all relative overflow-hidden"
                                       >
                                         {isAdminMsg && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-xl shadow-lg animate-pulse" />}
                                         
                                         <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 p-2 shrink-0">
                                           <img src={req.product.image} className="w-full h-full object-contain" />
                                         </div>
                                         <div className="flex-1 text-center md:text-left">
                                           <div className="flex flex-col gap-1.5 items-center md:items-start text-left">
                                             <div className="flex items-center gap-2">
                                               <span className="text-[8px] font-black bg-brand-blue/5 text-brand-blue px-2 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap">REF: {req.id}</span>
                                               <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-gray-50 shadow-sm ${req.status === 'pending' || req.status === 'processing' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                                                 {req.status === 'pending' ? 'RICHIESTA INVIATA' : 
                                                  req.status === 'processing' ? 'IN LAVORAZIONE' : 
                                                  req.status === 'approved' ? 'APPROVATA' : 
                                                  req.status === 'rejected' ? 'RIFIUTATA' : 'COMPLETATA'}
                                               </span>
                                               {isAdminMsg && <span className="text-[7px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter animate-bounce flex items-center gap-1"><MessageCircle className="w-2 h-2" /> Nuovo Messaggio</span>}
                                               {needsPhoto && <span className="text-[7px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter flex items-center gap-1"><Camera className="w-2 h-2" /> Azione Richiesta</span>}
                                             </div>
                                             <span className="text-[8px] font-black bg-neutral-950 text-white px-2 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap">ORDINE: {req.orderId}</span>
                                             <h4 className="font-black text-brand-dark uppercase tracking-tight text-xs whitespace-nowrap mt-1">{req.product.name}</h4>
                                           </div>
                                           <p className="text-xs font-bold text-gray-400 mt-1 italic leading-tight line-clamp-1">
                                             {isAdminMsg ? `Admin: ${lastMsg.text.substring(0, 50)}...` : `Motivo: ${req.details.substring(0, 50)}...`}
                                           </p>
                                         </div>
                                         <div className="text-right flex flex-col items-end gap-2">
                                           <div className="text-right">
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{req.date}</p>
                                             <p className="text-lg font-black text-brand-dark italic leading-none">Qtà: {req.product.qty}</p>
                                           </div>
                                           <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-yellow transition-colors group-hover:translate-x-1" />
                                         </div>
                                       </div>
                                     );
                                   })
                                ) : (
                                  <div className="py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-10">
                                    <RefreshCw className="w-16 h-16 text-gray-200 mb-6 animate-spin-slow" />
                                    <h4 className="font-black text-brand-dark uppercase tracking-tighter text-xl">Nessun reso attivo</h4>
                                    <p className="text-gray-400 text-sm font-bold mt-2 max-w-[300px]">Qui appariranno i prodotti per i quali hai chiesto assistenza o reso in fase di lavorazione.</p>
                                    <button onClick={() => setActiveUserView('return_select')} className="mt-8 bg-brand-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all shadow-xl active:scale-95">Inizia un reso</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                           {activeUserView === ('return_detail' as any) && selectedReturnDetail && (
                             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                               <div className="flex items-center justify-between">
                                 <button onClick={() => setActiveUserView('returns')} className="flex items-center gap-2 text-xs font-black text-brand-dark uppercase tracking-widest hover:text-brand-blue transition-all">
                                   <ChevronLeft className="w-4 h-4" />
                                   Torna ai Resi
                                 </button>
                                 <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black bg-brand-blue/5 text-brand-blue px-3 py-1 rounded-lg uppercase tracking-widest">Pratica: {selectedReturnDetail.id}</span>
                                 </div>
                               </div>

                               <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                                 {/* Header Info */}
                                 <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
                                   <div className="w-20 h-20 bg-white rounded-2xl p-2 border border-gray-100 shrink-0">
                                     <img src={selectedReturnDetail.product.image} className="w-full h-full object-contain" />
                                   </div>
                                   <div className="flex-1 text-center md:text-left">
                                     <h4 className="text-xl font-black text-brand-dark uppercase tracking-tighter">{selectedReturnDetail.product.name}</h4>
                                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Ordine #{selectedReturnDetail.orderId} &bull; Quantità: {selectedReturnDetail.product.qty}</p>
                                   </div>
                                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedReturnDetail.status === 'pending' || selectedReturnDetail.status === 'processing' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                     {selectedReturnDetail.status === 'pending' ? 'Attesa Revisione' : 
                                      selectedReturnDetail.status === 'processing' ? 'In Gestione' : 
                                      selectedReturnDetail.status.toUpperCase()}
                                   </div>
                                 </div>

                                 {/* Chat area */}
                                 <div className="p-8 space-y-8">
                                   <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar flex flex-col">
                                     {selectedReturnDetail.messages.map((m: any, i: number) => (
                                       <div key={i} className={`flex flex-col ${m.role === 'admin' ? 'items-start' : 'items-end'}`}>
                                         <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold ${m.role === 'admin' ? 'bg-gray-100 text-brand-dark rounded-tl-none border border-gray-200' : 'bg-brand-blue text-white rounded-tr-none shadow-lg shadow-brand-blue/10'}`}>
                                           {m.text}
                                         </div>
                                         <span className="text-[8px] font-black uppercase tracking-widest text-gray-300 mt-2 px-2">{m.date}</span>
                                       </div>
                                     ))}
                                   </div>

                                   {/* Photo request specialized field */}
                                   {(selectedReturnDetail.messages.some((m: any) => m.role === 'admin' && (m.text.toLowerCase().includes('foto') || m.text.toLowerCase().includes('immagine'))) || (selectedReturnDetail.status === 'processing' && !selectedReturnDetail.photos?.length)) && (
                                     <div className="p-6 bg-brand-yellow/5 rounded-3xl border border-brand-yellow/20 space-y-4 animate-in zoom-in-95 duration-500">
                                       <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-dark shadow-sm">
                                           <Camera className="w-5 h-5" />
                                         </div>
                                         <div>
                                           <p className="text-xs font-black text-brand-dark uppercase tracking-tight">Caricamento Foto Richiesto</p>
                                           <p className="text-[9px] font-bold text-gray-400 mt-0.5">Aggiungi foto del prodotto per accelerare la pratica</p>
                                         </div>
                                       </div>
                                       <div className="flex flex-wrap gap-2">
                                         {selectedReturnDetail.photos?.map((p: string, idx: number) => (
                                           <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group">
                                             <img src={p} className="w-full h-full object-cover" />
                                           </div>
                                         ))}
                                         <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-white transition-all text-gray-300 hover:text-brand-yellow">
                                           <Plus className="w-6 h-6" />
                                           <input 
                                             type="file" 
                                             accept="image/*" 
                                             className="hidden" 
                                             onChange={(e) => handleFileChange(e, (url) => handleReturnPhotoMessage(selectedReturnDetail.id, url))} 
                                           />
                                         </label>
                                       </div>
                                     </div>
                                   )}

                                   {/* User Response field */}
                                   <div className="flex gap-4 pt-4 border-t border-gray-100">
                                     <textarea 
                                       placeholder="Scrivi qui il tuo messaggio all'assistenza..."
                                       className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-sm font-bold focus:border-brand-yellow focus:bg-white outline-none transition-all resize-none h-24"
                                       value={userReturnMsg}
                                       onChange={(e) => setUserReturnMsg(e.target.value)}
                                     />
                                     <button 
                                       onClick={() => handleUserReturnMessage(selectedReturnDetail.id, userReturnMsg)}
                                       className="w-16 h-16 self-end mb-1 bg-neutral-950 text-white rounded-2xl flex items-center justify-center hover:bg-brand-orange transition-all active:scale-95 shadow-lg shadow-brand-yellow/20"
                                     >
                                       <ArrowRight className="w-6 h-6" />
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}

                          {activeUserView === 'return_select' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                              <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Scegli Cosa Rendere</h3>
                                <button onClick={() => setActiveUserView('returns')} className="text-xs font-black text-brand-blue uppercase tracking-widest border-b-2 border-brand-blue hover:text-brand-dark hover:border-brand-dark transition-all">Indietro</button>
                              </div>
                              
                              <p className="text-sm font-bold text-gray-500 leading-relaxed italic border-l-4 border-brand-yellow pl-4">Seleziona un prodotto dai tuoi ordini consegnati per avviare la procedura. Hai 2 anni per richiedere il reso.</p>

                              <div className="space-y-8 mt-8">
                                {orders.filter(o => o.status === 'delivered' && (o.email === currentUser?.email || currentUser?.email === 'marco.rossi@example.com')).length > 0 ? (
                                  orders.filter(o => o.status === 'delivered' && (o.email === currentUser?.email || currentUser?.email === 'marco.rossi@example.com')).map(order => (
                                    <div key={order.id} className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 overflow-hidden relative group">
                                      <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm border border-gray-50">
                                            <ShoppingBag className="w-6 h-6" />
                                          </div>
                                          <div className="text-left">
                                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Ordine #{order.id}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{order.date}</p>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-brand-blue text-white px-4 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-brand-dark transition-colors">Consegnato</span>
                                      </div>
                                      
                                      <div className="space-y-4">
                                         {order.items.map(item => {
                                           const isItemReturning = returnRequests.some(r => r.orderId === order.id && r.product.id === item.id);
                                           const oDate = parseOrderDate(order.date);
                                           const n = new Date();
                                           const diff = n.getTime() - oDate.getTime();
                                           const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                           const isExpired = days > 730;
                                           return (
                                             <div key={item.id} className={`bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 transition-all shadow-sm ${isItemReturning ? 'opacity-80 grayscale' : 'hover:shadow-xl'}`}>
                                               <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-50 p-2 shrink-0 overflow-hidden">
                                                 <img src={item.image} className="w-full h-full object-contain" />
                                               </div>
                                               <div className="flex-1 text-left overflow-hidden">
                                                 <h5 className="font-black text-brand-dark truncate uppercase text-sm leading-tight mb-1">{item.name}</h5>
                                                 <p className="text-xs font-bold text-gray-400 italic">€{item.price.toFixed(2)} — {item.qty} articolo/i</p>
                                               </div>
                                               {isItemReturning ? (
                                                  <div className="bg-gray-50 text-gray-400 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-gray-200 cursor-default flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                    Richiesta Attiva
                                                  </div>
                                               ) : isExpired ? (
                                                  <div className="bg-gray-50 text-red-500/80 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-100 cursor-default flex items-center gap-2">
                                                    Reso Scaduto
                                                  </div>
                                               ) : (
                                                  <button 
                                                    onClick={() => {
                                                      setSelectedReturnOrder(order);
                                                      setSelectedReturnItem(item);
                                                      setReturnQty(1);
                                                      setActiveUserView('return_form');
                                                    }}
                                                    className="bg-neutral-950 hover:bg-neutral-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-yellow/20"
                                                  >
                                                    Seleziona
                                                  </button>
                                               )}
                                             </div>
                                           );
                                         })}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-12 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
                                    <RefreshCw className="w-12 h-12 text-gray-300 mb-4 animate-spin-slow" />
                                    <h4 className="font-black text-brand-dark uppercase tracking-tighter text-lg leading-tight">Nessun ordine rimborsabile</h4>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {activeUserView === 'return_form' && selectedReturnItem && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                              <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Dettagli Reso Prodotto</h3>
                                <button onClick={() => { setActiveUserView('menu'); setSelectedReturnItem(null); }} className="text-xs font-black text-brand-blue uppercase tracking-widest border-b-2 border-brand-blue hover:text-brand-dark hover:border-brand-dark transition-all">Annulla</button>
                              </div>

                              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 italic">
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 flex-shrink-0 overflow-hidden p-2">
                                    <img src={selectedReturnItem.image} alt={selectedReturnItem.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ordine #{selectedReturnOrder.id}</p>
                                    <p className="font-black text-brand-dark leading-tight">{selectedReturnItem.name}</p>
                                    <p className="text-xs font-bold text-brand-blue mt-1 italic uppercase tracking-tighter">€{selectedReturnItem.price.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                                    <label className="text-[10px] font-black text-brand-blue uppercase tracking-widest block ml-1">Quantità da Rendere</label>
                                    <div className="flex items-center gap-6">
                                      <button 
                                        onClick={() => setReturnQty(Math.max(1, returnQty - 1))}
                                        className="w-12 h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center font-black text-brand-dark hover:border-brand-yellow hover:bg-white transition-all shadow-sm"
                                      >
                                        -
                                      </button>
                                      <div className="flex flex-col items-center">
                                        <span className="text-2xl font-black text-brand-dark">{returnQty}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Articoli</span>
                                      </div>
                                      <button 
                                        onClick={() => setReturnQty(Math.min(selectedReturnItem.qty, returnQty + 1))}
                                        className="w-12 h-12 bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center font-black text-brand-dark hover:border-brand-yellow hover:bg-white transition-all shadow-sm"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 italic">Disponibili nell'ordine: {selectedReturnItem.qty}</p>
                                  </div>

                                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                                    <label className="text-[10px] font-black text-brand-blue uppercase tracking-widest block ml-1">Documentazione Fotografica (Obbligatoria - 3 Foto)</label>
                                    <div className="flex flex-wrap gap-3">
                                      {returnPhotos.map((photo, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                                          <img src={photo} className="w-full h-full object-cover" />
                                          <button 
                                            onClick={() => setReturnPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                      {returnPhotos.length < 3 && (
                                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-red-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-gray-300 hover:text-brand-yellow bg-red-50/10">
                                          <Camera className="w-6 h-6 mb-1 text-red-400" />
                                          <span className="text-[8px] font-black uppercase text-red-500">Carica</span>
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => handleFileChange(e, (url) => setReturnPhotos(prev => [...prev, url]))} 
                                          />
                                        </label>
                                      )}
                                    </div>
                                    <p className="text-[9px] font-bold text-red-500 italic">Per inviare la richiesta devi caricare esattamente 3 foto del prodotto.</p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 block ml-2">Motivazione del Reso</label>
                                  <textarea 
                                    className="w-full bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 text-sm font-bold focus:border-brand-yellow transition-all resize-none shadow-sm focus:shadow-xl focus:shadow-brand-yellow/5 outline-none min-h-[160px]"
                                    placeholder="Descrivi dettagliatamente il motivo della richiesta..."
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                  />
                                </div>
                                <button 
                                  onClick={() => {
                                    if (returnPhotos.length < 3) { addToast("Carica esattamente 3 foto per procedere con il reso!", "error"); return; }
                                    if (!returnReason.trim()) { addToast("Indica la motivazione prima di inviare!", "info"); return; }
                                    setIsReturnSubmitting(true);
                                    setTimeout(() => {
                                      // Update order if needed (e.g., add a flag or note), but keep status as is per user request
                                      setOrders(prev => prev.map(o => o.id === selectedReturnOrder.id 
                                        ? { ...o, hasReturnRequest: true } : o));
                                      
                                      // Create return request
                                      const newRequest = {
                                        id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
                                        orderId: selectedReturnOrder.id,
                                        customer: currentUser?.name || 'Cliente',
                                        customerEmail: currentUser?.email || '',
                                        date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
                                        product: { ...selectedReturnItem, qty: returnQty },
                                        reason: returnReason.length > 30 ? returnReason.substring(0, 27) + '...' : returnReason,
                                        details: returnReason,
                                        photos: returnPhotos,
                                        status: 'pending',
                                        messages: [{ role: 'user', text: `Richiesta reso per ${returnQty}x ${selectedReturnItem.name}. Motivo: ${returnReason}`, date: new Date().toLocaleString('it-IT') }],
                                        history: [{ status: "Richiesta Inviata", date: new Date().toLocaleString('it-IT') }]
                                      };
                                      setReturnRequests(prev => [newRequest, ...prev]);
                                      
                                      setIsReturnSubmitting(false);
                                      setReturnReason('');
                                      setReturnQty(1);
                                      setReturnPhotos([]);
                                      setSelectedReturnItem(null);
                                      setActiveUserView('returns');
                                      addToast("La tua richiesta di reso per questo prodotto è stata inviata con successo.", "success");
                                    }, 1000);
                                  }}
                                  disabled={isReturnSubmitting || returnPhotos.length < 3}
                                  className="w-full bg-brand-dark text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                  {isReturnSubmitting ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Inviando...
                                    </>
                                  ) : (
                                    returnPhotos.length < 3 
                                      ? `Carica altre ${3 - returnPhotos.length} foto per procedere`
                                      : "Invia Richiesta di Rimborso Prodotto"
                                  )}
                                </button>
                              </div>
                            )}

                          {activeUserView === 'review_form' && selectedReviewItem && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                               <div className="flex items-center justify-between">
                                 <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Lascia una Recensione</h3>
                                 <button onClick={() => { setActiveUserView('menu'); setSelectedReviewItem(null); }} className="text-xs font-black text-brand-blue uppercase tracking-widest border-b-2 border-brand-blue hover:text-brand-dark hover:border-brand-dark transition-all">Annulla</button>
                               </div>

                               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                 <div className="flex items-center gap-4">
                                   <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex-shrink-0 overflow-hidden p-2">
                                     <img src={selectedReviewItem.image} alt={selectedReviewItem.name} className="w-full h-full object-contain" />
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ordine #{selectedReviewItem.orderId}</p>
                                     <p className="font-black text-brand-dark leading-tight">{selectedReviewItem.name}</p>
                                   </div>
                                 </div>
                               </div>

                               <div className="space-y-8 py-4">
                                 <div className="flex flex-col items-center gap-4">
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valutazione</p>
                                   <div className="flex gap-2">
                                     {[1, 2, 3, 4, 5].map(star => (
                                       <button 
                                         key={star}
                                         onClick={() => setReviewRating(star)}
                                         className="p-1 hover:scale-125 transition-transform"
                                       >
                                         <Star className={`w-10 h-10 ${star <= reviewRating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-200'}`} />
                                       </button>
                                     ))}
                                   </div>
                                   <p className="text-sm font-black text-brand-dark uppercase">
                                     {reviewRating === 1 ? 'Scarso' : reviewRating === 2 ? 'Sufficiente' : reviewRating === 3 ? 'Buono' : reviewRating === 4 ? 'Ottimo' : 'Eccellente'}
                                   </p>
                                 </div>

                                 <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Commento (Facoltativo)</label>
                                   <textarea 
                                     className="w-full bg-white border-2 border-gray-100 rounded-[2rem] p-6 text-sm font-bold focus:border-brand-yellow transition-all font-mono resize-none h-40"
                                     placeholder="Cosa ne pensi di questo prodotto? La tua opinione aiuterà altri acquirenti..."
                                     value={reviewComment}
                                     onChange={(e) => setReviewComment(e.target.value)}
                                   />
                                 </div>

                                 <button 
                                   onClick={() => {
                                     setIsReviewSubmitting(true);
                                     setTimeout(() => {
                                       const newReview = {
                                         id: `rev-${Date.now()}`,
                                         productId: selectedReviewItem.id,
                                         orderId: selectedReviewItem.orderId,
                                         customerName: currentUser?.name || 'Cliente',
                                         rating: reviewRating,
                                         comment: reviewComment,
                                         date: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
                                         status: 'pending'
                                       };
                                       setProductReviews(prev => [newReview, ...prev]);
                                       setIsReviewSubmitting(false);
                                       setReviewRating(0);
                                       setReviewComment('');
                                       setSelectedReviewItem(null);
                                       setActiveUserView('menu');
                                       addToast("Grazie! La tua recensione è stata inviata e sarà visibile dopo l'approvazione.", "success");
                                     }, 1000);
                                   }}
                                   disabled={isReviewSubmitting || reviewRating === 0}
                                   className="w-full bg-brand-dark text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                 >
                                   {isReviewSubmitting ? (
                                     <>
                                       <RefreshCw className="w-4 h-4 animate-spin" />
                                       Inviando...
                                     </>
                                   ) : (
                                     "Invia Recensione"
                                   )}
                                 </button>
                               </div>
                            </div>
                          )}
                          </>
                        </div>
                      )}

                      {authStep === 'edit_profile' && (
                        <div className="space-y-4">
                          <form className="space-y-3 text-left" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome</label>
                                <input type="text" value={profileEditForm.nameFirst} onChange={e => setProfileEditForm({...profileEditForm, nameFirst: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Es. Mario" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cognome</label>
                                <input type="text" value={profileEditForm.nameLast} onChange={e => setProfileEditForm({...profileEditForm, nameLast: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Es. Rossi" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Recapito Telefonico</label>
                              <input type="tel" value={profileEditForm.phone} onChange={e => setProfileEditForm({...profileEditForm, phone: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none" placeholder="+39 333 1234567" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email di Accesso (Non modificabile)</label>
                              <div className="w-full bg-gray-100 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold text-gray-500 cursor-not-allowed">
                                {currentUser?.email}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Indirizzo / Via e Civico</label>
                              <input type="text" value={profileEditForm.addressStreet} onChange={e => setProfileEditForm({...profileEditForm, addressStreet: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none" placeholder="Es. Via Roma, 1"/>
                            </div>
                            <div className="grid grid-cols-6 gap-3">
                              <div className="space-y-1 col-span-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Città</label>
                                <input type="text" value={profileEditForm.addressCity} onChange={e => setProfileEditForm({...profileEditForm, addressCity: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none" placeholder="Es. Milano"/>
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CAP</label>
                                <input type="text" value={profileEditForm.addressZip} onChange={e => setProfileEditForm({...profileEditForm, addressZip: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none" placeholder="20100"/>
                              </div>
                              <div className="space-y-1 col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Prov</label>
                                <input type="text" value={profileEditForm.addressProvince} onChange={e => setProfileEditForm({...profileEditForm, addressProvince: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold uppercase text-brand-dark focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none" placeholder="MI" maxLength={2} />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Codice Fiscale / P.IVA</label>
                              <input type="text" value={profileEditForm.taxCode} onChange={e => setProfileEditForm({...profileEditForm, taxCode: e.target.value})} className="w-full bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none uppercase" placeholder="Es. RSSMRA80A01H501U" />
                            </div>
                            <div className="pt-2 flex flex-col gap-2">
                              <button type="submit" disabled={authSubmitting} className="w-full bg-brand-blue hover:bg-brand-dark text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                {authSubmitting ? 'Salvataggio in corso...' : 'Salva Dati Profilo e Spedizione'}
                              </button>
                              <button type="button" onClick={() => setAuthStep('profile')} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-700 p-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all">
                                Torna al Riepilogo Profilo
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {authStep === 'orders' && (
                        <div className="space-y-6 text-left">
                          {orders.filter(o => o.email === currentUser?.email || currentUser?.email === 'marco.rossi@example.com').length > 0 ? (
                            <div className="space-y-4">
                              {orders.filter(o => o.email === currentUser?.email || currentUser?.email === 'marco.rossi@example.com').map(order => (
                                <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{order.date}</span>
                                      <h4 className="text-lg font-black text-brand-dark mt-1">Ordine #{order.id}</h4>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                      order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                      order.status === 'refunded' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                                      'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                      {order.status === 'delivered' ? 'Consegnato' : order.status === 'shipped' ? 'In Spedizione' : order.status === 'refunded' ? 'Rimborsato' : 'In Elaborazione'}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3 mb-6">
                                    {(order.items || []).map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden p-1">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                          <p className="text-xs font-bold text-brand-dark truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">Qt. {item.qty} &bull; €{item.price.toFixed(2)}</p>
                                        </div>
                                        {order.status === 'delivered' && (
                                          <div className="flex gap-2">
                                            {(() => {
                                              const request = returnRequests.find(r => r.orderId === order.id && r.product?.id === item.id);
                                              const review = productReviews.find(r => r.orderId === order.id && r.productId === item.id);
                                              const oDate = parseOrderDate(order.date);
                                              const n = new Date();
                                              const diff = n.getTime() - oDate.getTime();
                                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                              const isExpired = days > 730;
                                              const isReturnActive = !!request;
                                              
                                              let returnLabel = 'Reso';
                                              if (isExpired) returnLabel = 'Reso Scaduto';
                                              if (isReturnActive) {
                                                returnLabel = request.status === 'pending' ? 'Richiesta Inviata' :
                                                              request.status === 'processing' ? 'In Lavorazione' :
                                                              request.status === 'approved' ? 'Approvato' :
                                                              request.status === 'rejected' ? 'Rifiutato' : 'Completato';
                                              }

                                              return (
                                                <div className="flex gap-2">
                                                  {review ? (
                                                    <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-400 rounded-xl font-black uppercase text-[8px] tracking-widest cursor-default">
                                                      <Star className="w-2.5 h-2.5 fill-gray-400" />
                                                      Recensito
                                                    </div>
                                                  ) : (
                                                    <button 
                                                      onClick={() => {
                                                        setSelectedReviewItem({ ...item, orderId: order.id });
                                                        setReviewRating(5);
                                                        setReviewComment('');
                                                        setActiveUserView('review_form');
                                                        setAuthStep('profile');
                                                      }}
                                                      className="px-3 py-2 bg-brand-blue/10 hover:bg-brand-blue hover:text-white text-brand-blue rounded-xl font-black uppercase text-[8px] tracking-widest transition-all active:scale-95 flex items-center gap-1 shrink-0"
                                                    >
                                                      <Star className="w-2.5 h-2.5" />
                                                      Recensisci
                                                    </button>
                                                  )}

                                                  {isReturnActive ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 text-white rounded-xl font-black uppercase text-[8px] tracking-widest shadow-lg shadow-brand-yellow/10 border border-brand-yellow/50 scale-105 cursor-default">
                                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                                      {returnLabel}
                                                    </div>
                                                  ) : (
                                                    <button 
                                                      disabled={isExpired}
                                                      onClick={() => {
                                                        setSelectedReturnOrder(order);
                                                        setSelectedReturnItem(item);
                                                        setReturnQty(1);
                                                        setActiveUserView('return_form');
                                                        setAuthStep('profile');
                                                      }}
                                                      className={`px-3 py-2 rounded-xl font-black uppercase text-[8px] tracking-widest transition-all shrink-0 flex items-center gap-1 ${
                                                        isExpired 
                                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale' 
                                                          : 'bg-brand-yellow/20 text-brand-dark hover:bg-brand-yellow active:scale-95'
                                                      }`}
                                                      title={isExpired ? "Termine massimo superato" : "Richiedi il reso"}
                                                    >
                                                      <RefreshCw className="w-2.5 h-2.5" />
                                                      {returnLabel}
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {expandedUserOrders[order.id] && (
                                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50/50 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                          <User className="w-3.5 h-3.5 text-brand-blue" /> Destinatario
                                        </p>
                                        <p className="font-bold text-brand-dark leading-relaxed pl-5">
                                          {order.customer}
                                        </p>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                          <MapPin className="w-3.5 h-3.5 text-brand-blue" /> Indirizzo di Spedizione
                                        </p>
                                        <p className="font-bold text-brand-dark leading-relaxed pl-5">
                                          {order.address}
                                        </p>
                                      </div>
                                      <div className="space-y-2 md:col-span-2">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                          <CreditCard className="w-3.5 h-3.5 text-brand-blue" /> Metodo di Pagamento
                                        </p>
                                        <p className="font-bold text-brand-dark pl-5 uppercase">
                                          {order.payment || 'Non specificato'}
                                        </p>
                                      </div>
                                      {(order.carrierId || order.trackingId) && (
                                        <div className="space-y-2 md:col-span-2 pt-2 border-t border-gray-100">
                                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-brand-yellow" /> Dettagli Spedizione
                                          </p>
                                          <div className="pl-5 flex flex-wrap gap-4 items-center">
                                            {order.carrierId && (
                                              <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg font-black uppercase text-[9px] tracking-wider text-brand-dark">
                                                Corriere: {
                                                  order.carrierId === 'gls' ? 'GLS Italy' :
                                                  order.carrierId === 'dhl' ? 'DHL Express' :
                                                  order.carrierId === 'brt' ? 'BRT Corriere Espresso' :
                                                  order.carrierId === 'poste' ? 'Poste Italiane' : order.carrierId
                                                }
                                              </span>
                                            )}
                                            {order.trackingId && (
                                              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg font-black text-[9px] tracking-widest">
                                                Tracking: {order.trackingId}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                                    <div className="text-left">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Totale Dispendio</p>
                                      <p className="text-lg font-black text-brand-dark">€{order.total.toFixed(2)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      {order.status === 'shipped' && (
                                        <button 
                                          onClick={() => {
                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'delivered' } : o));
                                            addToast("Consegna confermata con successo! Ora puoi recensire i prodotti.", "success");
                                          }}
                                          className="px-4 py-2 bg-neutral-950 text-white hover:bg-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-brand-dark/20"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                          Conferma Ricevimento
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => setExpandedUserOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                                        className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${
                                          expandedUserOrders[order.id]
                                            ? 'bg-neutral-950 text-white'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {expandedUserOrders[order.id] ? 'Chiudi' : 'Dettagli'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-10 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                              <Box className="w-12 h-12 text-gray-300 mb-3" />
                              <p className="text-brand-dark font-black text-xl uppercase tracking-tighter">Nessun ordine</p>
                              <p className="text-gray-400 text-sm font-bold px-6 mt-1">Non hai ancora effettuato ordini.<br/>Scopri le novità in vetrina!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeUserView === 'favorites' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic">I Miei Preferiti</h3>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Prodotti che hai salvato</p>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-[1.2rem] gap-1">
                               <button 
                                 onClick={() => setFavoritesViewMode('grid')}
                                 className={`p-2.5 rounded-xl transition-all ${favoritesViewMode === 'grid' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                               >
                                 <LayoutGrid className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => setFavoritesViewMode('carousel')}
                                 className={`p-2.5 rounded-xl transition-all ${favoritesViewMode === 'carousel' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                               >
                                 <Grid className="w-4 h-4 rotate-45" />
                               </button>
                            </div>
                          </div>
                          
                          {favorites.length > 0 ? (
                             favoritesViewMode === 'grid' ? (
                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                 {products.filter(p => favorites.includes(p.id)).map((p, idx) => (
                                   <MiniProductCard 
                                     key={p.id} 
                                     product={p} 
                                     onClick={() => { handleProductSelect(p); setIsAuthOpen(false); }}
                                     onRemove={toggleFavorite}
                                     index={idx}
                                   />
                                 ))}
                               </div>
                             ) : (
                               <div className="relative overflow-hidden p-2 -m-2">
                                 <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x snap-mandatory scroll-smooth">
                                   {products.filter(p => favorites.includes(p.id)).map((p, idx) => (
                                     <MiniProductCard 
                                       key={p.id} 
                                       product={p} 
                                       onClick={() => { handleProductSelect(p); setIsAuthOpen(false); }}
                                       onRemove={toggleFavorite}
                                       index={idx}
                                       isCarousel={true}
                                     />
                                   ))}
                                 </div>
                               </div>
                             )
                          ) : (
                            <div className="py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-10">
                              <Heart className="w-16 h-16 text-gray-200 mb-6" />
                              <h4 className="font-black text-brand-dark uppercase tracking-tighter text-xl">Nessun preferito</h4>
                              <p className="text-gray-400 text-sm font-bold mt-2 max-w-[300px]">Inizia ad aggiungere i prodotti che ami cliccando sull'icona a cuore!</p>
                              <button onClick={() => { setIsAuthOpen(false); }} className="mt-8 bg-brand-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all shadow-xl active:scale-95">Esplora Catalogo</button>
                            </div>
                          )}
                        </div>
                      )}

                      {authStep === 'support' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a href="mailto:assistenza@vincentstore.it" className="bg-white border border-gray-100 rounded-3xl p-6 text-center hover:border-brand-blue hover:shadow-lg transition-all group flex flex-col items-center gap-3">
                              <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-brand-dark uppercase tracking-tighter text-sm">Invia Email</h4>
                                <p className="text-xs text-gray-400 font-bold mt-1">Scrivici dalla tua casella</p>
                              </div>
                            </a>
                            <a href="tel:+390000000000" className="bg-white border border-gray-100 rounded-3xl p-6 text-center hover:border-green-500 hover:shadow-lg transition-all group flex flex-col items-center gap-3">
                              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-black text-brand-dark uppercase tracking-tighter text-sm">Contatto Telefonico</h4>
                                <p className="text-xs text-gray-400 font-bold mt-1">Parla con il supporto</p>
                              </div>
                            </a>
                          </div>
                          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mt-2">
                            <h4 className="font-black text-brand-dark flex items-center gap-2 uppercase tracking-tighter text-sm mb-4">
                              <MessageCircle className="w-4 h-4 text-brand-blue" />
                              Messaggio Diretto Dalla Piattaforma
                            </h4>
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); addToast('Messaggio inviato con successo! Ti risponderemo a breve.', 'success'); setAuthStep('profile'); }}>
                              <textarea required className="w-full bg-white border-gray-200 border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none resize-none h-32" placeholder="Scrivi qui la tua richiesta o problema e il nostro team ti risponderà nel più breve tempo possibile..."></textarea>
                              <button type="submit" className="w-full bg-brand-dark hover:bg-brand-blue text-white p-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
                                Invia Messaggio
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Sidebar Links (Right Side Desktop / Bottom Mobile) */}
                    <div className="w-full md:w-80 space-y-4 order-1 md:order-2 md:border-l md:border-gray-100 md:pl-8">
                       <h3 className="hidden md:block text-xs font-black text-gray-300 uppercase tracking-widest ml-1 mb-2">Collegamenti Rapidi</h3>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                        <button 
                          onClick={() => { setAuthStep('profile'); setActiveUserView('profile'); }}
                          className={`p-4 bg-white border ${authStep === 'profile' && activeUserView === 'profile' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}
                        >
                          <LayoutDashboard className={`w-6 h-6 ${authStep === 'profile' && activeUserView === 'profile' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">Dashboard<br/>Account</span>
                        </button>
                        <button onClick={() => setAuthStep('orders')} className={`p-4 bg-white border ${authStep === 'orders' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}>
                          <Box className={`w-6 h-6 ${authStep === 'orders' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">I miei<br/>ordini</span>
                        </button>
                        <button onClick={() => setAuthStep('edit_profile')} className={`p-4 bg-white border ${authStep === 'edit_profile' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}>
                          <User className={`w-6 h-6 ${authStep === 'edit_profile' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">Dati e<br/>Profilo</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (!currentUser) { setAuthStep('email'); return; }
                            setAuthStep('profile');
                            setActiveUserView('returns');
                          }}
                          className={`p-4 bg-white border ${activeUserView === 'returns' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}
                        >
                          <RefreshCw className={`w-6 h-6 ${activeUserView === 'returns' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">Resi e<br/>Rimborsi</span>
                        </button>
                        <button 
                          onClick={() => { setAuthStep('profile'); setActiveUserView('favorites'); }}
                          className={`p-4 bg-white border ${activeUserView === 'favorites' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}
                        >
                          <Heart className={`w-6 h-6 ${activeUserView === 'favorites' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">I Miei<br/>Preferiti</span>
                        </button>
                        <button onClick={() => setAuthStep('support')} className={`p-4 bg-white border ${authStep === 'support' ? 'border-brand-yellow ring-2 ring-brand-yellow/20' : 'border-gray-100'} rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-yellow/10 hover:border-brand-yellow transition-all group shadow-sm active:scale-95`}>
                          <MessageCircle className={`w-6 h-6 ${authStep === 'support' ? 'text-brand-dark' : 'text-brand-blue'} group-hover:text-brand-dark transition-colors`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark text-center leading-tight">Assistenza<br/> Clienti</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => { logout(); setIsAuthOpen(false); setAuthStep('email'); }}
                        disabled={authSubmitting}
                        className="w-full mt-4 bg-neutral-100 hover:bg-neutral-950 text-neutral-700 hover:text-white p-3.5 rounded-xl font-normal uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-50"
                      >
                        Esci
                      </button>
                      <button 
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={authSubmitting}
                        className="w-full mt-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 p-3 rounded-xl font-light text-[10px] uppercase tracking-[0.15em] transition-all disabled:opacity-50"
                      >
                        Elimina account
                      </button>
                    </div>
                  </div>
                )}

                {authStep === 'email' && (
                  <div className="space-y-6">
                    <form onSubmit={handleAuthEmailContinue} className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label className="auth-field-label">Email</label>
                        <input 
                          type="email" 
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="auth-field-input"
                          placeholder="tu@email.com"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={authSubmitting}
                        className="auth-btn-primary"
                      >
                        {authSubmitting ? 'Attendere…' : 'Continua'}
                      </button>
                    </form>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[#fafafa] px-4 text-[10px] font-light uppercase tracking-[0.2em] text-neutral-400">oppure accedi</span>
                      </div>
                    </div>

                    <form onSubmit={handleAuthLogin} className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="auth-field-label">Username o email</label>
                        <input
                          type="text"
                          required
                          value={authLoginId}
                          onChange={(e) => setAuthLoginId(e.target.value)}
                          className="auth-field-input"
                          placeholder="username o tu@email.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="auth-field-label">Password</label>
                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="auth-field-input pr-12"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" disabled={authSubmitting} className="auth-btn-primary">
                        {authSubmitting ? 'Accesso…' : 'Accedi'}
                      </button>
                    </form>
                  </div>
                )}

                {authStep === 'login' && (
                  <form onSubmit={handleAuthLogin} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="auth-field-label">Username o email</label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={authLoginId || authEmail}
                        onChange={(e) => setAuthLoginId(e.target.value)}
                        className="auth-field-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="auth-field-label">Password</label>
                      <div className="relative">
                        <input 
                          type={showLoginPassword ? "text" : "password"} 
                          required
                          autoFocus
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="auth-field-input pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                        >
                          {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={authSubmitting}
                      className="auth-btn-primary"
                    >
                      {authSubmitting ? 'Accesso…' : 'Accedi'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthStep('email')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue pt-4 transition-colors"
                    >
                      Torna indietro o cambia email
                    </button>
                  </form>
                )}

                {authStep === 'register' && (
                  <form onSubmit={handleAuthRegister} className="space-y-4 text-left">
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Stai creando l'account per:</span>
                        <span className="text-xs font-bold text-neutral-900">{authEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAuthStep('email')}
                        className="text-[10px] font-bold text-brand-blue hover:underline"
                      >
                        Cambia
                      </button>
                    </div>

                    {/* Password con Occhietto (Obbligatoria) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-700 ml-1">Scegli una Password *</label>
                      <div className="relative">
                        <input 
                          type={showAuthPassword ? "text" : "password"} 
                          required
                          autoFocus
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-gray-50 border-gray-200 border rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all shadow-inner outline-none"
                          placeholder="Minimo 6 caratteri"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthPassword(!showAuthPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showAuthPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Nome e Cognome Opzionali */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 ml-1">Nome (opzionale)</label>
                        <input 
                          type="text" 
                          value={authFirstName}
                          onChange={(e) => setAuthFirstName(e.target.value)}
                          className="w-full bg-gray-50 border-gray-200 border rounded-xl px-3.5 py-3 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all outline-none"
                          placeholder="Es. Mario"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 ml-1">Cognome (opzionale)</label>
                        <input 
                          type="text" 
                          value={authLastName}
                          onChange={(e) => setAuthLastName(e.target.value)}
                          className="w-full bg-gray-50 border-gray-200 border rounded-xl px-3.5 py-3 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all outline-none"
                          placeholder="Es. Rossi"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-600 leading-relaxed bg-brand-yellow/15 p-3 rounded-xl border border-brand-yellow/30">
                      💡 <strong>Registrazione rapida:</strong> Ti bastano email e password per creare l'account. Potrai completare o modificare in qualsiasi momento l'indirizzo di spedizione (via, civico, CAP, città, telefono) nella tua <strong>Scheda Profilo</strong>.
                    </p>
                    
                    <button 
                      type="submit"
                      disabled={authSubmitting}
                      className="auth-btn-primary mt-2"
                    >
                      {authSubmitting ? 'Registrazione…' : 'Crea account'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthStep('email')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue pt-4 transition-colors"
                    >
                      Torna indietro
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <AnimatePresence>
        {adminConfirmAction && adminConfirmAction.active && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
              onClick={() => setAdminConfirmAction(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 overflow-hidden text-center"
            >
              <div className={`absolute top-0 inset-x-0 h-2 ${adminConfirmAction.color.includes('bg-red') ? 'bg-red-500' : 'bg-brand-yellow'}`}></div>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6">
                <AlertTriangle className={`w-10 h-10 ${adminConfirmAction.color.includes('bg-red') ? 'text-red-500' : 'text-brand-yellow'}`} />
              </div>
              <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-4">{adminConfirmAction.title}</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-10">{adminConfirmAction.message}</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAdminConfirmAction(null)}
                  className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                >
                  Annulla
                </button>
                <button 
                  onClick={() => {
                    adminConfirmAction.onConfirm();
                    setAdminConfirmAction(null);
                  }}
                  className={`py-4 ${adminConfirmAction.color} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg active:shadow-none`}
                >
                  Conferma
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


