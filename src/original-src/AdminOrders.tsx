import React, { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  X, 
  CreditCard, 
  MapPin, 
  User, 
  Package, 
  Calendar, 
  AlertCircle, 
  ChevronDown, 
  Hash, 
  Printer, 
  FileText, 
  Tag, 
  Box, 
  Zap, 
  RefreshCw, 
  Layers,
  Globe,
  Check,
  ZoomIn
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS } from "./data";
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from "@/components/admin/adminTouchTargets";

const getProductWeight = (productId: string): number => {
  const prod = PRODUCTS.find(p => String(p.id) === String(productId));
  if (!prod) return 0.1;
  if (typeof prod.weight === 'number') return prod.weight;
  if (prod.specs && prod.specs["Peso"]) {
    const parsed = parseFloat(prod.specs["Peso"]);
    if (!isNaN(parsed)) return parsed;
  }
  return 0.1;
};

const getOrderWeight = (order: any): number => {
  if (typeof order.weight === 'number') return order.weight;
  if (typeof order.totalWeight === 'number') return order.totalWeight;
  
  const items = resolveOrderItems(order);
  if (items.length > 0) {
    return items.reduce((sum: number, item: any) => {
      const itemQty = Number(item.qty) || 1;
      const itemWeight = getProductWeight(item.id);
      return sum + (itemWeight * itemQty);
    }, 0);
  }
  return 0.5;
};

export const COURIERS = [
  { id: 'gls', name: 'GLS Italy', logo: 'gls' },
  { id: 'dhl', name: 'DHL Express', logo: 'dhl' },
  { id: 'brt', name: 'BRT Corriere Espresso', logo: 'brt' },
  { id: 'poste', name: 'Poste Italiane', logo: 'poste' },
];

