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
  SlidersHorizontal,
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
import { AdminCompanySection } from "../components/admin/AdminCompanySection";
import { AdminSlidesSection } from "../components/admin/AdminSlidesSection";
import { AdminQuickLinksSection } from "../components/admin/AdminQuickLinksSection";
import { AdminSlidePickerList } from "../components/admin/AdminSlidePickerList";
import { AdminMassiveImport } from "./AdminMassiveImport";
import { AdminImageLinker } from "./AdminImageLinker";
import { AdminOrders, INITIAL_ORDERS } from "./AdminOrders";
import { AdminCouriers } from "./AdminCouriers";
import { AdminReturns } from "./AdminReturns";
import { AdminUsers } from "./AdminUsers";
import { AdminReviews } from "./AdminReviews";
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY, ADMIN_INPUT } from "../components/admin/adminTouchTargets";
import { getProductVariantInfo, getColorHex as getVariantColorHex } from "@/lib/productVariants";
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
      {(product.material?.trim() || product.features?.trim() || (product.description && product.description.replace(/<[^>]*>/g, '').trim())) && (
        <p className="text-[11px] text-gray-500 font-normal line-clamp-1 mb-1 leading-tight">
          {product.material?.trim() 
            ? product.material.trim() 
            : product.features?.trim() 
              ? product.features.trim() 
              : product.description.replace(/<[^>]*>/g, '').trim()}
        </p>
      )}
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
  const variantInfo = useMemo(() => getProductVariantInfo(product), [product]);
  const [selectedColor, setSelectedColor] = useState<string>(() => variantInfo.colors[0] || 'Nero');
  const [selectedSize, setSelectedSize] = useState<string>(() => variantInfo.sizes[0] || 'M');

  useEffect(() => {
    if (variantInfo.colors.length > 0 && !variantInfo.colors.includes(selectedColor)) {
      setSelectedColor(variantInfo.colors[0]);
    }
    if (variantInfo.sizes.length > 0 && !variantInfo.sizes.includes(selectedSize)) {
      setSelectedSize(variantInfo.sizes[0]);
    }
  }, [variantInfo]);

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
                {Boolean((selectedVariantObject && selectedVariantObject.title) || product.name) && (
                  <h2 className="text-2xl lg:text-3xl font-black text-brand-dark leading-tight">
                    {(selectedVariantObject && selectedVariantObject.title) ? selectedVariantObject.title : product.name}
                  </h2>
                )}
                {selectedVariantObject?.note && (
                  <div className="mt-3 p-3 bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-brand-orange tracking-wider">NOTA</p>
                    <p className="text-xs font-bold text-brand-dark mt-0.5">{selectedVariantObject.note}</p>
                  </div>
                )}
                {/* Peso nascosto lato utente */}
              </div>

              {/* Dettagli Sartoriali (Materiale, Manifattura, Vestibilità) - Mostrati solo se compilati */}
              {(Boolean(product.material?.trim()) || Boolean(product.manufacturing?.trim()) || Boolean(product.fit?.trim())) && (
                <div className="space-y-3">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">
                    Dettagli Sartoriali
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.material?.trim() && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <p className="text-[9px] text-gray-400 uppercase font-black mb-0.5">Materiale</p>
                        <p className="text-xs font-bold text-brand-dark">{product.material.trim()}</p>
                      </div>
                    )}
                    {product.manufacturing?.trim() && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <p className="text-[9px] text-gray-400 uppercase font-black mb-0.5">Manifattura</p>
                        <p className="text-xs font-bold text-brand-dark">{product.manufacturing.trim()}</p>
                      </div>
                    )}
                    {product.fit?.trim() && (
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 sm:col-span-2">
                        <p className="text-[9px] text-gray-400 uppercase font-black mb-0.5">Vestibilità</p>
                        <p className="text-xs font-bold text-brand-dark">{product.fit.trim()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description - Mostrata solo se presente e non vuota */}
              {Boolean(product.description && product.description.replace(/<[^>]*>/g, '').trim().length > 0) && (
                <div className="space-y-4">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Descrizione</h4>
                  <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                    <div 
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                      className="rich-content"
                    />
                  </div>
                </div>
              )}

              {/* Technical Specs & Caratteristiche - Mostrate solo se presenti */}
              {(Boolean(product.features?.trim()) || (product?.specs && Object.keys(product.specs).length > 0) || ((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || (!selectedVariantObject && product.showEan && product.ean))) && (
                <div className="space-y-6">
                  <h4 className="font-black text-sm uppercase tracking-widest text-brand-dark border-l-4 border-brand-yellow pl-3">Caratteristiche</h4>
                  {product.features?.trim() && (
                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-medium">
                      {product.features.trim()}
                    </div>
                  )}
                  {(((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || (!selectedVariantObject && product.showEan && product.ean)) || (product?.specs && Object.keys(product.specs).length > 0)) && (
                    <div className="grid grid-cols-2 gap-3">
                      {((selectedVariantObject && selectedVariantObject.showEan !== false && selectedVariantObject.ean) || 
                        (!selectedVariantObject && product.showEan && product.ean)) && (
                        <div className="bg-brand-blue text-white p-3 rounded-2xl border border-brand-blue shadow-lg shadow-brand-blue/10 col-span-2">
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
                  )}
                </div>
              )}
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
                
                {/* Selettore Colori (Pallini rotondi senza testo) */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-medium text-[11px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span>Colore</span>
                    <span className="text-neutral-500 font-normal">— {selectedColor}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {variantInfo.colors.map((col) => {
                      const isSelected = selectedColor === col;
                      const hex = getVariantColorHex(col);
                      const isWhite = hex.toLowerCase() === '#ffffff';

                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          title={col}
                          aria-label={`Colore ${col}`}
                          className={`w-7 h-7 rounded-full transition-all cursor-pointer shrink-0 ${
                            isWhite ? 'border border-neutral-300' : 'border border-black/10'
                          } ${
                            isSelected
                              ? 'ring-2 ring-neutral-950 ring-offset-2 ring-offset-white scale-110 shadow-sm'
                              : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Selettore Taglie */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-medium text-[11px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span>Taglia</span>
                    <span className="text-neutral-500 font-normal">— {selectedSize}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {variantInfo.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[42px] px-3.5 py-2 rounded-xl text-xs uppercase tracking-tight transition-all border cursor-pointer ${
                            isSelected
                              ? 'border-neutral-950 bg-neutral-950 text-white font-medium shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-400 text-neutral-700 bg-white font-normal hover:bg-neutral-50'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Eventuali Altre Varianti Personalizzate */}
                {Object.entries(variantInfo.customGroups).map(([type, options]) => (
                  <div key={type} className="space-y-2 pt-2">
                    <h4 className="font-semibold text-[10px] uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      {type}
                      {selectedVariants[type] && (
                        <span className="text-neutral-500 font-normal">— {selectedVariants[type]}</span>
                      )}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt: any) => (
                        <button
                          key={opt.id || opt.value}
                          onClick={() => setSelectedVariants({ ...selectedVariants, [type]: opt.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-tight transition-all border cursor-pointer ${
                            selectedVariants[type] === opt.value
                              ? 'border-neutral-950 bg-neutral-950 text-white font-semibold shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-400 text-neutral-600 bg-white font-normal'
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
                  name: selectedVariantObject ? `${product.name} - ${selectedVariantObject.value}` : product.name,
                  selectedSize,
                  selectedColor,
                  cartItemId: `${product.id}-${selectedSize}-${selectedColor}`,
                };
                for(let i=0; i<quantity; i++) onAddToCart(itemToAddToCart as any);
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

const CartDrawer = ({ 
  items, 
  onClose, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  onUpdateVariant
}: { 
  items: CartItem[]; 
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onUpdateVariant?: (id: string, size: string, color: string) => void;
  key?: string;
}) => {
  const [expandedItemKeys, setExpandedItemKeys] = useState<Record<string, boolean>>({});
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getAvailableSizes = (item: CartItem) => {
    const fromVariants = item.variants?.map((v: any) => v.size || v.value).filter(Boolean) || [];
    if (fromVariants.length > 0) return Array.from(new Set(fromVariants));
    if (item.category === 'Scarpe') return ['40', '41', '42', '43', '44', '45'];
    if (item.category === 'Jeans' || item.category === 'Pantalone') return ['46', '48', '50', '52', '54'];
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  };

  const getAvailableColors = (item: CartItem) => {
    const fromVariants = item.variants?.map((v: any) => v.color).filter(Boolean) || [];
    if (fromVariants.length > 0) return Array.from(new Set(fromVariants));
    return ['Nero', 'Blu Notte', 'Grigio', 'Bianco'];
  };

  const getColorHex = (name: string): string => {
    const n = (name || '').toLowerCase().trim();
    if (n.includes('nero') || n.includes('black')) return '#171717';
    if (n.includes('bianco') || n.includes('white')) return '#ffffff';
    if (n.includes('blu') || n.includes('navy')) return '#1e293b';
    if (n.includes('grigio') || n.includes('grey') || n.includes('gray')) return '#64748b';
    if (n.includes('antracite') || n.includes('charcoal')) return '#334155';
    if (n.includes('marrone') || n.includes('brown')) return '#5a3825';
    if (n.includes('beige') || n.includes('cammello') || n.includes('camel')) return '#d4b996';
    if (n.includes('verde') || n.includes('green') || n.includes('salvia') || n.includes('kaki') || n.includes('khaki')) return '#2d4a3e';
    if (n.includes('bordeaux') || n.includes('burgundy') || n.includes('rosso') || n.includes('red')) return '#7f1d1d';
    if (n.includes('azzurro') || n.includes('celeste') || n.includes('sky')) return '#7dd3fc';
    if (n.includes('giallo') || n.includes('yellow')) return '#ca8a04';
    if (n.includes('arancione') || n.includes('orange')) return '#c2410c';
    if (n.includes('rosa') || n.includes('pink')) return '#f472b6';
    return '#262626';
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50"
      />
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col font-['Montserrat',sans-serif]"
      >
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-neutral-100">
          <div>
            <h2 className="text-sm sm:text-base font-light uppercase tracking-[0.22em] text-neutral-950">
              Il tuo Carrello
            </h2>
            <p className="text-[11px] text-neutral-400 font-light tracking-wide mt-0.5">
              {items.reduce((acc, it) => acc + it.quantity, 0)} articoli selezionati
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full transition-colors cursor-pointer"
            aria-label="Chiudi carrello"
          >
            <X className="w-5 h-5 stroke-[1.4]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-center mb-4 text-neutral-400">
                <ShoppingCart className="w-8 h-8 stroke-[1.3]" />
              </div>
              <p className="text-sm font-light uppercase tracking-wider text-neutral-950 mb-1">Il carrello è vuoto</p>
              <p className="text-xs text-neutral-400 font-light mb-5">Aggiungi i tuoi capi preferiti per procedere.</p>
              <button 
                type="button"
                onClick={onClose} 
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-950 text-white text-xs font-medium uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors"
              >
                Inizia lo shopping
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const defaultSize = item.category === 'Scarpe' ? '42' : (item.category === 'Jeans' || item.category === 'Pantalone') ? '48' : 'M';
              const currentSize = (item as any).selectedSize || defaultSize;
              const currentColor = (item as any).selectedColor || 'Nero';
              const itemKey = (item as any).cartItemId || `${item.id}__${currentSize}__${currentColor}`;
              const isExpanded = !!expandedItemKeys[itemKey];
              const availableSizes = getAvailableSizes(item);
              const availableColors = getAvailableColors(item);

              const handleVariantChange = (newSize: string, newColor: string) => {
                const newKey = `${item.id}__${newSize}__${newColor}`;
                setExpandedItemKeys(prev => {
                  const updated = { ...prev };
                  delete updated[itemKey];
                  updated[newKey] = true;
                  return updated;
                });
                if (onUpdateVariant) {
                  onUpdateVariant(itemKey, newSize, newColor);
                }
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={itemKey} 
                  className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3"
                >
                  <div className="flex gap-3.5">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200/60">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-light text-xs sm:text-sm text-neutral-950 line-clamp-1 uppercase tracking-wide">
                          {item.name}
                        </h4>
                        <p className="text-xs font-medium text-neutral-900 mt-1">
                          €{item.price.toFixed(2)}
                        </p>
                        
                        {/* Indicazione Taglia & Colore corrente */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-neutral-500 font-light">
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                            Taglia: <strong className="font-medium text-neutral-950">{currentSize}</strong>
                          </span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                            Colore: <strong className="font-medium text-neutral-950">{currentColor}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200/60">
                          <button 
                            type="button"
                            onClick={() => onUpdateQuantity(itemKey, -1)} 
                            className="p-1.5 hover:bg-white rounded-md transition-colors text-neutral-700 hover:text-neutral-950"
                            aria-label="Diminuisci quantità"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium text-neutral-900">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => onUpdateQuantity(itemKey, 1)} 
                            className="p-1.5 hover:bg-white rounded-md transition-colors text-neutral-700 hover:text-neutral-950"
                            aria-label="Aumenta quantità"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => onRemove(itemKey)} 
                          className="text-[11px] text-neutral-400 hover:text-rose-500 font-light tracking-wide transition-colors"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estensione chiusa di default per scegliere taglia e colore */}
                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedItemKeys(prev => ({
                          ...prev,
                          [itemKey]: !prev[itemKey]
                        }));
                      }}
                      className="w-full flex items-center justify-between py-1.5 px-1 text-[11px] font-medium tracking-wide text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer rounded-lg hover:bg-neutral-50"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
                        <span>{isExpanded ? 'Chiudi selezione' : 'Modifica taglia e colore'}</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                    </button>

                    {isExpanded && onUpdateVariant && (
                      <div className="mt-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-3 animate-in fade-in duration-200">
                        {/* Selettore Taglie */}
                        <div>
                          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-1.5">
                            Scegli Taglia
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {availableSizes.map(sz => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleVariantChange(sz, currentColor)}
                                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                                  currentSize === sz
                                    ? 'bg-neutral-950 text-white font-medium shadow-sm'
                                    : 'bg-white hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/80'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Selettore Colori (pallini senza testo) */}
                        <div>
                          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-1.5">
                            Colore
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {availableColors.map(col => {
                              const isSelected = currentColor === col;
                              const hex = getColorHex(col);
                              const isWhite = hex.toLowerCase() === '#ffffff';

                              return (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => handleVariantChange(currentSize, col)}
                                  title={col}
                                  aria-label={col}
                                  className={`w-6 h-6 rounded-full transition-all cursor-pointer shrink-0 ${
                                    isWhite ? 'border border-neutral-300' : 'border border-black/10'
                                  } ${
                                    isSelected
                                      ? 'ring-2 ring-neutral-950 ring-offset-2 ring-offset-neutral-50 scale-110 shadow-sm'
                                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-5 sm:p-6 bg-white border-t border-neutral-100 space-y-4"
          >
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-light uppercase tracking-wider text-neutral-500">Subtotale</span>
              <span className="text-xl sm:text-2xl font-light text-neutral-950 tracking-tight">€{total.toFixed(2)}</span>
            </div>
            <button 
              type="button"
              onClick={onCheckout}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white min-h-[50px] rounded-xl font-medium text-xs uppercase tracking-[0.2em] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center cursor-pointer"
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
  const [adminSubcategoryFilter, setAdminSubcategoryFilter] = useState("Tutti");
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
      const matchesSubcategory = adminSubcategoryFilter === 'Tutti' || p.subcategory === adminSubcategoryFilter;
      const matchesBrand = adminBrandFilter === 'Tutti' || p.brand === adminBrandFilter;
      let matchesChannel = true;
      if (adminChannelFilter === 'Web') matchesChannel = (p.stock || 0) > 0;
      if (adminChannelFilter === 'Amazon') matchesChannel = (p.amazonStock || 0) > 0;
      const matchesFeatured = !showFeaturedOnly || p.isFeatured;
      const matchesSpecial = !showSpecialOnly || p.isSpecialPromotion;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
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
    adminSubcategoryFilter,
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

  const addToCart = (product: Product, customSize?: string, customColor?: string) => {
    const passedSize = (product as any).selectedSize || customSize;
    const passedColor = (product as any).selectedColor || customColor;
    const defaultSize = passedSize || (
      product.variants?.find((v: any) => v.size)?.size ||
      product.variants?.[0]?.value ||
      (product.category === 'Scarpe' ? '42' : (product.category === 'Jeans' || product.category === 'Pantalone') ? '48' : 'M')
    );
    const defaultColor = passedColor || (
      product.variants?.find((v: any) => v.color)?.color || 'Nero'
    );
    const cartItemId = `${product.id}__${defaultSize}__${defaultColor}`;

    setCart(prev => {
      // Due articoli si accorpano SOLO se ID, taglia E colore sono esattamente identici!
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        (item.selectedSize || defaultSize) === defaultSize && 
        (item.selectedColor || defaultColor) === defaultColor
      );

      if (existingIndex !== -1) {
        return prev.map((item, idx) => 
          idx === existingIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [
        ...prev, 
        { 
          ...product, 
          quantity: 1, 
          cartItemId, 
          selectedSize: defaultSize, 
          selectedColor: defaultColor 
        }
      ];
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

  const updateQuantity = (cartItemIdOrId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      const currentKey = item.cartItemId || `${item.id}__${item.selectedSize || 'M'}__${item.selectedColor || 'Nero'}`;
      if (currentKey === cartItemIdOrId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemIdOrId: string) => {
    setCart(prev => prev.filter(item => {
      const currentKey = item.cartItemId || `${item.id}__${item.selectedSize || 'M'}__${item.selectedColor || 'Nero'}`;
      return currentKey !== cartItemIdOrId;
    }));
  };

  const updateCartItemVariant = (targetCartItemId: string, newSize: string, newColor: string) => {
    setCart(prev => {
      const targetIndex = prev.findIndex(it => (it.cartItemId || `${it.id}__${it.selectedSize || 'M'}__${it.selectedColor || 'Nero'}`) === targetCartItemId);
      if (targetIndex === -1) return prev;
      
      const currentItem = prev[targetIndex];
      const productId = currentItem.id;
      
      // Controlla se nel carrello c'è già un ALTRO articolo dello stesso prodotto con la STESSA identica taglia E colore
      const existingSameIndex = prev.findIndex((it, idx) => 
        idx !== targetIndex && 
        it.id === productId && 
        ((it.selectedSize || '') === newSize) && 
        ((it.selectedColor || '') === newColor)
      );
      
      if (existingSameIndex !== -1) {
        // ACCORPA GLI ARTICOLI SOLO SE TAGLIA E COLORE SONO ENTRAMBI IDENTICI!
        const mergedQty = prev[existingSameIndex].quantity + currentItem.quantity;
        const targetKey = currentItem.cartItemId || `${currentItem.id}__${currentItem.selectedSize || 'M'}__${currentItem.selectedColor || 'Nero'}`;
        const existingKey = prev[existingSameIndex].cartItemId || `${prev[existingSameIndex].id}__${prev[existingSameIndex].selectedSize || 'M'}__${prev[existingSameIndex].selectedColor || 'Nero'}`;
        
        addToast(`Articoli con stessa variante (${newSize} - ${newColor}) accorpati (Totale: ${mergedQty} pz)`, 'info');
        
        return prev
          .filter(it => (it.cartItemId || `${it.id}__${it.selectedSize || 'M'}__${it.selectedColor || 'Nero'}`) !== targetKey)
          .map(it => {
            if ((it.cartItemId || `${it.id}__${it.selectedSize || 'M'}__${it.selectedColor || 'Nero'}`) === existingKey) {
              return { ...it, quantity: mergedQty };
            }
            return it;
          });
      }
      
      // Nessun duplicato: aggiorna la variante dell'articolo
      const updatedCartItemId = `${productId}__${newSize}__${newColor}`;
      return prev.map((it, idx) => {
        if (idx === targetIndex) {
          return {
            ...it,
            cartItemId: updatedCartItemId,
            selectedSize: newSize,
            selectedColor: newColor
          };
        }
        return it;
      });
    });
    setCartTrigger(prev => prev + 1);
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
            onUpdateVariant={updateCartItemVariant}
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
                <div className="md:hidden fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-3.5 border-b border-neutral-900 bg-neutral-950 text-white z-[60] safe-area-top shadow-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800 shrink-0">
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex items-baseline gap-2">
                      <h3 className="font-bold text-white uppercase tracking-wider text-xs truncate">Admin Panel</h3>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest hidden sm:inline">Control Center</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileAdminMenuOpen(!isMobileAdminMenuOpen)}
                    className="h-8 w-8 flex items-center justify-center text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    aria-label={isMobileAdminMenuOpen ? 'Chiudi menu admin' : 'Apri menu admin'}
                  >
                    {isMobileAdminMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
                  </button>
                </div>

                {isMobileAdminMenuOpen && (
                  <button
                    type="button"
                    className="md:hidden fixed inset-0 top-12 bg-black/75 backdrop-blur-sm z-[50]"
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
              className={`bg-neutral-950 border-r border-neutral-900 text-white flex flex-col relative z-[55] h-full overflow-hidden flex-shrink-0
                max-md:fixed max-md:left-0 max-md:top-12 max-md:bottom-0 max-md:!w-[min(82vw,16.5rem)] max-md:max-h-[calc(100dvh-3rem)] max-md:shadow-2xl max-md:transition-transform max-md:duration-300 max-md:ease-out
                ${isMobileAdminMenuOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full max-md:pointer-events-none'}
                md:relative md:top-auto md:translate-x-0 md:pointer-events-auto md:max-h-none`}
            >
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full items-center justify-center z-[70] transition-all shadow-md active:scale-95 cursor-pointer"
                  title={isSidebarCollapsed ? "Espandi Menu" : "Contrai Menu"}
                >
                  <div className="flex items-center justify-center">
                    {isSidebarCollapsed ? <Plus className="w-3.5 h-3.5 rotate-45" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Mobile Drawer Top Banner */}
                <div className="md:hidden px-3.5 py-2.5 border-b border-neutral-900 flex items-center justify-between text-[11px] font-bold text-neutral-400 tracking-wider uppercase shrink-0">
                  <span className="text-white font-extrabold tracking-wide">Menu Sezioni</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold normal-case">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>

                <div className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-6'} mt-6 mb-8 overflow-hidden`}>
                  <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-neutral-200" />
                  </div>
                  {!isSidebarCollapsed && (
                    <div>
                      <h3 className="font-light text-white text-xs uppercase tracking-[0.2em] whitespace-nowrap">Admin Panel</h3>
                      <p className="text-[10px] text-neutral-500 font-light tracking-wider">Vincent Store</p>
                    </div>
                  )}
                </div>

                <nav className="space-y-1 max-md:space-y-0.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar max-md:overscroll-contain p-0 max-md:p-2 max-md:pb-2">
                  {[
                    { tab: 'dashboard', label: 'Panoramica', icon: Home },
                    { tab: 'company', label: 'Azienda', icon: Grid },
                    { tab: 'slides', label: 'Slide', icon: Play },
                    { tab: 'link_rapidi', label: 'Link Rapidi', icon: Box },
                    { tab: 'categories', label: 'Categorie', icon: Compass },
                    { tab: 'products', label: 'Prodotti', icon: Package },
                    { tab: 'image_linker', label: 'Bulk Images', icon: ImageIcon },
                    { tab: 'couriers', label: 'Corrieri', icon: Truck },
                    { tab: 'orders', label: 'Ordini', icon: ShoppingBag },
                    { tab: 'users', label: 'Archivio Utenti', icon: Users },
                    { tab: 'returns', label: 'Gestione Resi', icon: RefreshCw },
                    { tab: 'seo', label: 'SEO & Google', icon: Globe },
                    { tab: 'analytics', label: 'Analytics', icon: BarChart2 },
                    { tab: 'marketplaces', label: 'Marketplace', icon: Globe },
                    { tab: 'payments', label: 'Pagamenti', icon: CreditCard },
                    { tab: 'marketing', label: 'Marketing', icon: Target },
                    /* Recensioni sospese */
                  ].map((item) => (
                    <div key={item.tab} className="px-3 max-md:px-0">
                      <button 
                        onClick={() => {
                          setAdminActiveTab(item.tab as any);
                          setIsMobileAdminMenuOpen(false);
                        }}
                        className={`w-full flex items-center transition-all cursor-pointer
                          ${isSidebarCollapsed ? 'md:justify-center md:px-0 md:gap-0' : 'gap-3 px-4'}
                          md:py-2.5 md:rounded-xl md:font-medium md:text-xs md:tracking-wider md:uppercase
                          max-md:gap-2.5 max-md:px-3 max-md:py-2 max-md:rounded-lg max-md:text-xs max-md:font-medium
                          ${
                            adminActiveTab === item.tab 
                              ? `bg-white text-neutral-950 font-medium shadow-sm max-md:bg-white max-md:text-neutral-950` 
                              : `text-neutral-400 hover:text-white hover:bg-neutral-900/80 active:bg-neutral-900`
                          }`}
                        title={isSidebarCollapsed ? item.label : ''}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0 text-current" />
                        <span className={`text-inherit ${isSidebarCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                      </button>
                    </div>
                  ))}
                </nav>

                <button
                  type="button"
                  onClick={() => { setIsAdminOpen(false); setIsMobileAdminMenuOpen(false); if (hideStorefront) window.location.href = '/'; }}
                  className={`md:hidden shrink-0 mt-auto m-2.5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-red-600/90 hover:bg-red-600 active:scale-[0.98] shadow-md border border-red-500/40 cursor-pointer`}
                >
                  <X className="w-4 h-4 shrink-0 text-white" />
                  <span className="text-white">Esci da Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className={`hidden md:flex mt-auto m-3 items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all cursor-pointer`}
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Esci dall'Admin</span>}
                </button>
            </motion.div>

              {/* Content Area */}
              <div className="admin-mobile-content flex-1 min-w-0 min-h-0 w-full overflow-y-auto overflow-x-hidden pt-14 px-3 pb-8 md:pt-0 md:p-10 bg-gray-50/50 overscroll-contain">
                {adminActiveTab === 'dashboard' && (
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                    {/* Header Panoramica */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                            Panoramica
                          </h2>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Store Attivo
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                          Vendite in tempo reale, statistiche principali e performance dello store
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <button 
                          type="button"
                          onClick={() => setAdminActiveTab('products')}
                          className={`${ADMIN_BTN_PRIMARY} flex-1 sm:flex-initial`}
                        >
                          <Package className="w-4 h-4 text-white" />
                          <span>+ Nuovo Prodotto</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAdminActiveTab('orders')}
                          className={`${ADMIN_BTN_SECONDARY} flex-1 sm:flex-initial`}
                        >
                          <ShoppingBag className="w-4 h-4 text-neutral-500" />
                          <span>Tutti gli Ordini</span>
                        </button>
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-200/80 text-right">
                          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span className="text-[11px] font-medium text-neutral-900">38 Online</span>
                        </div>
                      </div>
                    </div>

                    {/* 4 Card Metriche KPI Minimal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                      {/* 1. Fatturato Totale */}
                      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-700" />
                            +18.4%
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 mb-1">Fatturato Complessivo</p>
                          <h4 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">€128.430</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-light text-neutral-500">
                            <span>Target Mese: 88%</span>
                            <span className="font-medium text-neutral-900">€145.000</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[88%]"></div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Ordini Ricevuti */}
                      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-700" />
                            +12.6%
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 mb-1">Ordini Elaborati</p>
                          <h4 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">1.243</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-light text-neutral-500">
                            <span>In Transito Corrieri</span>
                            <span className="font-medium text-neutral-900">34 ordini</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[76%]"></div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Resi & Assistenza */}
                      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                            <RefreshCw className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-emerald-700" />
                            -5.2%
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 mb-1">Resi Gestiti</p>
                          <h4 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">12</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-light text-neutral-500">
                            <span>Tasso di Reso Store</span>
                            <span className="font-medium text-emerald-700">0.9% (Ottimo)</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[12%]"></div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Nuovi Clienti */}
                      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-700" />
                            +22.0%
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 mb-1">Clienti Registrati</p>
                          <h4 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950">342</h4>
                          <div className="mt-3 flex items-center justify-between text-[11px] font-light text-neutral-500">
                            <span>Scontrino Medio</span>
                            <span className="font-medium text-neutral-900">€103,50</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[84%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sezione Grafico Vendite + Prodotti Top & Magazzino */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Box Vendite Monocromatico Sartoriale Dark (Span 2) */}
                      <div className="lg:col-span-2 bg-neutral-950 text-white p-6 sm:p-8 rounded-2xl border border-neutral-900 shadow-xl space-y-6 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-light uppercase tracking-[0.2em] text-white">Andamento Vendite</h3>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-widest bg-white/10 text-neutral-300 border border-white/10">
                                  Live Analytics
                                </span>
                              </div>
                              <p className="text-[11px] font-light text-neutral-400 mt-1">Ricavi mensili distribuiti nell'anno fiscale corrente</p>
                            </div>

                            <div className="flex p-0.5 bg-neutral-900 rounded-xl border border-neutral-800">
                              {['Settimana', 'Mese', 'Anno'].map((t) => (
                                <button 
                                  key={t} 
                                  type="button"
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all ${
                                    t === 'Mese' 
                                      ? 'bg-white text-neutral-950 shadow-sm font-semibold' 
                                      : 'text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Chart Bars */}
                          <div className="h-64 sm:h-72 flex items-end gap-2 sm:gap-3 px-1 sm:px-2 mt-8">
                            {[35, 45, 30, 75, 90, 65, 85, 40, 60, 95, 70, 80].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer h-full justify-end">
                                <div className="w-full relative h-[85%] flex items-end">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="w-full bg-gradient-to-t from-neutral-800 via-neutral-600 to-neutral-200 rounded-lg group-hover:from-neutral-700 group-hover:to-white transition-all duration-300"
                                  />
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-neutral-950 font-medium px-2 py-1 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl z-20">
                                    €{(h * 1500).toLocaleString('it-IT')}
                                  </div>
                                </div>
                                <span className="text-[10px] font-light text-neutral-500 uppercase group-hover:text-neutral-200 transition-colors">
                                  M{i+1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* KPI Strip */}
                        <div className="pt-5 border-t border-neutral-900 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Conversione</p>
                            <p className="text-sm sm:text-base font-light text-white flex items-center gap-1 mt-0.5">
                              <span className="text-emerald-400 font-medium">3.84%</span>
                              <span className="text-[10px] text-neutral-500">+0.6%</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Scontrino Medio</p>
                            <p className="text-sm sm:text-base font-light text-white mt-0.5">€103,30</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Spediti in 24h</p>
                            <p className="text-sm sm:text-base font-light text-white mt-0.5">98.2%</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Picco Mese</p>
                            <p className="text-sm sm:text-base font-medium text-white mt-0.5">M10 (€142k)</p>
                          </div>
                        </div>
                      </div>

                      {/* Colonna Destra: Top Venduti & Scorte Magazzino */}
                      <div className="space-y-6">
                        {/* Top Bestseller */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-neutral-700" /> Top Venduti
                            </h3>
                            <button 
                              type="button"
                              onClick={() => setAdminActiveTab('products')}
                              className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                            >
                              Tutti &rarr;
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(products && products.length >= 3 ? products.slice(0, 3) : PRODUCTS.slice(0, 3)).map((p, i) => {
                              const salesCount = [432, 285, 219][i] || 150;
                              const trends = ['+28%', '+19%', '+14%'][i] || '+10%';

                              return (
                                <div 
                                  key={p.id || i}
                                  onClick={() => handleProductSelect(p)}
                                  className="group flex items-center justify-between p-2.5 bg-neutral-50/70 hover:bg-neutral-100/70 rounded-xl border border-neutral-200/60 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative flex-shrink-0">
                                      <img 
                                        src={p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'} 
                                        alt={p.name}
                                        className="w-11 h-12 rounded-lg object-cover border border-neutral-200/80 group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center font-medium text-[9px] bg-neutral-950 text-white shadow-sm">
                                        #{i + 1}
                                      </div>
                                    </div>
                                    <div className="min-w-0 pr-2">
                                      <p className="text-xs font-medium text-neutral-900 truncate">{p.name}</p>
                                      <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                        {p.category} • <span className="text-neutral-900 font-medium">€{Number(p.price || 0).toFixed(2)}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                      {trends}
                                    </span>
                                    <p className="text-[10px] text-neutral-400 font-light mt-1">{salesCount} ordini</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Scorte & Attenzioni */}
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950 flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-neutral-700" /> Scorte & Attenzioni
                            </h3>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                              Azione Rapida
                            </span>
                          </div>

                          <div className="space-y-3">
                            {(products && products.length >= 5 ? products.slice(3, 5) : PRODUCTS.slice(3, 5)).map((p, i) => (
                              <div key={p.id || i} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img 
                                    src={p.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80'} 
                                    alt={p.name}
                                    className="w-11 h-12 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                                  />
                                  <div className="min-w-0 pr-2">
                                    <p className="text-xs font-medium text-neutral-900 truncate">{p.name}</p>
                                    <p className="text-[10px] text-rose-600 font-light mt-0.5">
                                      {i === 0 ? 'Solo 3 pezzi rimasti' : 'Vendite basse (-40%)'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-medium text-neutral-700 bg-white px-2.5 py-1 rounded-lg border border-neutral-200/80 flex-shrink-0">
                                  {i === 0 ? 'Rifornisci' : 'Sconto 20%'}
                                </span>
                              </div>
                            ))}

                            <button 
                              type="button"
                              onClick={() => {
                                addToast("Campagna sconto strategico attivata sui prodotti a bassa rotazione!", "success");
                              }}
                              className={`${ADMIN_BTN_SECONDARY} w-full text-center py-2.5 !min-h-[42px] mt-2`}
                            >
                              <Zap className="w-3.5 h-3.5 text-neutral-700" />
                              <span>Attiva Sconto Strategico -20%</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distribuzione Canali di Vendita & Magazzino */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-neutral-700" />
                          <h4 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">
                            Distribuzione Canali di Vendita & Magazzino
                          </h4>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-light">
                          Sincronizzato in tempo reale con i marketplace
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Vincent Direct Store</p>
                          <p className="text-lg font-light text-neutral-950 mt-1">72% <span className="text-xs font-normal text-neutral-400">(€92.470)</span></p>
                          <div className="w-full h-1 bg-neutral-200/80 rounded-full mt-2.5 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[72%]"></div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Amazon Brand Store</p>
                          <p className="text-lg font-light text-neutral-950 mt-1">18% <span className="text-xs font-normal text-neutral-400">(€23.117)</span></p>
                          <div className="w-full h-1 bg-neutral-200/80 rounded-full mt-2.5 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[18%]"></div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/70">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Ebay & Partner Marketplace</p>
                          <p className="text-lg font-light text-neutral-950 mt-1">10% <span className="text-xs font-normal text-neutral-400">(€12.843)</span></p>
                          <div className="w-full h-1 bg-neutral-200/80 rounded-full mt-2.5 overflow-hidden">
                            <div className="h-full bg-neutral-950 rounded-full w-[10%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {adminActiveTab === 'company' && (
                  <AdminCompanySection
                    companySettings={companySettings}
                    setCompanySettings={setCompanySettings}
                    handleFileChange={handleFileChange}
                    addToast={addToast}
                  />
                )}

                {adminActiveTab === 'slides' && (
                  <AdminSlidesSection
                    pageSettings={pageSettings}
                    setPageSettings={setPageSettings}
                    handleFileChange={handleFileChange}
                    addToast={addToast}
                    setAdminConfirmAction={setAdminConfirmAction}
                  />
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
                  <AdminQuickLinksSection
                    pageSettings={pageSettings}
                    setPageSettings={setPageSettings}
                    handleFileChange={handleFileChange}
                    addToast={addToast}
                    setAdminConfirmAction={setAdminConfirmAction}
                  />
                )}

                {adminActiveTab === 'seo' && (
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                          SEO & Indicizzazione
                        </h2>
                        <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                          Ottimizzazione motori di ricerca, meta tag e monitoraggio Google
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToast("Sitemap inviata a Google Search Console con successo!", "success")}
                        className={ADMIN_BTN_SECONDARY}
                      >
                        <Globe className="w-4 h-4 text-neutral-500" />
                        <span>Invia Sitemap</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* Meta Tag Globali */}
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">
                            Meta Tag Globali
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Meta Title Principale</span>
                              <input 
                                type="text" 
                                value={companySettings.name}
                                onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                                className={ADMIN_INPUT}
                                placeholder="Vincent Store | Collezione Esclusiva Uomo"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Meta Description Principale</span>
                              <textarea 
                                rows={3}
                                value={companySettings.mission}
                                onChange={(e) => setCompanySettings({...companySettings, mission: e.target.value})}
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                                placeholder="Boutique sartoriale contemporanea con selezione capi d'eccellenza e spedizione espressa."
                              />
                            </label>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-neutral-100 space-y-3">
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">
                            Parole Chiave (Keywords)
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {["Moda Uomo", "Sartoria", "Made in Italy", "Scarpe Artigianali", "Accessori Lusso"].map(tag => (
                              <span key={tag} className="px-3 py-1.5 bg-neutral-50 text-neutral-700 rounded-lg text-xs font-light border border-neutral-200">
                                {tag}
                              </span>
                            ))}
                            <button 
                              type="button" 
                              onClick={() => addToast("Keyword aggiunta alle impostazioni", "info")}
                              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
                            >
                              + Aggiungi Keyword
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Ottimizzazione AI */}
                      <div className="bg-neutral-950 p-6 sm:p-7 rounded-2xl text-white border border-neutral-900 space-y-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-neutral-300" />
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-white">
                            Ottimizzazione AI dei Contenuti
                          </h3>
                        </div>
                        <p className="text-neutral-400 text-xs font-light leading-relaxed max-w-2xl">
                          Genera automaticamente meta titoli e descrizioni ad alta conversione analizzando i prodotti del catalogo con intelligenza artificiale.
                        </p>
                        <button 
                          type="button"
                          onClick={() => addToast("Analisi catalogo completata: meta tag ottimizzati!", "success")}
                          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-neutral-950 text-[11px] font-medium uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                        >
                          Analizza e Suggerisci SEO
                        </button>
                      </div>

                      {/* Google Verification Section */}
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">
                            Proprietà Google & Verifica Dominio
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Codice HTML di Verifica (Meta Tag)</span>
                              <input 
                                type="text" 
                                value={companySettings.googleVerificationTag || ""}
                                onChange={(e) => setCompanySettings({...companySettings, googleVerificationTag: e.target.value})}
                                className="w-full min-h-[48px] bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono font-light focus:outline-none focus:border-neutral-900 transition-colors"
                                placeholder='<meta name="google-site-verification" content="..." />'
                              />
                            </label>
                            
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Snippet Google Analytics / Search Console (Script)</span>
                              <textarea 
                                rows={3}
                                value={companySettings.googleAnalyticsSnippet || ""}
                                onChange={(e) => setCompanySettings({...companySettings, googleAnalyticsSnippet: e.target.value})}
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono font-light focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                                placeholder='<!-- Global site tag (gtag.js) - Google Analytics -->'
                              />
                            </label>

                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Contenuto ads.txt</span>
                              <textarea 
                                rows={2}
                                value={companySettings.adsTxtContent || ""}
                                onChange={(e) => setCompanySettings({...companySettings, adsTxtContent: e.target.value})}
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono font-light focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                                placeholder="google.com, pub-000, DIRECT, ..."
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* SEO per Categorie */}
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">
                            SEO per Categorie & SERP Preview
                          </h3>
                          <div className="space-y-4">
                            {pageSettings.categories.filter((cat: string) => cat !== "Tutti").slice(0, showAllSeoCategories ? pageSettings.categories.length : 3).map((cat: string) => (
                              <div key={cat} className="p-5 bg-neutral-50/60 rounded-xl border border-neutral-200/80 space-y-4">
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-neutral-200/60">
                                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-900">
                                    {cat}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const storeName = companySettings.name || 'Vincent Store';
                                      setPageSettings({
                                        ...pageSettings,
                                        categorySeo: {
                                          ...pageSettings.categorySeo,
                                          [cat]: {
                                            metaTitle: `${cat} Sartoriali Uomo - ${storeName}`,
                                            metaDescription: `Scopri la selezione sartoriale di ${cat}. Pregiata manifattura, spedizione rapida e reso semplice su ${storeName}.`
                                          }
                                        }
                                      });
                                    }}
                                    className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 hover:text-neutral-950 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
                                  >
                                    Autocompila Default
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Meta Title</label>
                                    <input 
                                      className={ADMIN_INPUT}
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
                                  <div>
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Meta Description</label>
                                    <input 
                                      className={ADMIN_INPUT}
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
                                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                                  <div className="text-[11px] text-neutral-600 flex items-center gap-1 mb-1">
                                    <span>https://vincentstore.it</span>
                                    <ChevronRight className="w-2.5 h-2.5 text-neutral-400" />
                                    <span className="text-neutral-500">{cat.toLowerCase()}</span>
                                  </div>
                                  <div className="text-[#1a0dab] text-base font-normal hover:underline cursor-pointer leading-tight mb-1">
                                    {pageSettings.categorySeo[cat]?.metaTitle || `${cat} Sartoriali Uomo - ${companySettings.name || 'Vincent Store'}`}
                                  </div>
                                  <div className="text-neutral-600 text-xs leading-relaxed line-clamp-2">
                                    {pageSettings.categorySeo[cat]?.metaDescription || `Scopri la selezione sartoriale di ${cat}. Pregiata manifattura, spedizione rapida e reso semplice su ${companySettings.name || 'Vincent Store'}.`}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {!showAllSeoCategories && pageSettings.categories.length > 3 && (
                              <button 
                                type="button"
                                onClick={() => setShowAllSeoCategories(true)}
                                className={`w-full ${ADMIN_BTN_SECONDARY}`}
                              >
                                Vedi tutte le categorie ({pageSettings.categories.filter((c: string) => c !== "Tutti").length})
                              </button>
                            )}
                            {showAllSeoCategories && (
                              <button 
                                type="button"
                                onClick={() => setShowAllSeoCategories(false)}
                                className={`w-full ${ADMIN_BTN_SECONDARY}`}
                              >
                                Mostra meno
                              </button>
                            )}
                          </div>
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
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                          Analytics & Traffico
                        </h2>
                        <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                          Monitoraggio visite, conversioni e dispositivi in tempo reale
                        </p>
                      </div>
                      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl">
                        {['Oggi', '7 Giorni', '30 Giorni', 'Anno'].map(t => (
                          <button 
                            key={t} 
                            type="button"
                            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all ${
                              t === '30 Giorni' 
                                ? 'bg-white text-neutral-950 shadow-sm' 
                                : 'text-neutral-500 hover:text-neutral-950'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Visite Totali', value: '12.430', change: '+12.5%', isPos: true, icon: Users },
                        { label: 'Impressioni SEO', value: '45.200', change: '+8.2%', isPos: true, icon: Search },
                        { label: 'Click Diretti', value: '3.120', change: '+15.4%', isPos: true, icon: MousePointer2 },
                        { label: 'Permanenza Media', value: '3:45', change: '-2.1%', isPos: false, icon: Clock }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-center text-neutral-900">
                              <stat.icon className="w-5 h-5 text-neutral-700" />
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              stat.isPos ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {stat.change}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1">{stat.label}</p>
                          <h4 className="text-2xl font-light text-neutral-950 tracking-tight">{stat.value}</h4>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Traffico Mensile */}
                      <div className="lg:col-span-2 bg-neutral-950 p-6 sm:p-7 rounded-2xl text-white border border-neutral-900 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-white">Traffico Mensile</h3>
                            <p className="text-[11px] text-neutral-400 font-light mt-0.5">Distribuzione per sorgente di acquisizione</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-300">Organico</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
                              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Referral</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-56 flex items-end gap-2 pt-4 px-1">
                          {[40, 60, 35, 90, 65, 45, 80, 55, 75, 45, 95, 70].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-full relative flex items-end justify-center h-44">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  className="w-full rounded-md bg-gradient-to-t from-neutral-800 to-neutral-200 group-hover:from-neutral-700 group-hover:to-white transition-all"
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-neutral-950 px-2 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                                  {h * 120}
                                </div>
                              </div>
                              <span className="text-[9px] font-light text-neutral-400 uppercase">M{i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dispositivi */}
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                        <div>
                          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">Dispositivi</h3>
                          <p className="text-[11px] text-neutral-400 font-light mt-0.5">Suddivisione sessioni per piattaforma</p>
                        </div>
                        <div className="space-y-5">
                          {[
                            { label: 'Mobile', value: 65, icon: Smartphone, barColor: 'bg-neutral-950' },
                            { label: 'Desktop', value: 30, icon: Monitor, barColor: 'bg-neutral-600' },
                            { label: 'Tablet', value: 5, icon: Tablet, barColor: 'bg-neutral-300' }
                          ].map((dev, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2 text-neutral-700 font-light">
                                  <dev.icon className="w-4 h-4 text-neutral-500" />
                                  <span>{dev.label}</span>
                                </div>
                                <span className="font-medium text-neutral-950">{dev.value}%</span>
                              </div>
                              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${dev.value}%` }}
                                  className={`h-full ${dev.barColor} rounded-full`}
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
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                        Marketing & Promozioni
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                        Gestione campagne, vetrina e promozioni del catalogo
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-950 mb-2">
                          Controlli Vetrina & Nuovi Arrivi
                        </h3>
                        <p className="text-xs text-neutral-500 font-light leading-relaxed">
                          I badge promozionali, la messa in Vetrina e i Nuovi Arrivi sono integrati direttamente nella scheda di ogni articolo e nei filtri del catalogo.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setAdminActiveTab('products')}
                          className={ADMIN_BTN_PRIMARY}
                        >
                          <span>Vai a Gestione Prodotti</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'products' && (
                  <div className="admin-products-panel space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                            {adminProductView === 'list' && "Prodotti"}
                            {adminProductView === 'single' && (editingAdminProduct ? "Modifica Prodotto" : "Nuovo Prodotto")}
                            {adminProductView === 'mass' && "Importazione Massiva"}
                          </h2>
                          {adminProductView !== 'list' && (
                            <button 
                              type="button"
                              onClick={() => {
                                setAdminProductView('list');
                                setEditingAdminProduct(null);
                              }}
                              className="p-1.5 sm:p-2 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-50 transition-all cursor-pointer shrink-0"
                              title="Chiudi"
                              aria-label="Chiudi"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {adminProductView === 'list' && (
                          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                            {products.length} prodotti · catalogo boutique
                          </p>
                        )}
                      </div>
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

                    </div>
                    
                    {adminProductView === 'list' && (
                      <div className="space-y-6">
                        {/* SCHEDA FILTRI & NAVIGAZIONE CATEGORIE / SOTTOCATEGORIE MINIMAL (STILE LUXURY STORE) */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl md:rounded-[2rem] border border-neutral-200/80 shadow-xs space-y-4">
                           
                           {/* 1. SELETTORE CATEGORIE ORIZZONTALE (STILE HOME / CATEGORIE) */}
                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-light uppercase tracking-[0.22em] text-neutral-400">
                                    Filtra per Categoria
                                 </span>
                                 <span className="text-[10px] text-neutral-400 font-light tracking-wide">
                                    {adminFilteredProducts.length} {adminFilteredProducts.length === 1 ? 'prodotto' : 'prodotti'}
                                 </span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                                 <button
                                    type="button"
                                    onClick={() => {
                                       setAdminCategoryFilter("Tutti");
                                       setAdminSubcategoryFilter("Tutti");
                                    }}
                                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                       adminCategoryFilter === "Tutti"
                                          ? "bg-neutral-950 text-white font-bold shadow-xs scale-[1.02]"
                                          : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 border border-neutral-200/70 font-medium"
                                    }`}
                                 >
                                    <span>Tutte le Categorie</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${adminCategoryFilter === "Tutti" ? "bg-white/20 text-white" : "bg-neutral-200/60 text-neutral-600"}`}>
                                       {products.length}
                                    </span>
                                 </button>
                                 {pageSettings.categories.filter((c: string) => c !== "Tutti").map((cat: string) => {
                                    const catCount = products.filter(p => p.category === cat).length;
                                    const isSelected = adminCategoryFilter === cat;
                                    return (
                                       <button
                                          key={`admin-cat-${cat}`}
                                          type="button"
                                          onClick={() => {
                                             setAdminCategoryFilter(cat);
                                             setAdminSubcategoryFilter("Tutti");
                                          }}
                                          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                             isSelected
                                                ? "bg-neutral-950 text-white font-bold shadow-xs scale-[1.02]"
                                                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 border border-neutral-200/70 font-medium"
                                          }`}
                                       >
                                          <span>{cat}</span>
                                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-neutral-200/60 text-neutral-600"}`}>
                                             {catCount}
                                          </span>
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>

                           {/* 2. BARRA SOTTOCATEGORIE DEDICATA (APPARE QUANDO SI SCEGLIE UNA CATEGORIA O QUANDO CI SONO SOTTOCATEGORIE) */}
                           <AnimatePresence>
                              {adminCategoryFilter !== "Tutti" && (pageSettings.subcategories?.[adminCategoryFilter] || []).length > 0 && (
                                 <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-neutral-50/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-neutral-200/70 overflow-hidden"
                                 >
                                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
                                       <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-bold mr-1 shrink-0">
                                          Sottocategorie:
                                       </span>
                                       <button
                                          type="button"
                                          onClick={() => setAdminSubcategoryFilter("Tutti")}
                                          className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] transition-all shrink-0 cursor-pointer ${
                                             adminSubcategoryFilter === "Tutti"
                                                ? "bg-neutral-900 text-white font-semibold shadow-xs"
                                                : "bg-white text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200"
                                          }`}
                                       >
                                          Tutte ({products.filter(p => p.category === adminCategoryFilter).length})
                                       </button>
                                       {(pageSettings.subcategories[adminCategoryFilter] || []).map((sub: string) => {
                                          const subCount = products.filter(p => p.category === adminCategoryFilter && p.subcategory === sub).length;
                                          const isSubActive = adminSubcategoryFilter === sub;
                                          return (
                                             <button
                                                key={`admin-sub-${sub}`}
                                                type="button"
                                                onClick={() => setAdminSubcategoryFilter(prev => prev === sub ? "Tutti" : sub)}
                                                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                                                   isSubActive
                                                      ? "bg-neutral-900 text-white font-semibold shadow-xs"
                                                      : "bg-white text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200"
                                                }`}
                                             >
                                                <span>{sub}</span>
                                                <span className="text-[9px] opacity-70">({subCount})</span>
                                             </button>
                                          );
                                       })}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           {/* 3. BARRA DI RICERCA VELOCE & FILTRI STATO (MINIMAL & RAPIDO) */}
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-neutral-100">
                              <div className="md:col-span-2 relative">
                                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                 <input 
                                    type="text" 
                                    placeholder="Cerca per Nome, SKU o EAN..." 
                                    value={adminSearchQuery}
                                    onChange={e => setAdminSearchQuery(e.target.value)}
                                    className="w-full bg-neutral-50/70 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                                 />
                                 {adminSearchQuery && (
                                    <button 
                                       onClick={() => setAdminSearchQuery("")}
                                       className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                                    >
                                       ✕
                                    </button>
                                 )}
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2 overflow-x-auto no-scrollbar">
                                 <button 
                                    type="button"
                                    onClick={() => {
                                       const newVal = !showFeaturedOnly;
                                       setShowFeaturedOnly(newVal);
                                       if (newVal) setShowSpecialOnly(false);
                                    }}
                                    className={`px-3 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border flex items-center justify-center gap-1.5 shrink-0 ${
                                       showFeaturedOnly 
                                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs' 
                                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                    }`}
                                 >
                                    <Sparkles className={`w-3.5 h-3.5 ${showFeaturedOnly ? 'fill-current text-brand-yellow' : 'text-neutral-400'}`} />
                                    <span>Vetrina</span>
                                 </button>
                                 <button 
                                    type="button"
                                    onClick={() => {
                                       const newVal = !showSpecialOnly;
                                       setShowSpecialOnly(newVal);
                                       if (newVal) setShowFeaturedOnly(false);
                                    }}
                                    className={`px-3 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border flex items-center justify-center gap-1.5 shrink-0 ${
                                       showSpecialOnly 
                                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs' 
                                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                    }`}
                                 >
                                    <Star className={`w-3.5 h-3.5 ${showSpecialOnly ? 'fill-current text-indigo-400' : 'text-neutral-400'}`} />
                                    <span>Scelti</span>
                                 </button>
                                 <button 
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(true)}
                                    className="px-3 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center gap-1.5 shrink-0"
                                 >
                                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>Altri Filtri</span>
                                 </button>
                                 <button 
                                    type="button"
                                    onClick={() => {
                                       setAdminSearchQuery("");
                                       setAdminCategoryFilter("Tutti");
                                       setAdminSubcategoryFilter("Tutti");
                                       setAdminBrandFilter("Tutti");
                                       setAdminChannelFilter("Tutti");
                                       setShowFeaturedOnly(false);
                                       setShowSpecialOnly(false);
                                    }}
                                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl p-2.5 transition-all shrink-0"
                                    title="Reset Filtri"
                                 >
                                    <RefreshCw className="w-3.5 h-3.5" />
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

                        {/* LISTA PRODOTTI PER MOBILE: SCHEDE PULITE, ELEGANTI E VELOCI CON RIFERIMENTO CATEGORIA/SOTTOCATEGORIA */}
                        <div className="md:hidden space-y-3.5">
                          {adminFilteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-neutral-300 space-y-2">
                              <Package className="w-10 h-10 text-neutral-300 mx-auto" />
                              <p className="text-sm font-bold text-neutral-700">Nessun prodotto trovato</p>
                              <p className="text-xs text-neutral-400">Modifica la categoria o i criteri di ricerca</p>
                            </div>
                          ) : (
                            adminFilteredProducts.map((p) => {
                              const stockQty = p.stock ?? 0;
                              const isLowStock = stockQty > 0 && stockQty <= 5;
                              const isOutOfStock = stockQty === 0;
                              const hasVariants = Boolean(p.variants && p.variants.length > 0);
                              const totalVariantStock = hasVariants
                                ? p.variants.reduce((acc: number, curr: any) => acc + (Number(curr.webStock) || 0), 0)
                                : stockQty;

                              return (
                                <article 
                                  key={`m-${p.id}`} 
                                  className="rounded-2xl border border-neutral-200 bg-white shadow-xs hover:border-neutral-300 transition-all p-3.5 sm:p-4 space-y-3"
                                >
                                  {/* RIGA 1: RIFERIMENTO CATEGORIA & SOTTOCATEGORIA + STATO STOCK */}
                                  <div className="flex items-center justify-between gap-1.5 flex-wrap border-b border-neutral-100 pb-2.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-950 text-white px-2.5 py-0.5 rounded-full">
                                        {p.category}
                                      </span>
                                      {p.subcategory && (
                                        <span className="text-[10px] font-medium tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                                          {p.subcategory}
                                        </span>
                                      )}
                                      {p.brand && (
                                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                                          • {p.brand}
                                        </span>
                                      )}
                                    </div>

                                    {/* Badge Disponibilità */}
                                    <div className="shrink-0">
                                      {hasVariants ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full">
                                          {p.variants.length} var • {totalVariantStock} pz
                                        </span>
                                      ) : isOutOfStock ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                          Esaurito
                                        </span>
                                      ) : isLowStock ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                          Scorte: {stockQty}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                          Stock: {stockQty}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* RIGA 2: ANTEPRIMA IMMAGINE + INFO PRODOTTO & PREZZO */}
                                  <div className="flex gap-3 items-start">
                                    <img 
                                      src={p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80'} 
                                      alt={p.name} 
                                      className="w-18 h-22 sm:w-20 sm:h-24 rounded-xl object-cover border border-neutral-200 bg-neutral-100 shrink-0" 
                                    />

                                    <div className="min-w-0 flex-1 space-y-1">
                                      <h4 className="font-bold text-sm text-neutral-950 leading-snug break-words line-clamp-2">
                                        {p.name}
                                      </h4>
                                      <p className="text-[10px] font-mono text-neutral-400">
                                        SKU: {p.sku || `BP-${p.id.padStart(4, '0')}`}
                                      </p>
                                      <div className="flex items-baseline gap-2 pt-0.5">
                                        <span className="text-base font-bold text-neutral-950">
                                          €{Number(p.price || 0).toFixed(2)}
                                        </span>
                                        {p.originalPrice && p.originalPrice > p.price && (
                                          <span className="text-xs text-neutral-400 line-through font-medium">
                                            €{Number(p.originalPrice).toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* RIGA 3: OPZIONI PROMO RAPIDE (VETRINA / SCELTI) */}
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isFeatured: !prod.isFeatured } : prod));
                                        setCartTrigger(c => c + 1);
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl border transition-all text-[11px] font-bold uppercase ${
                                        p.isFeatured 
                                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs' 
                                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-900'
                                      }`}
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <Sparkles className={`w-3.5 h-3.5 ${p.isFeatured ? 'text-brand-yellow fill-brand-yellow' : 'text-neutral-400'}`} />
                                        Vetrina
                                      </span>
                                      <span className={`w-2.5 h-2.5 rounded-full ${p.isFeatured ? 'bg-brand-yellow' : 'bg-neutral-300'}`} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, isSpecialPromotion: !prod.isSpecialPromotion } : prod));
                                        setCartTrigger(c => c + 1);
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl border transition-all text-[11px] font-bold uppercase ${
                                        p.isSpecialPromotion 
                                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs' 
                                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:text-neutral-900'
                                      }`}
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <Star className={`w-3.5 h-3.5 ${p.isSpecialPromotion ? 'text-indigo-400 fill-indigo-400' : 'text-neutral-400'}`} />
                                        Scelti
                                      </span>
                                      <span className={`w-2.5 h-2.5 rounded-full ${p.isSpecialPromotion ? 'bg-indigo-500' : 'bg-neutral-300'}`} />
                                    </button>
                                  </div>

                                  {/* RIGA 4: AZIONI PRINCIPALI (TOUCH FRIENDLY) */}
                                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingAdminProduct(p);
                                        setAdminProductView('single');
                                      }}
                                      className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-neutral-300" />
                                      <span>Modifica Scheda</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleProductSelect(p)}
                                      className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors border border-neutral-200"
                                      title="Visualizza nello Store"
                                      aria-label="Visualizza nello Store"
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
                                      className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition-colors"
                                      aria-label="Elimina Prodotto"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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
                                      <div className="flex flex-col gap-1 items-start">
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-neutral-950 text-white rounded-full w-fit uppercase tracking-wider">{p.category}</span>
                                        {p.subcategory && (
                                          <span className="text-[10px] font-medium px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full w-fit uppercase tracking-wider border border-neutral-200">
                                            {p.subcategory}
                                          </span>
                                        )}
                                        {p.variants && p.variants.length > 0 ? (
                                           <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded-md w-fit uppercase tracking-wider">
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
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                        Metodi di Pagamento
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                        Configura gateway di pagamento, carte, PayPal, bonifico e contrassegno
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Stripe Settings */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">Stripe / Carte</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Carte di credito, Apple Pay, Google Pay</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.stripeEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, stripeEnabled: !prev.stripeEnabled }))}
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Chiave Pubblicabile (PK)</span>
                            <input 
                              type="text" 
                              value={paymentSettings.stripeKey}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, stripeKey: e.target.value }))}
                              placeholder="pk_live_..." 
                              className={ADMIN_INPUT}
                            />
                          </label>
                          <p className="text-[11px] text-neutral-500 font-light bg-neutral-50 p-3 rounded-xl border border-neutral-200/60 leading-relaxed">
                            Stripe accetta automaticamente le principali carte di credito e wallet digitali abilitati.
                          </p>
                        </div>
                      </div>

                      {/* PayPal Settings */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">PayPal</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Pagamento diretto e rateale in 3 rate</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.paypalEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, paypalEnabled: !prev.paypalEnabled }))}
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Email Business PayPal</span>
                            <input 
                              type="email" 
                              value={paymentSettings.paypalEmail}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, paypalEmail: e.target.value }))}
                              placeholder="info@vincentstore.it" 
                              className={ADMIN_INPUT}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Bank Transfer Settings */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">Bonifico Bancario</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Pagamento manuale differito</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.bankEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, bankEnabled: !prev.bankEnabled }))}
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Intestatario Conto</span>
                            <input 
                              type="text" 
                              value={paymentSettings.bankOwner}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankOwner: e.target.value }))}
                              placeholder="VINCENT STORE S.R.L." 
                              className={ADMIN_INPUT}
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">IBAN</span>
                            <input 
                              type="text" 
                              value={paymentSettings.bankIban}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankIban: e.target.value }))}
                              placeholder="IT00 X 00000 00000 000000000000" 
                              className={ADMIN_INPUT}
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Note per il cliente (Visualizzate al checkout)</span>
                            <textarea 
                              value={paymentSettings.bankNote}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, bankNote: e.target.value }))}
                              rows={2}
                              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                              placeholder="Indica il numero dell'ordine nella causale del bonifico."
                            />
                          </label>
                        </div>
                      </div>

                      {/* COD Settings */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5 lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">Contrassegno (COD)</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Pagamento in contanti alla consegna</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={paymentSettings.codEnabled}
                              onChange={() => setPaymentSettings(prev => ({ ...prev, codEnabled: !prev.codEnabled }))}
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Note / Istruzioni per il Cliente</span>
                            <textarea 
                              value={paymentSettings.codNote}
                              onChange={e => setPaymentSettings(prev => ({ ...prev, codNote: e.target.value }))}
                              placeholder="Es: Si prega di preparare l'importo esatto in contanti al momento della consegna da parte del corriere." 
                              rows={2}
                              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 transition-colors resize-none"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'marketplaces' && (
                  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
                        Integrazione Marketplaces
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                        Sincronizzazione catalogo, prezzi e ordini con canali esterni
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Amazon Config */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">Amazon SP-API</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Sincronizzazione catalogo</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
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
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Seller ID</span>
                            <input type="text" placeholder="A1BCDEFGH2IJK" className={ADMIN_INPUT} />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Regione Marketplace</span>
                            <select className="w-full min-h-[48px] bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 transition-colors">
                              <option>Europa (Amazon.it)</option>
                              <option>Nord America (Amazon.com)</option>
                            </select>
                          </label>
                          <button 
                            type="button"
                            onClick={() => addToast("Canale Amazon SP-API verificato", "success")}
                            className={`w-full ${ADMIN_BTN_PRIMARY}`}
                          >
                            Autorizza Canale
                          </button>
                        </div>
                      </div>

                      {/* eBay Config */}
                      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-center text-neutral-900">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-950">eBay Integration</h3>
                              <p className="text-[10px] uppercase text-neutral-400 tracking-wider mt-0.5">Gestione annunci ed ordini</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
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
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950 relative"></div>
                          </label>
                        </div>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">RU Name</span>
                            <input type="text" placeholder="VincentStore-App-..." className={ADMIN_INPUT} />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">Ambiente</span>
                            <select className="w-full min-h-[48px] bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-light focus:outline-none focus:border-neutral-900 transition-colors">
                              <option>Produzione (Live)</option>
                              <option>Sandbox (Test)</option>
                            </select>
                          </label>
                          <button 
                            type="button"
                            onClick={() => addToast("Canale eBay collegato con successo", "success")}
                            className={`w-full ${ADMIN_BTN_PRIMARY}`}
                          >
                            Collega Account eBay
                          </button>
                        </div>
                      </div>

                      {/* Add More */}
                      <div 
                        onClick={() => addToast("Nuovo connettore marketplace in arrivo!", "info")}
                        className="bg-neutral-50/50 rounded-2xl p-6 sm:p-7 border border-dashed border-neutral-300 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-neutral-950 hover:bg-neutral-50 transition-all min-h-[260px]"
                      >
                        <div className="w-12 h-12 bg-white text-neutral-500 rounded-xl border border-neutral-200 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:border-neutral-400 group-hover:text-neutral-950 transition-all mb-3">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-700 group-hover:text-neutral-950 transition-colors">Aggiungi Canale</h3>
                        <p className="text-[10px] text-neutral-400 font-light mt-1 tracking-wide">Google Shopping, TikTok Shop, ManoMano</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-neutral-200/80 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsGeneralSaveSuccess(true)}
                    className={ADMIN_BTN_PRIMARY}
                  >
                    <span>Salva Modifiche</span>
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
                        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
                        onClick={() => setIsGeneralSaveSuccess(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl border border-neutral-200/80 overflow-hidden"
                      >
                        <div className="w-14 h-14 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-950">
                          <Check className="w-7 h-7" />
                        </div>
                        
                        <h3 className="text-base font-light uppercase tracking-[0.2em] text-neutral-950 mb-1">
                          Impostazioni Salvate
                        </h3>
                        <p className="text-xs text-neutral-500 font-light tracking-wide mb-6 leading-relaxed">
                          Le modifiche alle configurazioni del pannello admin sono state salvate correttamente.
                        </p>
                        
                        <div className="flex flex-col gap-2.5">
                          <button 
                            type="button"
                            onClick={() => setIsGeneralSaveSuccess(false)}
                            className={`w-full ${ADMIN_BTN_PRIMARY}`}
                          >
                            Rimani qui
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => {
                              setIsGeneralSaveSuccess(false);
                              setIsAdminOpen(false);
                            }}
                            className={`w-full ${ADMIN_BTN_SECONDARY}`}
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


