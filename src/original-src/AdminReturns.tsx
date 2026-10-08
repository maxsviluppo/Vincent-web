import React, { useState } from "react";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageCircle, 
  Truck, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Mail, 
  MapPin, 
  Package, 
  AlertTriangle, 
  Send,
  X,
  ArrowUpRight,
  RotateCcw,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from "@/components/admin/adminTouchTargets";

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  customerEmail: string;
  date: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  reason: string;
  details: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  resolution?: 'refund' | 'replacement' | 'coupon' | 'none';
  messages: { role: 'user' | 'admin', text: string, date: string }[];
  history: { status: string, date: string, note?: string }[];
  photos?: string[];
}

interface AdminReturnsProps {
  returns: ReturnRequest[];
  setReturns: React.Dispatch<React.SetStateAction<ReturnRequest[]>>;
  initialSelectedId?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'In Attesa',
  processing: 'In Lavorazione',
  approved: 'Approvato',
  rejected: 'Rifiutato',
  completed: 'Completato'
};

export const AdminReturns = ({ returns, setReturns, initialSelectedId }: AdminReturnsProps) => {
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);

  React.useEffect(() => {
    if (initialSelectedId) {
      const req = returns.find(r => r.id === initialSelectedId);
      if (req) {
        setSelectedRequest(req);
      }
    }
  }, [initialSelectedId, returns]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [adminMsg, setAdminMsg] = useState("");
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<string | null>(null);

  const filteredReturns = returns.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = 
      r.customer.toLowerCase().includes(search.toLowerCase()) || 
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = (id: string, status: ReturnRequest['status'], note?: string) => {
    const now = new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setReturns(prev => prev.map(r => r.id === id ? {
      ...r,
      status,
      history: [...r.history, { status: `Passato a: ${STATUS_LABELS[status]}`, date: now, note }]
    } : r));
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => prev ? {
        ...prev, 
        status, 
        history: [...prev.history, { status: `Passato a: ${STATUS_LABELS[status]}`, date: now, note }]
      } : null);
    }
  };

  const addMessage = (id: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setReturns(prev => prev.map(r => r.id === id ? {
      ...r,
      messages: [...r.messages, { role: 'admin', text, date: now }]
    } : r));
    if (selectedRequest?.id === id) {
      setSelectedRequest(prev => prev ? {
        ...prev, 
        messages: [...prev.messages, { role: 'admin', text, date: now }]
      } : null);
    }
    setAdminMsg("");
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            In Attesa
          </span>
        );
      case 'processing': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            In Lavorazione
          </span>
        );
      case 'approved': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approvato
          </span>
        );
      case 'rejected': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Rifiutato
          </span>
        );
      case 'completed': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
            Completato
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const processingCount = returns.filter(r => r.status === 'processing').length;
  const completedCount = returns.filter(r => r.status === 'completed' || r.status === 'approved').length;

  return (
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header coerente con le sezioni admin */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Resi & Rimborsi
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {returns.length} pratiche registrate · gestione rientri merce, sostituzioni e note di accredito
          </p>
        </div>
      </div>

      {/* Schede Statistiche Sintetiche (KPI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pratiche Totali", val: returns.length.toString(), sub: "Tutti i rientri", icon: RotateCcw },
          { label: "In Attesa", val: pendingCount.toString(), sub: "Da valutare", icon: Clock },
          { label: "In Lavorazione", val: processingCount.toString(), sub: "Presi in carico", icon: RefreshCw },
          { label: "Conclusi", val: completedCount.toString(), sub: "Risolti con successo", icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-light text-neutral-950 tracking-tight">{s.val}</p>
              <p className="text-[10px] text-neutral-400 font-light mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra Ricerca & Filtri */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cerca per ID Reso, Ordine o Cliente..." 
            className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Filtri pillola */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'pending', label: 'In Attesa' },
            { id: 'processing', label: 'In Lavorazione' },
            { id: 'approved', label: 'Approvati' },
            { id: 'rejected', label: 'Rifiutati' },
            { id: 'completed', label: 'Completati' }
          ].map(f => (
            <button 
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${
                filter === f.id 
                  ? 'bg-neutral-950 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elenco Resi: Vista Mobile a Card per Smartphone */}
      <div className="block md:hidden space-y-3">
        {filteredReturns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center text-neutral-400">
            <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-light">Nessuna pratica di reso trovata</p>
          </div>
        ) : (
          filteredReturns.map(req => (
            <div 
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm active:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-medium text-neutral-950 uppercase tracking-tight">{req.id}</span>
                  <p className="text-[10px] text-neutral-400 font-light mt-0.5">Ord: {req.orderId} · {req.date}</p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-neutral-50/70 rounded-xl mb-3 border border-neutral-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200/60">
                  <img src={req.product.image} alt={req.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-neutral-900 truncate">{req.product.name}</p>
                  <p className="text-[11px] text-neutral-500 font-light mt-0.5">€{req.product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                <div className="truncate pr-2">
                  <span className="text-neutral-400">Cliente:</span> <strong className="text-neutral-800 font-medium">{req.customer}</strong>
                </div>
                <span className="text-neutral-950 font-medium inline-flex items-center gap-0.5 shrink-0">
                  Dettagli <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Elenco Resi: Vista Desktop a Tabella */}
      <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                <th className="py-3.5 px-6">ID Reso / Data</th>
                <th className="py-3.5 px-4">Ordine</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Prodotto</th>
                <th className="py-3.5 px-4">Motivazione</th>
                <th className="py-3.5 px-4 text-center">Stato</th>
                <th className="py-3.5 px-6 text-right">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-light">
                    Nessuna richiesta di reso corrisponde ai filtri selezionati
                  </td>
                </tr>
              ) : (
                filteredReturns.map(req => (
                  <tr key={req.id} className="hover:bg-neutral-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="font-medium text-neutral-950 text-sm tracking-tight">{req.id}</p>
                      <p className="text-[10px] font-light text-neutral-400">{req.date}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-neutral-800">
                      {req.orderId}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-neutral-950">{req.customer}</p>
                      <p className="text-[11px] font-light text-neutral-400 truncate max-w-[140px]">{req.customerEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
                          <img src={req.product.image} alt={req.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-950 truncate max-w-[130px]">{req.product.name}</p>
                          <p className="text-[10px] text-neutral-400 font-light">€{req.product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium uppercase tracking-wider">
                        {req.reason}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="w-9 h-9 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-900 inline-flex items-center justify-center transition-colors"
                        title="Vedi Dettaglio Pratica"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Modal Responsive Dettaglio Pratica Reso */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-2xl h-full bg-white border-l border-neutral-200/80 shadow-2xl flex flex-col overflow-hidden text-neutral-950"
            >
              {/* Header Drawer */}
              <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-medium text-neutral-950 uppercase tracking-tight">{selectedRequest.id}</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                    Contestazione Ordine #{selectedRequest.orderId} · {selectedRequest.date}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedRequest(null)} 
                  className="w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo Drawer */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Sezione: Descrizione del Problema & Foto */}
                <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Motivo: {selectedRequest.reason}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-800 font-light leading-relaxed italic bg-white/80 p-3 rounded-xl border border-rose-100">
                    "{selectedRequest.details}"
                  </p>

                  {/* Foto allegate dal cliente */}
                  {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-2">Foto Allegate dal Cliente</span>
                      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                        {selectedRequest.photos.map((photo, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedZoomPhoto(photo)}
                            className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 shrink-0 cursor-pointer relative group bg-neutral-100 shadow-2xs"
                          >
                            <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sezione: Prodotto & Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prodotto */}
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Merce in Contestazione
                    </span>
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 border border-neutral-200/60 shrink-0">
                        <img src={selectedRequest.product.image} alt={selectedRequest.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-neutral-950 leading-tight">{selectedRequest.product.name}</p>
                        <p className="text-sm font-light text-neutral-900 mt-1">€{selectedRequest.product.price.toFixed(2)}</p>
                        <span className="text-[10px] text-neutral-400 font-light block">Cod. {selectedRequest.product.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Dati Cliente
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <p className="font-medium text-neutral-950">{selectedRequest.customer}</p>
                      <a href={`mailto:${selectedRequest.customerEmail}`} className="text-neutral-600 font-light block hover:underline truncate">
                        {selectedRequest.customerEmail}
                      </a>
                      <p className="text-[10px] text-neutral-400 font-light">Spedizione: Ordine #{selectedRequest.orderId}</p>
                    </div>
                  </div>
                </div>

                {/* Sezione: Centro Risoluzioni & Azioni Rapide */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block">Workflow & Risoluzioni Rapide</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      type="button"
                      onClick={() => updateStatus(selectedRequest.id, 'processing', "Prenotato ritiro corriere")}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-950 transition-colors text-left flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-950">Ritiro Merce</p>
                        <p className="text-[10px] text-neutral-400 font-light">Avvia ritiro corriere</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => updateStatus(selectedRequest.id, 'approved', "Autorizzato invio prodotto sostitutivo")}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-950 transition-colors text-left flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-950">Nuovo Invio</p>
                        <p className="text-[10px] text-neutral-400 font-light">Sostituzione merce</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => updateStatus(selectedRequest.id, 'approved', "Autorizzato accredito/rimborso")}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-950 transition-colors text-left flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-950">Rimborso</p>
                        <p className="text-[10px] text-neutral-400 font-light">Emetti rimborso spesa</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => updateStatus(selectedRequest.id, 'processing', "Emesso coupon di compensazione")}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-950 transition-colors text-left flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-950">Buono Sconto</p>
                        <p className="text-[10px] text-neutral-400 font-light">Coupon di compensazione</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sezione: Chat & Comunicazioni con il Cliente */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Comunicazioni Pratica
                  </span>

                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-3">
                    <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                      {selectedRequest.messages.length === 0 ? (
                        <p className="text-xs text-neutral-400 font-light text-center py-4">Nessun messaggio presente</p>
                      ) : (
                        selectedRequest.messages.map((m, i) => (
                          <div key={i} className={`flex flex-col ${m.role === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-xs font-light ${
                              m.role === 'admin' 
                                ? 'bg-neutral-950 text-white rounded-br-none' 
                                : 'bg-white text-neutral-900 border border-neutral-200/80 rounded-bl-none shadow-2xs'
                            }`}>
                              {m.text}
                            </div>
                            <span className="text-[9px] text-neutral-400 font-light mt-1 px-1">
                              {m.role === 'admin' ? 'Amministratore' : selectedRequest.customer} · {m.date}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Risposte Rapide */}
                    <div className="pt-2 border-t border-neutral-200/60 flex gap-1.5 overflow-x-auto no-scrollbar">
                      {["Inoltrato al magazzino", "Merce verificata e conforme", "In attesa di foto integrativa"].map(t => (
                        <button 
                          key={t}
                          type="button"
                          onClick={() => setAdminMsg(t)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-[10px] font-light text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 transition-colors whitespace-nowrap"
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Input Invio Messaggio */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Scrivi una risposta al cliente..."
                        value={adminMsg}
                        onChange={(e) => setAdminMsg(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMessage(selectedRequest.id, adminMsg);
                          }
                        }}
                        className={ADMIN_INPUT}
                      />
                      <button 
                        type="button"
                        onClick={() => addMessage(selectedRequest.id, adminMsg)}
                        disabled={!adminMsg.trim()}
                        className={`${ADMIN_BTN_PRIMARY} px-4 min-h-[48px] shrink-0 disabled:opacity-40`}
                        title="Invia Messaggio"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sezione: Log & Storico Pratica */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Cronologia Eventi
                  </span>
                  <div className="space-y-2 border-l-2 border-neutral-200 pl-3 ml-1.5">
                    {selectedRequest.history.slice().reverse().map((h, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-neutral-950">{h.status}</span>
                          <span className="text-[10px] text-neutral-400 font-light">{h.date}</span>
                        </div>
                        {h.note && <p className="text-[11px] text-neutral-500 font-light italic">"{h.note}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Drawer */}
              <div className="p-4 sm:p-5 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button 
                  type="button"
                  onClick={() => updateStatus(selectedRequest.id, 'rejected', "Richiesta respinta")}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rifiuta Reso</span>
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => updateStatus(selectedRequest.id, 'completed', "Pratica chiusa con successo")}
                    className={`${ADMIN_BTN_PRIMARY} flex-1 sm:flex-none min-h-[44px] text-xs`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Chiudi Pratica</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Foto Allegata */}
      <AnimatePresence>
        {selectedZoomPhoto && (
          <div 
            onClick={() => setSelectedZoomPhoto(null)}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800"
            >
              <img src={selectedZoomPhoto} alt="Ingrandimento difetto" className="w-full h-full object-contain" />
              <button 
                type="button"
                onClick={() => setSelectedZoomPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