export const FALLBACK_CATALOG = [
  { id: "1", name: "Giacca Sartoriale Lana Vergine", price: 189.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
  { id: "2", name: "Camicia Lino Bianco Collo Francese", price: 69.00, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80" },
  { id: "3", name: "Pantaloni Chino Slim Fit Antracite", price: 89.00, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80" },
  { id: "4", name: "Mocassini Penny Pelle Spazzolata", price: 145.00, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80" },
  { id: "5", name: "Maglia Girocollo Cashmere Blend", price: 119.00, image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&q=80" },
  { id: "6", name: "Sneaker Minimal Leather White", price: 95.00, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80" },
  { id: "7", name: "Blazer Destrutturato Blu Navy", price: 169.00, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80" },
  { id: "8", name: "Polo Piqué Cotone Egiziano", price: 55.00, image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80" },
];

export const resolveOrderItems = (order: any): any[] => {
  if (Array.isArray(order?.items) && order.items.length > 0) {
    return order.items.map((item: any, i: number) => {
      let img = item.image || item.imageUrl;
      if (!img || img.includes('picsum.photos')) {
        const fallback = FALLBACK_CATALOG[i % FALLBACK_CATALOG.length];
        img = fallback.image;
      }
      return {
        ...item,
        image: img,
        qty: Number(item.qty) || 1,
        price: Number(item.price) || (Number(order.total) / (order.itemsCount || 1)),
      };
    });
  }

  // Fallback per ordini simulati che non contengono l'array completo di item
  const count = Math.max(1, Number(order?.itemsCount) || 1);
  const items: any[] = [];
  const hash = (order?.id || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  
  for (let i = 0; i < count; i++) {
    const template = FALLBACK_CATALOG[(hash + i) % FALLBACK_CATALOG.length];
    const unitPrice = count === 1 ? order.total : (order.total / count);
    items.push({
      id: `${order.id}-item-${i + 1}`,
      name: template.name,
      price: Math.max(9.90, Number(Number(unitPrice).toFixed(2))),
      qty: 1,
      image: template.image,
    });
  }
  return items;
};

export const INITIAL_ORDERS = [
  { id: "BP-2026-881", date: "30 Mar 2026", customer: "Marco Rossi", email: "marco.rossi@example.com", channel: "amazon", total: 124.50, status: "pending", itemsCount: 2, address: "Via Roma 12, 00100 Roma (RM)", payment: "Mastercard **** 4492", trackingId: "", items: [{ id: "1", name: "Faretto LED Incasso 10W", qty: 2, price: 12.90, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" }, { id: "7", name: "Striscia LED RGB 5mt", qty: 1, price: 19.90, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80" }] },
  { id: "BP-2026-880", date: "30 Mar 2026", customer: "Giulia Bianchi", email: "giulia.b@email.it", channel: "website", total: 89.00, status: "shipped", itemsCount: 1, address: "Corso Milano 45, 20100 Milano (MI)", payment: "PayPal", trackingId: "CH123456789IT", items: [{ id: "3", name: "Trapano Avvitatore 18V", qty: 1, price: 89.90, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80" }] },
  { id: "BP-2026-879", date: "29 Mar 2026", customer: "eBay User_99", email: "ebay_user@test.com", channel: "ebay", total: 210.00, status: "delivered", itemsCount: 3, address: "Piazza Garibaldi 1, 80100 Napoli (NA)", payment: "Visa **** 1122", trackingId: "EB987654321IT", items: [] },
  { id: "BP-2026-878", date: "29 Mar 2026", customer: "Alessandro Verri", email: "averri@outlook.it", channel: "amazon", total: 45.90, status: "cancelled", itemsCount: 1, address: "Via Dante 8, 50100 Firenze (FI)", payment: "Amazon Pay", trackingId: "", items: [] },
  { id: "BP-2026-877", date: "28 Mar 2026", customer: "Elena Neri", email: "elena.neri@gmail.com", channel: "website", total: 320.00, status: "shipped", itemsCount: 4, address: "Via Mazzini 22, 10100 Torino (TO)", payment: "Bonifico", trackingId: "BW556677889IT", carrierId: "gls", items: [] },
  { id: "BP-2026-876", date: "28 Mar 2026", customer: "Luca Moretti", email: "l.moretti@email.com", channel: "amazon", total: 55.00, status: "pending", itemsCount: 1, address: "Via Veneto 10, Roma", payment: "Amex", trackingId: "", items: [] },
  { id: "BP-2026-875", date: "27 Mar 2026", customer: "Sara Esposito", email: "sara.e@gmail.com", channel: "ebay", total: 12.90, status: "delivered", itemsCount: 1, address: "Via Toledo 200, Napoli", payment: "Mastercard", trackingId: "IT123123123", items: [] },
  { id: "BP-2026-874", date: "27 Mar 2026", customer: "Pietro Galli", email: "p.galli@test.it", channel: "website", total: 450.00, status: "pending", itemsCount: 5, address: "Via Emilia 1, Parma", payment: "PayPal", trackingId: "", items: [] },
  { id: "BP-2026-873", date: "26 Mar 2026", customer: "Chiara Romano", email: "chiara.r@email.com", channel: "amazon", total: 33.40, status: "shipped", itemsCount: 2, address: "Viale Monza 120, Milano", payment: "Visa", trackingId: "GLS9898987", items: [] },
  { id: "BP-2026-872", date: "26 Mar 2026", customer: "Antonio Bruno", email: "antonio.b@gmail.com", channel: "ebay", total: 110.00, status: "delivered", itemsCount: 2, address: "Via dei Mille 5, Palermo", payment: "Mastercard", trackingId: "EB00012354", items: [] },
  { id: "BP-2026-871", date: "25 Mar 2026", customer: "Marta Greco", email: "marta.g@outlook.com", channel: "website", total: 78.50, status: "delivered", itemsCount: 1, address: "Via Appia 3, Latina", payment: "Visa", trackingId: "P12312399", items: [] },
  { id: "BP-2026-870", date: "25 Mar 2026", customer: "Fabio Colombo", email: "f.colombo@gmail.com", channel: "amazon", total: 19.90, status: "cancelled", itemsCount: 1, address: "Via Larga 2, Milano", payment: "PayPal", trackingId: "", items: [] },
  { id: "BP-2026-869", date: "24 Mar 2026", customer: "Sofia Costa", email: "sofia.costa@email.it", channel: "ebay", total: 245.00, status: "shipped", itemsCount: 3, address: "Via Garibaldi 10, Genova", payment: "Visa", trackingId: "BRT11223344", items: [] },
  { id: "BP-2026-868", date: "24 Mar 2026", customer: "Lorenzo Ricci", email: "lorenzo.r@gmail.com", channel: "website", total: 67.20, status: "pending", itemsCount: 1, address: "Via Roma 100, Firenze", payment: "Amazon Pay", trackingId: "", items: [] },
  { id: "BP-2026-867", date: "23 Mar 2026", customer: "Alice Fontana", email: "alice.f@email.com", channel: "amazon", total: 129.90, status: "delivered", itemsCount: 2, address: "Corso Italia 5, Bologna", payment: "Mastercard", trackingId: "DH00998877", items: [] },
  { id: "BP-2026-866", date: "23 Mar 2026", customer: "Davide Leone", email: "davide.l@gmail.com", channel: "ebay", total: 8.50, status: "delivered", itemsCount: 1, address: "Via San Marco 14, Venezia", payment: "PayPal", trackingId: "IT998877665", items: [] },
  { id: "BP-2026-865", date: "22 Mar 2026", customer: "Anna De Luca", email: "anna.dl@email.it", channel: "website", total: 540.00, status: "shipped", itemsCount: 6, address: "Via Libertà 20, Bari", payment: "Bonifico", trackingId: "PST33445566", carrierId: "poste", items: [] },
  { id: "BP-2026-864", date: "22 Mar 2026", customer: "Giorgio Manzi", email: "g.manzi@gmail.com", channel: "amazon", total: 99.00, status: "cancelled", itemsCount: 1, address: "Via del Corso 30, Roma", payment: "Visa", trackingId: "", items: [] },
  { id: "BP-2026-863", date: "21 Mar 2026", customer: "Paola Serra", email: "paola.s@outlook.it", channel: "ebay", total: 45.20, status: "delivered", itemsCount: 2, address: "Via Dante 12, Cagliari", payment: "Mastercard", trackingId: "EB554433221", items: [] },
  { id: "BP-2026-862", date: "21 Mar 2026", customer: "Ruggero Riva", email: "r.riva@email.com", channel: "website", total: 15.00, status: "delivered", itemsCount: 1, address: "Via Valtellina 8, Sondrio", payment: "Visa", trackingId: "IT887766554", items: [] },
  { id: "BP-2026-861", date: "20 Mar 2026", customer: "Silvia Galli", email: "silvia.g@gmail.com", channel: "amazon", total: 32.10, status: "pending", itemsCount: 1, address: "Via dei Laghi 4, Como", payment: "PayPal", trackingId: "", items: [] },
  { id: "BP-2026-860", date: "20 Mar 2026", customer: "Roberto Pozzi", email: "r.pozzi@email.it", channel: "ebay", total: 21.00, status: "delivered", itemsCount: 1, address: "Via Matteotti 3, Varese", payment: "Mastercard", trackingId: "IT111222333", items: [] },
];

interface AdminOrdersProps {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  pageSettings?: any;
  returnRequests?: any[];
  setReturnRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  onViewReturn?: (returnId: string) => void;
  initialSelectedOrderId?: string | null;
  onClearSelectedOrderId?: () => void;
}

export const AdminOrders = ({ 
  orders, 
  setOrders,
  pageSettings,
  returnRequests = [],
  setReturnRequests = () => {},
  onViewReturn,
  initialSelectedOrderId,
  onClearSelectedOrderId
}: AdminOrdersProps) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialSelectedOrderId || null);
  const [openStatusPickerId, setOpenStatusPickerId] = useState<string | null>(null);
  const [zoomedProductImage, setZoomedProductImage] = useState<{ url: string; name: string; price?: number } | null>(null);

  React.useEffect(() => {
    if (initialSelectedOrderId) {
      setSelectedOrderId(initialSelectedOrderId);
    }
  }, [initialSelectedOrderId]);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<"channel" | "payment" | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null);
  const [tempTrackingId, setTempTrackingId] = useState("");
  const [tempCarrierId, setTempCarrierId] = useState("");

  const parseOrderDate = (dateStr: string) => {
    const months: { [key: string]: number } = {
      'jan': 0, 'gen': 0,
      'feb': 1,
      'mar': 2,
      'apr': 3,
      'may': 4, 'mag': 4,
      'jun': 5, 'giu': 5,
      'jul': 6, 'lug': 6,
      'aug': 7, 'ago': 7,
      'sep': 8, 'set': 8,
      'oct': 9, 'ott': 9,
      'nov': 10,
      'dec': 11, 'dic': 11
    };
    const parts = dateStr.replace('.', '').split(' ');
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0]);
    const monthKey = parts[1].toLowerCase().substring(0, 3);
    const month = months[monthKey] !== undefined ? months[monthKey] : 0;
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const isSelectedBankTransfer = selectedOrder ? (selectedOrder.payment?.toLowerCase().includes('bonifico') || selectedOrder.paymentType === 'bank') : false;
  const isLockedSidebar = selectedOrder ? (isSelectedBankTransfer && !selectedOrder.isPaid) : false;

  const handleStatusChange = (order: any, newStatus: string) => {
    setOpenStatusPickerId(null);
    if (newStatus === 'shipped') {
      setTrackingModalOrder(order);
      setTempTrackingId(order.trackingId || "");
      setTempCarrierId(order.carrierId || COURIERS[0].id);
    } else {
      updateOrderStatus(order.id, newStatus);
    }
  };

  const confirmShipping = () => {
    if (!trackingModalOrder) return;
    
    updateOrderStatus(trackingModalOrder.id, 'shipped', {
      trackingId: tempTrackingId,
      carrierId: tempCarrierId
    });
    
    setTrackingModalOrder(null);
    setTempTrackingId("");
    setTempCarrierId("");
  };

  const updateOrderStatus = (orderId: string, newStatus: string, extraData: any = {}) => {
    setIsUpdatingStatus(true);
    setUpdatingOrderId(orderId);
    
    setTimeout(async () => {
      const order = orders.find(o => o.id === orderId);
      
      setOrders(prev => prev.map(o => o.id === orderId 
        ? { ...o, status: newStatus, ...extraData } : o));
      setIsUpdatingStatus(false);
      setUpdatingOrderId(null);

      if (order) {
        try {
          const savedSettings = localStorage.getItem('companySettings');
          const companySettings = savedSettings ? JSON.parse(savedSettings) : {};
          const senderEmail = companySettings.orderStatusSenderEmail || companySettings.email || 'noreply@vincent.it';

          const res = await fetch('/api/send-status-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderEmail,
              customerEmail: order.email,
              customerName: order.customer,
              orderId: order.id,
              status: newStatus,
              trackingId: extraData.trackingId || order.trackingId,
              carrier: extraData.carrierId || order.carrierId
            })
          });
          const data = await res.json();
          console.log('[API Send Email Response]', data);
        } catch (err) {
          console.error('[Error sending status email]', err);
        }
      }
    }, 600);
  };

  const updateTrackingId = (orderId: string, trackingId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingId } : o));
  };

  const togglePaidStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isPaid: !o.isPaid } : o));
  };

  const updateOrderCarrier = (orderId: string, carrierId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, carrierId } : o));
  };

  const resetAllFilters = () => {
    setFilter('all');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setChannelFilter('all');
    setPaymentFilter('all');
  };

  const isAnyFilterActive = filter !== 'all' || search !== '' || startDate !== '' || endDate !== '' || channelFilter !== 'all' || paymentFilter !== 'all';

  const handlePrintSelectedOrders = () => {
    const ordersToPrint = filteredOrders;
    if (ordersToPrint.length === 0) return;

    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) return;

    const statusLabel = (s: string) =>
      s === 'pending' ? 'In Attesa' : s === 'shipped' ? 'In Spedizione' : s === 'delivered' ? 'Consegnato' : s === 'refunded' ? 'Rimborso' : 'Annullato';

    const orderPageHTML = (order: any, isLast: boolean) => {
      const items = resolveOrderItems(order);
      const itemsHTML = items.map((item: any) => `
        <tr>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
            ${item.image
              ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #eee;"/>`
              : '<div style="width:36px;height:36px;background:#f5f5f5;border-radius:4px;"></div>'}
          </td>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
            <strong style="font-size:12px;color:#0a0a0a;">${item.name}</strong>
            <div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">SKU-${String(item.id).padStart(4,'0')}</div>
          </td>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#555;">${getProductWeight(item.id).toFixed(2)} kg</td>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;">&euro;${Number(item.price).toFixed(2)}</td>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;">
            <span style="background:#f5f5f5;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;">${item.qty}</span>
          </td>
          <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;font-size:12px;">&euro;${(Number(item.price)*Number(item.qty)).toFixed(2)}</td>
        </tr>
      `).join('');

      const emptyRow = items.length === 0
        ? '<tr><td colspan="6" style="padding:24px;text-align:center;color:#aaa;font-size:11px;">Dettaglio prodotti non disponibile</td></tr>'
        : '';

      const courierName = COURIERS.find(c => c.id === order.carrierId)?.name || '—';

      return `
<div style="padding:28px 32px;${!isLast ? 'page-break-after:always;' : ''}">
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #171717;margin-bottom:20px;">
    <div>
      <div style="font-weight:700;font-size:20px;text-transform:uppercase;letter-spacing:2px;">VINCENT STORE</div>
      <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Riepilogo Ordine Cliente</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;">N° Ordine</div>
      <div style="font-size:20px;font-weight:700;">${order.id}</div>
      <div style="font-size:9px;color:#737373;text-transform:uppercase;margin-top:2px;">${order.date} via ${order.channel}</div>
    </div>
  </div>

  <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:10px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;">Stato Ordine</div>
    <div style="font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${statusLabel(order.status)}</div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:12px;">
      <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#737373;margin-bottom:6px;">Cliente</div>
      <div style="font-weight:700;font-size:14px;">${order.customer}</div>
      <div style="font-size:10px;color:#525252;margin-top:2px;">${order.email}</div>
      <div style="font-size:10px;color:#171717;font-weight:600;">${order.phone || '—'}</div>
    </div>
    <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:12px;">
      <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#737373;margin-bottom:6px;">Destinazione merce</div>
      <div style="font-weight:600;font-size:12px;">${order.address}</div>
      ${order.notes ? `<div style="font-size:9px;color:#d97706;margin-top:6px;font-weight:600;">NOTE: ${order.notes}</div>` : ''}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    <div style="background:#171717;color:white;border-radius:8px;padding:10px 16px;">
      <div style="font-size:8px;color:#a3a3a3;text-transform:uppercase;letter-spacing:1px;">Metodo di Pagamento</div>
      <div style="font-weight:700;font-size:13px;margin-top:4px;">${order.payment || '—'}</div>
    </div>
    <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:8px;color:#737373;text-transform:uppercase;letter-spacing:1px;">Corriere</div>
        <div style="font-weight:700;font-size:13px;color:#171717;margin-top:4px;">${courierName}</div>
        ${order.trackingId ? `<div style="font-size:9px;color:#525252;font-weight:600;margin-top:2px;">Track: ${order.trackingId}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:8px;color:#737373;text-transform:uppercase;letter-spacing:1px;">Peso Totale</div>
        <div style="font-weight:700;font-size:14px;color:#171717;margin-top:4px;">${getOrderWeight(order).toFixed(2)} kg</div>
      </div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:#f5f5f5;">
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:44px;"></th>
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:left;">Articolo</th>
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Peso</th>
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Prezzo</th>
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Qt</th>
      <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:right;">Totale</th>
    </tr></thead>
    <tbody>${itemsHTML}${emptyRow}</tbody>
  </table>

  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-top:16px;padding-top:12px;border-top:2px solid #f0f0f0;">
    <div style="display:flex;justify-content:space-between;width:200px;font-size:10px;color:#737373;">
      <span>Subtotale</span><span style="color:#171717;font-weight:700;">&euro;${order.total.toFixed(2)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;width:200px;font-size:10px;color:#16a34a;font-weight:700;">
      <span>Spedizione</span><span>&euro;0,00</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;width:220px;background:#171717;color:white;padding:10px 16px;border-radius:10px;margin-top:4px;">
      <span style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Totale Ordine</span>
      <span style="font-weight:700;font-size:18px;">&euro;${order.total.toFixed(2)}</span>
    </div>
  </div>

  <div style="margin-top:28px;padding-top:10px;border-top:1px solid #eee;font-size:8px;color:#a3a3a3;display:flex;justify-content:space-between;">
    <span>Documento interno — ${new Date().toLocaleString('it-IT')}</span>
    <span>Vincent Store Admin — ${order.id}</span>
  </div>
</div>`;
    };

    const allPagesHTML = ordersToPrint.map((o, i) => orderPageHTML(o, i === ordersToPrint.length - 1)).join('\n');

    win.document.write(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8">
<title>Ordini Selezionati (${ordersToPrint.length})</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter',sans-serif;color:#171717;background:white; }
  @media print {
    @page { size:A4 portrait;margin:0; }
    body { background:white; }
  }
</style></head>
<body>${allPagesHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 800);
  };

  const handlePrintList = () => {
    const win = window.open('', '_blank', 'width=1000,height=750');
    if (!win) return;

    const statusLabel = (s: string) =>
      s === 'pending' ? 'In Attesa' : s === 'shipped' ? 'Spedito' : s === 'delivered' ? 'Consegnato' : 'Annullato';

    const rowsHTML = filteredOrders.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
        <td style="padding:10px 6px;font-size:11px;font-weight:700;color:#171717;border-bottom:1px solid #f0f0f0;">${o.id}</td>
        <td style="padding:10px 6px;font-size:10px;color:#525252;border-bottom:1px solid #f0f0f0;">${o.date}</td>
        <td style="padding:10px 6px;border-bottom:1px solid #f0f0f0;">
          <div style="font-weight:600;font-size:11px;color:#171717;">${o.customer}</div>
          <div style="font-size:9px;color:#a3a3a3;">${o.email}</div>
        </td>
        <td style="padding:10px 6px;font-size:10px;font-weight:600;text-transform:uppercase;color:#171717;border-bottom:1px solid #f0f0f0;">${o.channel}</td>
        <td style="padding:10px 6px;font-size:10px;color:#525252;border-bottom:1px solid #f0f0f0;">${o.payment || '—'}</td>
        <td style="padding:10px 6px;font-size:10px;color:#525252;border-bottom:1px solid #f0f0f0;">${o.trackingId || '—'}</td>
        <td style="padding:10px 6px;text-align:right;font-weight:700;font-size:12px;color:#171717;border-bottom:1px solid #f0f0f0;">€${o.total.toFixed(2)}</td>
        <td style="padding:10px 6px;text-align:center;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:9px;font-weight:600;text-transform:uppercase;padding:3px 8px;border-radius:99px;border:1px solid #e5e5e5;color:#171717;">${statusLabel(o.status)}</span>
        </td>
      </tr>
    `).join('');

    win.document.write(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8">
<title>Lista Ordini (${filteredOrders.length})</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter',sans-serif;color:#171717;padding:24px;background:white; }
  table { width:100%;border-collapse:collapse;margin-top:16px; }
  @media print { @page { size:A4 landscape;margin:10mm; } }
</style></head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #171717;padding-bottom:12px;">
    <h2>VINCENT STORE — REGISTRO ORDINI</h2>
    <span style="font-size:11px;color:#737373;">${new Date().toLocaleDateString('it-IT')}</span>
  </div>
  <table>
    <thead><tr style="background:#f5f5f5;font-size:9px;text-transform:uppercase;">
      <th style="padding:8px 6px;text-align:left;">ID Ordine</th>
      <th style="padding:8px 6px;text-align:left;">Data</th>
      <th style="padding:8px 6px;text-align:left;">Cliente</th>
      <th style="padding:8px 6px;text-align:left;">Canale</th>
      <th style="padding:8px 6px;text-align:left;">Pagamento</th>
      <th style="padding:8px 6px;text-align:left;">Tracking</th>
      <th style="padding:8px 6px;text-align:right;">Totale</th>
      <th style="padding:8px 6px;text-align:center;">Stato</th>
    </tr></thead>
    <tbody>${rowsHTML}</tbody>
  </table>
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const handlePrintSingleOrder = (order: any) => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    const items = resolveOrderItems(order);
    const itemsHTML = items.map((item: any) => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
          ${item.image ? `<img src="${item.image}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #eee;"/>` : '<div style="width:36px;height:36px;background:#f5f5f5;border-radius:4px;"></div>'}
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;">
          <strong style="font-size:12px;color:#171717;">${item.name}</strong>
          <div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">SKU-${String(item.id).padStart(4,'0')}</div>
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#555;">${getProductWeight(item.id).toFixed(2)} kg</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;">€${Number(item.price).toFixed(2)}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;">
          <span style="background:#f5f5f5;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;">${item.qty}</span>
        </td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;font-size:12px;">€${(Number(item.price)*Number(item.qty)).toFixed(2)}</td>
      </tr>
    `).join('');

    const courierName = COURIERS.find(c => c.id === order.carrierId)?.name || '—';
    const statusLabel = order.status === 'pending' ? 'In Attesa' : order.status === 'shipped' ? 'In Spedizione' : order.status === 'delivered' ? 'Consegnato' : order.status === 'refunded' ? 'Rimborso' : 'Annullato';

    win.document.write(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8">
<title>Ordine ${order.id} — Vincent Store</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter',sans-serif;color:#171717;padding:28px 32px;background:white; }
  table { width:100%;border-collapse:collapse; }
  @media print { @page { size:A4 portrait;margin:12mm 14mm; } body { padding:0; } }
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid #171717;margin-bottom:20px;">
  <div>
    <div style="font-weight:700;font-size:20px;text-transform:uppercase;letter-spacing:2px;">VINCENT STORE</div>
    <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Riepilogo Ordine</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;">N° Ordine</div>
    <div style="font-size:20px;font-weight:700;">${order.id}</div>
    <div style="font-size:9px;color:#737373;text-transform:uppercase;margin-top:2px;">${order.date} via ${order.channel}</div>
  </div>
</div>
<div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:10px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
  <div style="font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;">Stato Ordine</div>
  <div style="font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">${statusLabel}</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
  <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:12px;">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#737373;margin-bottom:6px;">Cliente</div>
    <div style="font-weight:700;font-size:14px;">${order.customer}</div>
    <div style="font-size:10px;color:#525252;margin-top:2px;">${order.email}</div>
    <div style="font-size:10px;color:#171717;font-weight:600;">${order.phone || '—'}</div>
  </div>
  <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:12px;">
    <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#737373;margin-bottom:6px;">Destinazione merce</div>
    <div style="font-weight:600;font-size:12px;">${order.address}</div>
  </div>
</div>
<table>
  <thead><tr style="background:#f5f5f5;">
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;width:44px;"></th>
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:left;">Articolo</th>
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Peso</th>
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Prezzo</th>
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:center;">Qt</th>
    <th style="padding:8px 4px;font-size:9px;color:#737373;text-transform:uppercase;letter-spacing:1px;font-weight:700;text-align:right;">Totale</th>
  </tr></thead>
  <tbody>${itemsHTML}</tbody>
</table>
<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-top:16px;padding-top:12px;border-top:2px solid #f0f0f0;">
  <div style="display:flex;justify-content:space-between;width:220px;background:#171717;color:white;padding:10px 16px;border-radius:10px;margin-top:4px;">
    <span style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Totale Ordine</span>
    <span style="font-weight:700;font-size:18px;">€${order.total.toFixed(2)}</span>
  </div>
</div>
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return "bg-amber-50 text-amber-700 border-amber-200/80";
      case 'shipped': return "bg-sky-50 text-sky-700 border-sky-200/80";
      case 'delivered': return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case 'refunded': return "bg-rose-50 text-rose-700 border-rose-200/80";
      case 'cancelled': return "bg-neutral-100 text-neutral-600 border-neutral-200/80";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'In Attesa';
      case 'shipped': return 'Spedito';
      case 'delivered': return 'Consegnato';
      case 'refunded': return 'Rimborsato';
      case 'cancelled': return 'Annullato';
      case 'refund requested': return 'Reso Richiesto';
      default: return status;
    }
  };

  const getChannelBadge = (channel: string) => {
    const c = (channel || "").toLowerCase();
    switch(c) {
      case 'amazon': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 text-[10px] font-mono uppercase">Amazon</span>;
      case 'ebay': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200/60 text-[10px] font-mono uppercase">eBay</span>;
      case 'tiktok': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[10px] font-mono uppercase">TikTok</span>;
      case 'web':
      case 'website': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/60 text-[10px] font-mono uppercase">Web Direct</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-mono uppercase">{channel}</span>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase());
    
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = parseOrderDate(o.date);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (orderDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (orderDate > end) matchesDate = false;
      }
    }

    let matchesChannel = true;
    if (channelFilter !== 'all') {
      const orderChan = (o.channel || "").toLowerCase();
      if (channelFilter === 'web' || channelFilter === 'website') {
        matchesChannel = orderChan === 'web' || orderChan === 'website';
      } else {
        matchesChannel = orderChan === channelFilter.toLowerCase();
      }
    }

    let matchesPayment = true;
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'bonifico') matchesPayment = o.payment?.toLowerCase().includes('bonifico') || o.paymentType === 'bank';
      else if (paymentFilter === 'cod') matchesPayment = o.payment?.toLowerCase().includes('contrassegno') || o.paymentType === 'cod';
      else if (paymentFilter === 'stripe') matchesPayment = o.payment?.toLowerCase().includes('stripe') || o.paymentType === 'stripe';
      else if (paymentFilter === 'paypal') matchesPayment = o.payment?.toLowerCase().includes('paypal') || o.paymentType === 'paypal';
    }

    return matchesFilter && matchesSearch && matchesDate && matchesChannel && matchesPayment;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Data", "Cliente", "Email", "Piattaforma", "Totale", "Stato", "Metodo Pagamento", "Tracking", "Indirizzo Spedizione", "Telefono", "Peso + Imballo (Kg)"];
    const rows = filteredOrders.map(o => [
      o.id, 
      o.date, 
      `"${o.customer}"`, 
      o.email, 
      o.channel, 
      o.total.toFixed(2), 
      o.status, 
      o.payment || "N/A", 
      o.trackingId || "", 
      `"${o.address || ""}"`, 
      `"${o.phone || ""}"`, 
      `${getOrderWeight(o).toFixed(2)}`
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', ''); 
    a.setAttribute('href', url);
    a.setAttribute('download', `ordini_vincent_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  };

  const selectedOrderItems = selectedOrder ? resolveOrderItems(selectedOrder) : [];

  return (
    <div className="admin-orders-panel max-w-5xl mx-auto pb-20 animate-in fade-in duration-300">
      
      {/* Header armonizzato come la sezione Categorie */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Ordini
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {orders.length} ordini registrati · spedizioni e monitoraggio store
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            type="button" 
            onClick={handlePrintList} 
            className={`${ADMIN_BTN_SECONDARY} flex-1 sm:flex-none rounded-full min-h-[42px] px-3.5 text-[11px]`}
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span>Stampa Lista</span>
          </button>
          <button 
            type="button" 
            onClick={handleExportCSV} 
            className={`${ADMIN_BTN_SECONDARY} flex-1 sm:flex-none rounded-full min-h-[42px] px-3.5 text-[11px]`}
          >
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Esporta CSV</span>
          </button>
          {filteredOrders.length > 0 && (
            <button
              type="button"
              onClick={handlePrintSelectedOrders}
              className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto rounded-full min-h-[42px] px-4 text-[11px]`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dettagli ({filteredOrders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards - Minimali e Pulite */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Totale Ordini", val: orders.length.toString(), sub: `${orders.length} complessivi` },
          { label: "In Attesa", val: orders.filter(o => o.status === 'pending').length.toString(), sub: "Da elaborare" },
          { label: "In Spedizione", val: orders.filter(o => o.status === 'shipped').length.toString(), sub: "In transito" },
          { label: "Consegnati", val: orders.filter(o => o.status === 'delivered').length.toString(), sub: "Completati" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block truncate">
              {s.label}
            </span>
            <div className="text-xl sm:text-2xl font-light text-neutral-950 tracking-tight">
              {s.val}
            </div>
            <p className="text-[10px] text-neutral-400 font-light truncate">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Box Ricerca e Filtri - Touch Friendly */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 mb-8">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Cerca per ID ordine, nome cliente, tracking..." 
            className={`${ADMIN_INPUT} pl-10 rounded-xl`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab orizzontale filtri stato (touch scrollabile su mobile) */}
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/60 min-w-full sm:min-w-0">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'pending', label: 'In Attesa' },
              { id: 'shipped', label: 'Spediti' },
              { id: 'delivered', label: 'Consegnati' },
              { id: 'cancelled', label: 'Annullati' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-light uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap min-h-[38px] ${
                  filter === tab.id
                    ? 'bg-neutral-950 text-white font-medium shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtri Avanzati: Canale, Metodo, Date */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-neutral-100">
          {/* Dropdown Canale */}
          <div className="relative flex-1 sm:flex-none">
            <button 
              type="button"
              onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'channel' ? null : 'channel')}
              className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl text-xs font-light text-neutral-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="truncate">
                {channelFilter === 'all' && 'Tutti i Canali'}
                {channelFilter === 'web' && 'Sito Web Direct'}
                {channelFilter !== 'all' && channelFilter !== 'web' && `${channelFilter.toUpperCase()}`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${activeFilterDropdown === 'channel' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeFilterDropdown === 'channel' && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveFilterDropdown(null)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg z-40 p-1 space-y-0.5"
                  >
                    {['all', 'web', ...(pageSettings?.enabledMarketplaces || ["Amazon", "eBay"])].map((c) => {
                      const val = c.toLowerCase();
                      const isSel = (c === 'all' && channelFilter === 'all') || (channelFilter === val);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setChannelFilter(c === 'all' ? 'all' : val); setActiveFilterDropdown(null); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            isSel ? 'bg-neutral-950 text-white font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{c === 'all' ? 'Tutti i Canali' : c === 'web' ? 'Sito Web Direct' : c}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Dropdown Pagamento */}
          <div className="relative flex-1 sm:flex-none">
            <button 
              type="button"
              onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'payment' ? null : 'payment')}
              className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-xl text-xs font-light text-neutral-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="truncate">
                {paymentFilter === 'all' && 'Tutti i Pagamenti'}
                {paymentFilter === 'bonifico' && 'Bonifico'}
                {paymentFilter === 'cod' && 'Contrassegno'}
                {paymentFilter === 'stripe' && 'Carta / Stripe'}
                {paymentFilter === 'paypal' && 'PayPal'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${activeFilterDropdown === 'payment' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeFilterDropdown === 'payment' && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveFilterDropdown(null)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg z-40 p-1 space-y-0.5"
                  >
                    {[
                      { val: 'all', label: 'Tutti i Pagamenti' },
                      { val: 'bonifico', label: 'Bonifico Bancario' },
                      { val: 'cod', label: 'Contrassegno' },
                      { val: 'stripe', label: 'Carta / Stripe' },
                      { val: 'paypal', label: 'PayPal' },
                    ].map((p) => {
                      const isSel = paymentFilter === p.val;
                      return (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => { setPaymentFilter(p.val); setActiveFilterDropdown(null); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            isSel ? 'bg-neutral-950 text-white font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{p.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Date Picker Compatto */}
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 rounded-xl px-3 py-1.5 min-h-[40px] text-xs text-neutral-700 w-full sm:w-auto">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-transparent border-none text-xs p-0 text-neutral-800 outline-none w-24"
              title="Data da"
            />
            <span className="text-neutral-300">→</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-transparent border-none text-xs p-0 text-neutral-800 outline-none w-24"
              title="Data a"
            />
            {(startDate || endDate) && (
              <button 
                type="button" 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="text-neutral-400 hover:text-neutral-800 p-0.5 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filtri */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="min-h-[40px] px-3 py-1.5 text-neutral-500 hover:text-red-600 text-xs font-light flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Azzera filtri</span>
            </button>
          )}
        </div>
      </div>

      {/* ELENCO ORDINI: VERSIONE MOBILE-FIRST CARD CON ANTEPRIMA PRODOTTI */}
      <div className="block md:hidden space-y-3.5 mb-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-8 text-center text-neutral-400 text-xs font-light">
            Nessun ordine trovato con i criteri selezionati.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isBankTransfer = order.payment?.toLowerCase().includes('bonifico') || order.paymentType === 'bank';
            const isLocked = isBankTransfer && !order.isPaid;
            const items = resolveOrderItems(order);

            return (
              <div 
                key={order.id}
                className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm space-y-3 transition-all hover:border-neutral-300 active:scale-[0.99]"
              >
                {/* Header card mobile: ID + Canale + Data */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-neutral-900">
                      {order.id}
                    </span>
                    {getChannelBadge(order.channel)}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-light">
                    {order.date}
                  </span>
                </div>

                {/* Cliente e totale */}
                <div className="flex items-start justify-between gap-3 pt-0.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {order.customer}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {order.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-medium text-neutral-950 block">
                      €{order.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {order.payment?.split(' ')[0] || 'Pagamento'}
                    </span>
                  </div>
                </div>

                {/* ANTEPRIMA MINIATURE PRODOTTI ACQUISTATI (TOUCH & VISIVA) */}
                <div 
                  onClick={() => setSelectedOrderId(order.id)}
                  className="bg-neutral-50/80 hover:bg-neutral-100/70 border border-neutral-200/60 rounded-xl p-2.5 transition-colors cursor-pointer"
                  title="Tocca per vedere i dettagli dell'ordine"
                >
                  <div className="flex items-center gap-3">
                    {/* Miniature dei prodotti acquistati */}
                    <div className="flex items-center -space-x-2 shrink-0">
                      {items.slice(0, 3).map((item, itemIdx) => (
                        <div 
                          key={itemIdx}
                          className="relative w-11 h-11 rounded-xl bg-white border-2 border-neutral-50 overflow-hidden shadow-2xs shrink-0"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {item.qty > 1 && (
                            <span className="absolute bottom-0 right-0 bg-neutral-950 text-white text-[8px] font-mono px-1 rounded-tl-sm">
                              x{item.qty}
                            </span>
                          )}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="w-11 h-11 rounded-xl bg-neutral-200/80 border-2 border-neutral-50 flex items-center justify-center text-[10px] font-medium text-neutral-700 shrink-0">
                          +{items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Didascalia articoli */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-neutral-800 truncate">
                        {items[0]?.name || 'Articolo'}
                      </p>
                      <p className="text-[11px] text-neutral-400 font-light truncate mt-0.5">
                        {items.length > 1 ? `e altri ${items.length - 1} prodotti acquistati` : `Quantità: ${items[0]?.qty || 1} pz`}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  </div>
                </div>

                {/* Stato + Azioni Rapide Touch */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Selettore stato touch-friendly */}
                    <div className="relative">
                      <button 
                        type="button"
                        disabled={isLocked}
                        onClick={() => setOpenStatusPickerId(openStatusPickerId === order.id ? null : order.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLocked 
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60' 
                            : getStatusStyle(order.status)
                        }`}
                      >
                        {updatingOrderId === order.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          translateStatus(order.status)
                        )}
                        {!isLocked && <ChevronDown className="w-3 h-3 opacity-60" />}
                      </button>

                      {/* Dropdown status click-based per mobile */}
                      <AnimatePresence>
                        {openStatusPickerId === order.id && !isLocked && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenStatusPickerId(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 4 }}
                              className="absolute left-0 bottom-full mb-1.5 w-40 bg-white border border-neutral-200 rounded-xl shadow-xl z-40 p-1 space-y-0.5"
                            >
                              {['pending', 'shipped', 'delivered', 'refunded', 'cancelled'].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleStatusChange(order, s)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-light transition-colors cursor-pointer ${
                                    order.status === s ? 'bg-neutral-950 text-white font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                                  }`}
                                >
                                  {translateStatus(s)}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Pagato per bonifico */}
                    {isBankTransfer && (
                      <button
                        type="button"
                        onClick={() => togglePaidStatus(order.id)}
                        className={`min-h-[36px] px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1 ${
                          order.isPaid 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span>{order.isPaid ? 'Pagato' : 'In attesa'}</span>
                      </button>
                    )}
                  </div>

                  {/* Bottone Dettagli Touch Ampio */}
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className="min-h-[40px] px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-light text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Dettagli</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ELENCO ORDINI: VERSIONE DESKTOP TABLE CON ANTEPRIMA PRODOTTI */}
      <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200/80 text-neutral-500 text-[10px] uppercase tracking-wider font-medium">
              <th className="py-3.5 px-5">ID Ordine / Data</th>
              <th className="py-3.5 px-3">Canale</th>
              <th className="py-3.5 px-4">Cliente</th>
              <th className="py-3.5 px-4">Articoli Acquistati</th>
              <th className="py-3.5 px-4 text-right">Totale</th>
              <th className="py-3.5 px-3 text-center">Pagamento</th>
              <th className="py-3.5 px-4 text-center">Stato</th>
              <th className="py-3.5 px-5 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-400 text-xs font-light">
                  Nessun ordine trovato con i criteri selezionati.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isBankTransfer = order.payment?.toLowerCase().includes('bonifico') || order.paymentType === 'bank';
                const isLocked = isBankTransfer && !order.isPaid;
                const items = resolveOrderItems(order);

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-mono text-xs font-medium text-neutral-900">{order.id}</p>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">{order.date}</p>
                    </td>
                    <td className="py-4 px-3">
                      {getChannelBadge(order.channel)}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-medium text-neutral-900">{order.customer}</p>
                      <p className="text-[11px] text-neutral-400 font-light truncate max-w-[150px]">{order.email}</p>
                    </td>
                    {/* ANTEPRIMA MINIATURE PRODOTTI SU DESKTOP */}
                    <td className="py-4 px-4">
                      <div 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="flex items-center gap-2.5 cursor-pointer group/item-preview"
                        title="Vedi prodotti nel dettaglio"
                      >
                        <div className="flex items-center -space-x-2 shrink-0">
                          {items.slice(0, 3).map((item, itemIdx) => (
                            <div 
                              key={itemIdx} 
                              className="relative w-9 h-9 rounded-lg bg-neutral-100 border border-white overflow-hidden shadow-2xs shrink-0 group-hover/item-preview:scale-105 transition-transform"
                              title={`${item.name} (${item.qty} pz)`}
                            >
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {item.qty > 1 && (
                                <span className="absolute bottom-0 right-0 bg-neutral-950 text-white text-[7px] font-mono px-0.5 rounded-tl-sm">
                                  x{item.qty}
                                </span>
                              )}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-white flex items-center justify-center text-[9px] font-medium text-neutral-600 shrink-0">
                              +{items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[150px]">
                          <p className="text-xs font-light text-neutral-800 truncate group-hover/item-preview:text-neutral-950">
                            {items[0]?.name || 'Articolo'}
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            {items.length} {items.length > 1 ? 'articoli' : 'articolo'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm font-medium text-neutral-950">€{order.total.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-3 text-center">
                      {isBankTransfer ? (
                        <button
                          type="button"
                          onClick={() => togglePaidStatus(order.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border transition-colors cursor-pointer ${
                            order.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span>{order.isPaid ? 'PAGATO' : 'ATTESA'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {order.payment?.split(' ')[0] || 'Ok'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="relative inline-block">
                        <button 
                          type="button"
                          disabled={isLocked}
                          onClick={() => setOpenStatusPickerId(openStatusPickerId === order.id ? null : order.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isLocked ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60' : getStatusStyle(order.status)
                          }`}
                        >
                          {updatingOrderId === order.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            translateStatus(order.status)
                          )}
                          {!isLocked && <ChevronDown className="w-3 h-3 opacity-60" />}
                        </button>
                        <AnimatePresence>
                          {openStatusPickerId === order.id && !isLocked && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setOpenStatusPickerId(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-36 bg-white border border-neutral-200 rounded-xl shadow-xl z-40 p-1 space-y-0.5"
                              >
                                {['pending', 'shipped', 'delivered', 'refunded', 'cancelled'].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStatusChange(order, s)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-light transition-colors cursor-pointer ${
                                      order.status === s ? 'bg-neutral-950 text-white font-medium' : 'text-neutral-700 hover:bg-neutral-50'
                                    }`}
                                  >
                                    {translateStatus(s)}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Vedi dettaglio ordine"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Footer tabella */}
        <div className="py-3 px-5 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500 font-light">
          <span>Mostrati {filteredOrders.length} di {orders.length} ordini</span>
          <span className="text-neutral-400 text-[11px]">Sistema ordini sincronizzato</span>
        </div>
      </div>

      {/* MODAL INSERIMENTO TRACKING SPEDIZIONE */}
      <AnimatePresence>
        {trackingModalOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingModalOrder(null)}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-md bg-white rounded-2xl p-6 sm:p-7 z-[160] shadow-2xl border border-neutral-200/80 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.22em] text-neutral-950">
                    Spedizione Ordine
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    #{trackingModalOrder.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                    Corriere Assegnato
                  </label>
                  <select 
                    className={`${ADMIN_INPUT} cursor-pointer bg-white`}
                    value={tempCarrierId}
                    onChange={(e) => setTempCarrierId(e.target.value)}
                  >
                    {COURIERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 mb-1.5 block">
                    Codice Tracking
                  </label>
                  <input 
                    type="text" 
                    placeholder="Es: IT123456789"
                    className={ADMIN_INPUT}
                    value={tempTrackingId}
                    onChange={(e) => setTempTrackingId(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmShipping(); }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className={`${ADMIN_BTN_SECONDARY} rounded-xl`}
                >
                  Annulla
                </button>
                <button 
                  type="button"
                  onClick={confirmShipping}
                  className={`${ADMIN_BTN_PRIMARY} rounded-xl`}
                >
                  Conferma Spedizione
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DRAWER DETTAGLIO ORDINE CON PRODOTTI IN GRANDE & LIGHTBOX ZOOM */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedOrderId(null);
                onClearSelectedOrderId?.();
              }}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:max-w-xl md:max-w-2xl bg-white z-[110] border-l border-neutral-200/80 flex flex-col shadow-2xl"
            >
              {/* Header Drawer Pulito & Minimale */}
              <div className="p-4 sm:p-6 bg-white border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-base sm:text-lg font-medium text-neutral-950">
                      {selectedOrder.id}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${getStatusStyle(selectedOrder.status)}`}>
                      {translateStatus(selectedOrder.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                    Effettuato il {selectedOrder.date} · canale {selectedOrder.channel}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(null);
                    onClearSelectedOrderId?.();
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                  aria-label="Chiudi dettaglio ordine"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo Scrollabile del Drawer */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                
                {/* Schede Anagrafica e Spedizione */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50/70 border border-neutral-200/60 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block">
                      Cliente
                    </span>
                    <p className="text-sm font-medium text-neutral-900 leading-tight">
                      {selectedOrder.customer}
                    </p>
                    <p className="text-xs text-neutral-500 break-all font-light">
                      {selectedOrder.email}
                    </p>
                    {selectedOrder.phone && (
                      <p className="text-xs text-neutral-600 font-mono">
                        {selectedOrder.phone}
                      </p>
                    )}
                  </div>

                  <div className="bg-neutral-50/70 border border-neutral-200/60 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block">
                      Destinazione Spedizione
                    </span>
                    <p className="text-xs text-neutral-800 leading-relaxed font-light">
                      {selectedOrder.address || 'Indirizzo non disponibile'}
                    </p>
                    {selectedOrder.notes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/50 mt-1">
                        Note: {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tracking, Corriere e Peso */}
                <div className="bg-white border border-neutral-200/80 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block mb-1">
                        Tracking ID
                      </label>
                      <input 
                        type="text" 
                        value={selectedOrder.trackingId || ''} 
                        onChange={(e) => updateTrackingId(selectedOrder.id, e.target.value)}
                        placeholder="Nessun tracking"
                        className={ADMIN_INPUT}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block mb-1">
                        Corriere
                      </label>
                      <select
                        value={selectedOrder.carrierId || ''}
                        onChange={(e) => updateOrderCarrier(selectedOrder.id, e.target.value)}
                        className={`${ADMIN_INPUT} cursor-pointer bg-white`}
                      >
                        <option value="">Non assegnato</option>
                        {COURIERS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block mb-1">
                        Peso Totale
                      </label>
                      <div className="min-h-11 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm flex items-center">
                        {getOrderWeight(selectedOrder).toFixed(2)} kg
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagamento */}
                <div className="bg-neutral-50/70 border border-neutral-200/60 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 block">
                      Metodo Pagamento
                    </span>
                    <p className="text-xs font-medium text-neutral-900 mt-0.5">
                      {selectedOrder.payment || 'Non specificato'}
                    </p>
                  </div>
                  {isSelectedBankTransfer && (
                    <button
                      type="button"
                      onClick={() => togglePaidStatus(selectedOrder.id)}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-[10px] font-mono border transition-colors cursor-pointer ${
                        selectedOrder.isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {selectedOrder.isPaid ? 'Bonifico Ricevuto' : 'In attesa Bonifico'}
                    </button>
                  )}
                </div>

                {/* ARTICOLI ORDINE: VISIONE IN GRANDE & DETTAGLIATA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-light uppercase tracking-[0.2em] text-neutral-950">
                      Articoli Acquistati ({selectedOrderItems.length})
                    </h4>
                    <span className="text-sm font-medium text-neutral-950">
                      Totale: €{Number(selectedOrder.total).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-light">
                    Tocca o clicca su qualsiasi immagine per ingrandirla a schermo intero.
                  </p>

                  <div className="space-y-3">
                    {selectedOrderItems.length > 0 ? (
                      selectedOrderItems.map((item: any, idx: number) => {
                        const itemReturn = returnRequests.find(r => r.orderId === selectedOrder.id && (r.product?.id === item.id || r.productId === item.id));
                        return (
                          <div 
                            key={item.id || idx}
                            className="bg-white border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-neutral-300 transition-colors shadow-2xs"
                          >
                            {/* Immagine Grande con indicatore di Zoom */}
                            <div 
                              onClick={() => setZoomedProductImage({ url: item.image, name: item.name, price: item.price })}
                              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-50 border border-neutral-200/80 overflow-hidden shrink-0 cursor-pointer group shadow-2xs"
                              title="Tocca per ingrandire l'immagine"
                            >
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-neutral-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-5 h-5 text-white drop-shadow" />
                              </div>
                              <span className="absolute bottom-1 right-1 bg-neutral-950/80 text-white text-[9px] font-mono px-1 rounded">
                                HD
                              </span>
                            </div>

                            {/* Informazioni Articolo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="text-sm font-medium text-neutral-900 leading-snug">
                                    {item.name}
                                  </h5>
                                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                                    SKU: BP-{String(item.id).padStart(4, '0')}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-sm font-semibold text-neutral-950 block">
                                    €{(item.qty * item.price).toFixed(2)}
                                  </span>
                                  <span className="text-[11px] text-neutral-400 font-mono">
                                    {item.qty} × €{Number(item.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-neutral-100 text-xs">
                                <span className="text-[11px] text-neutral-500 font-light">
                                  Quantità: <strong className="text-neutral-900 font-medium">{item.qty} pz</strong>
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setZoomedProductImage({ url: item.image, name: item.name, price: item.price })}
                                    className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Vedi foto</span>
                                  </button>

                                  {itemReturn && (
                                    <button
                                      type="button"
                                      onClick={() => onViewReturn?.(itemReturn.id)}
                                      className="text-[10px] text-rose-600 font-medium hover:underline bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60"
                                    >
                                      Reso aperto
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400 font-light">
                        Nessun articolo dettagliato per questo ordine.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Drawer Fisso Touch-friendly */}
              <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200/80 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePrintSingleOrder(selectedOrder)}
                  className={`${ADMIN_BTN_SECONDARY} flex-1 rounded-xl min-h-[46px]`}
                >
                  <Printer className="w-4 h-4 text-neutral-500" />
                  <span>Stampa Riepilogo</span>
                </button>
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedOrder.status === 'shipped') {
                        updateOrderStatus(selectedOrder.id, 'delivered');
                      } else {
                        handleStatusChange(selectedOrder, 'shipped');
                      }
                    }}
                    disabled={isUpdatingStatus}
                    className={`${ADMIN_BTN_PRIMARY} flex-1 rounded-xl min-h-[46px]`}
                  >
                    {isUpdatingStatus ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{selectedOrder.status === 'shipped' ? 'Segna come Consegnato' : 'Segna come Spedito'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL ZOOM PRODOTTO AD ALTA RISOLUZIONE */}
      <AnimatePresence>
        {zoomedProductImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedProductImage(null)}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/80 flex flex-col"
            >
              <div className="p-4 bg-white border-b border-neutral-100 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm font-medium text-neutral-900 truncate">
                    {zoomedProductImage.name}
                  </h4>
                  {zoomedProductImage.price && (
                    <span className="text-xs text-neutral-500 font-mono">
                      Prezzo: €{Number(zoomedProductImage.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setZoomedProductImage(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                  aria-label="Chiudi zoom"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 sm:p-6 bg-neutral-50 flex items-center justify-center max-h-[75vh] overflow-hidden">
                <img
                  src={zoomedProductImage.url}
                  alt={zoomedProductImage.name}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
