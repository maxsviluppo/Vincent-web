import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  RefreshCw, 
  DollarSign, 
  Star, 
  ShieldCheck, 
  Activity,
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  X,
  ArrowUpRight,
  UserCheck,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from "@/components/admin/adminTouchTargets";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  totalReturns: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'vip';
  avatar?: string;
  notes?: string;
  history: { id: string, date: string, type: string, amount: number, status: string }[];
}

const MOCK_USERS: Customer[] = [
  {
    id: "USR-001",
    name: "Marco Rossi",
    email: "marco.rossi@example.com",
    phone: "+39 333 1234567",
    address: "Via Roma 12, 00100 Roma (RM)",
    joinDate: "12 Gen 2026",
    totalOrders: 15,
    totalSpent: 1250.40,
    totalReturns: 1,
    lastActive: "Oggi",
    status: "vip",
    avatar: "https://i.pravatar.cc/150?u=marco",
    notes: "Cliente fedele, preferisce spedizioni con GLS.",
    history: [
      { id: "BP-2026-881", date: "30 Mar 2026", type: "Ordine", amount: 124.50, status: "pending" },
      { id: "RET-9901", date: "31 Mar 2026", type: "Reso", amount: 12.90, status: "pending" },
      { id: "BP-2026-850", date: "15 Mar 2026", type: "Ordine", amount: 45.00, status: "completed" }
    ]
  },
  {
    id: "USR-002",
    name: "Giulia Bianchi",
    email: "giulia.b@email.it",
    phone: "+39 347 9876543",
    address: "Corso Milano 45, 20100 Milano (MI)",
    joinDate: "02 Feb 2026",
    totalOrders: 4,
    totalSpent: 340.00,
    totalReturns: 0,
    lastActive: "Ieri",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=giulia",
    history: [
      { id: "BP-2026-880", date: "30 Mar 2026", type: "Ordine", amount: 89.00, status: "completed" }
    ]
  }
];

export const AdminUsers = ({ onViewOrder, orders = [] }: { onViewOrder?: (orderId: string) => void, orders?: any[] }) => {
  const [users, setUsers] = useState<Customer[]>(() => {
    if (typeof window === 'undefined') return MOCK_USERS;
    const stored = localStorage.getItem('vincent_users');
    if (!stored) return MOCK_USERS;
    try {
      const parsed = JSON.parse(stored);
      const mappedStored = parsed.map((u: any, idx: number) => {
        if (MOCK_USERS.some(mu => mu.email.toLowerCase() === u.email.toLowerCase())) {
          return null;
        }
        const addressParts = [u.addressStreet, u.addressZip, u.addressCity, u.addressProvince].filter(Boolean);
        return {
          id: u.id || `USR-${100 + idx}`,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Cliente Registrato',
          email: u.email,
          phone: u.phone || '-',
          address: addressParts.join(', ') || '-',
          joinDate: u.joinDate || new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalOrders: u.totalOrders || 0,
          totalSpent: u.totalSpent || 0,
          totalReturns: u.totalReturns || 0,
          lastActive: u.lastActive || 'Oggi',
          status: u.status || 'active',
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(u.email)}`,
          history: u.history || [],
          notes: u.notes || 'Nuovo utente registrato via web.'
        } as Customer;
      }).filter(Boolean) as Customer[];
      
      return [...MOCK_USERS, ...mappedStored];
    } catch (e) {
      console.error("Error parsing stored users", e);
      return MOCK_USERS;
    }
  });

  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.status === filter;
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSpentSum = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const avgOrderValue = users.length > 0 ? (totalSpentSum / Math.max(1, users.reduce((acc, u) => acc + (u.totalOrders || 0), 0))) : 0;
  const vipCount = users.filter(u => u.status === 'vip').length;

  const handleExportCsv = () => {
    const headers = ["ID", "Nome", "Email", "Telefono", "Indirizzo", "Stato", "Spesa Totale", "Ordini", "Resi", "Data Iscrizione"];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.phone,
      `"${u.address.replace(/"/g, '""')}"`,
      u.status,
      u.totalSpent.toFixed(2),
      u.totalOrders,
      u.totalReturns,
      u.joinDate
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `utenti_vincent_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'vip': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> VIP
          </span>
        );
      case 'active': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Attivo
          </span>
        );
      case 'inactive': 
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-neutral-100 text-neutral-500 border border-neutral-200">
            Inattivo
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

  // Cronologia unificata per utente selezionato (unisce history interna e prop orders se corrispondenti)
  const getUserOrdersHistory = (user: Customer) => {
    const list = [...(user.history || [])];
    if (orders && orders.length > 0) {
      orders.forEach(o => {
        const orderEmail = (o.customerEmail || o.email || '').toLowerCase();
        if (orderEmail && orderEmail === user.email.toLowerCase() && !list.some(h => h.id === o.id)) {
          list.push({
            id: o.id,
            date: o.date ? new Date(o.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recente',
            type: 'Ordine',
            amount: Number(o.total || o.amount || 0),
            status: o.status || 'completed'
          });
        }
      });
    }
    return list;
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header coerente con le sezioni admin */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Archivio Utenti
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {users.length} clienti registrati · anagrafica, storico ordini e fidelizzazione
          </p>
        </div>
        <div>
          <button 
            type="button"
            onClick={handleExportCsv}
            className={`${ADMIN_BTN_SECONDARY} w-full sm:w-auto rounded-full`}
          >
            <Download className="w-4 h-4" />
            <span>Esporta CSV</span>
          </button>
        </div>
      </div>

      {/* Schede Statistiche Sintetiche */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Clienti Totali", val: users.length.toString(), sub: "Database store", icon: Users },
          { label: "Clienti VIP", val: vipCount.toString(), sub: "Top spender", icon: Star },
          { label: "Spesa Complessiva", val: `€${totalSpentSum.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: "Volume ordini", icon: TrendingUp },
          { label: "Carrello Medio", val: `€${avgOrderValue.toFixed(2)}`, sub: "Valore per ordine", icon: DollarSign },
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
            placeholder="Cerca per nome, email o telefono..." 
            className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Filtri pillola */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'vip', label: 'VIP' },
            { id: 'active', label: 'Attivi' },
            { id: 'inactive', label: 'Inattivi' }
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

      {/* Elenco Utenti: Vista Mobile a Card per Smartphone */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center text-neutral-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-light">Nessun utente trovato</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div 
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm active:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-neutral-950 truncate">{user.name}</h3>
                    <p className="text-[11px] font-light text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div>{getStatusBadge(user.status)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2.5 border-t border-neutral-100 text-center bg-neutral-50/50 rounded-xl px-2">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Spesa</span>
                  <span className="text-xs font-medium text-neutral-950">€{user.totalSpent.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Ordini</span>
                  <span className="text-xs font-medium text-neutral-950">{user.totalOrders}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Attività</span>
                  <span className="text-xs font-light text-neutral-700">{user.lastActive}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Iscritto: {user.joinDate}</span>
                <span className="text-neutral-950 font-medium inline-flex items-center gap-0.5">
                  Dettagli <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Elenco Utenti: Vista Desktop a Tabella */}
      <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-4 text-center">Stato</th>
                <th className="py-3.5 px-4 text-right">Spesa Totale</th>
                <th className="py-3.5 px-4 text-center">Ordini / Resi</th>
                <th className="py-3.5 px-4">Ultima Attività</th>
                <th className="py-3.5 px-6 text-right">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-light">
                    Nessun utente corrisponde ai criteri di ricerca
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-neutral-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-950 text-sm tracking-tight">{user.name}</p>
                          <p className="text-[11px] font-light text-neutral-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-neutral-950">
                      €{user.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-medium text-neutral-950">{user.totalOrders} ordini</span>
                        {user.totalReturns > 0 && (
                          <span className="text-[10px] text-rose-500 font-light">{user.totalReturns} resi</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-neutral-700 font-light">{user.lastActive}</p>
                      <p className="text-[10px] text-neutral-400 font-light">Iscritto: {user.joinDate}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="w-9 h-9 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-900 inline-flex items-center justify-center transition-colors"
                        title="Vedi Profilo e Storico"
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

      {/* Modal Responsive Dettaglio Cliente & Storico */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Modal */}
              <div className="p-5 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-neutral-950 uppercase tracking-tight">{selectedUser.name}</h3>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <p className="text-[11px] text-neutral-400 font-light mt-0.5">ID: {selectedUser.id} · Iscritto il {selectedUser.joinDate}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedUser(null)} 
                  className="w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo Scrollabile su Mobile e Desktop */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
                {/* Colonna Sinistra: Anagrafica e Spesa */}
                <div className="w-full md:w-72 shrink-0 space-y-5">
                  {/* Card Finanziaria Sintetica */}
                  <div className="bg-neutral-950 text-white p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-neutral-400 text-[10px] font-medium uppercase tracking-wider">
                      <span>Spesa Totale</span>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-light text-white tracking-tight">€{selectedUser.totalSpent.toFixed(2)}</p>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">su {selectedUser.totalOrders} ordini conclusi</p>
                    </div>
                  </div>

                  {/* Informazioni di Contatto */}
                  <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 space-y-3.5">
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Recapiti Cliente</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                        <a href={`mailto:${selectedUser.email}`} className="text-neutral-900 font-light hover:underline break-all">
                          {selectedUser.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-900 font-light">{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="text-neutral-900 font-light leading-relaxed">{selectedUser.address}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a 
                        href={`mailto:${selectedUser.email}?subject=Assistenza%20Vincent%20Store`}
                        className={`${ADMIN_BTN_SECONDARY} w-full text-center text-[10px]`}
                      >
                        Invia Email
                      </a>
                    </div>
                  </div>

                  {/* Note Amministrative */}
                  {selectedUser.notes && (
                    <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Note interne
                      </span>
                      <p className="text-neutral-700 font-light italic leading-relaxed">
                        "{selectedUser.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Colonna Destra: Storico Ordini & Timeline */}
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-neutral-500" />
                      <span>Cronologia Acquisti & Richieste</span>
                    </h4>
                    <span className="text-[10px] font-light text-neutral-400">
                      {getUserOrdersHistory(selectedUser).length} eventi registrati
                    </span>
                  </div>

                  <div className="space-y-3">
                    {getUserOrdersHistory(selectedUser).length === 0 ? (
                      <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-100 text-neutral-400 text-xs font-light">
                        Nessun ordine registrato nella cronologia di questo cliente.
                      </div>
                    ) : (
                      getUserOrdersHistory(selectedUser).map((h, i) => (
                        <div 
                          key={i}
                          className="p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              h.type === 'Ordine' ? 'bg-neutral-100 text-neutral-900' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {h.type === 'Ordine' ? <ShoppingBag className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-neutral-950 uppercase">{h.type}: {h.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${
                                  h.status === 'completed' || h.status === 'consegnato' 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {h.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 font-light flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" /> Registrato il {h.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                            <span className="text-sm font-medium text-neutral-950">€{h.amount.toFixed(2)}</span>
                            {h.type === 'Ordine' && onViewOrder && (
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedUser(null);
                                  onViewOrder(h.id);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-neutral-950 hover:underline min-h-[36px] px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                              >
                                <span>Vedi Ordine</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-4 sm:p-5 bg-neutral-50/50 border-t border-neutral-100 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className={`${ADMIN_BTN_SECONDARY} rounded-xl`}
                >
                  Chiudi Dettaglio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

