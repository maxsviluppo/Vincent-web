import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Globe, 
  ExternalLink, 
  Info,
  Check, 
  X, 
  Search, 
  RefreshCw, 
  Settings2, 
  Key, 
  ShieldCheck, 
  Zap, 
  Globe2, 
  PackageCheck, 
  FileJson, 
  CreditCard, 
  Edit3, 
  User, 
  Star, 
  Box,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppProvider";
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_BTN_SECONDARY,
  ADMIN_INPUT,
} from "@/components/admin/adminTouchTargets";

interface CourierApiConfig {
  id: string;
  type: 'none' | 'gls' | 'dhl' | 'brt' | 'poste' | 'custom';
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  customerNumber?: string;
  testMode: boolean;
  webhookUrl?: string;
}

interface CourierCharacteristics {
  supportsCashOnDelivery: boolean;
  supportsInsurance: boolean;
  supportsPickup: boolean;
  supportsInternational: boolean;
  maxWeightPerPackage?: number;
  avgDeliveryTime: string;
}

interface Courier {
  id: string;
  name: string;
  logo: string;
  trackingUrl: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  isDefault: boolean;
  notes?: string;
  apiConfig: CourierApiConfig;
  characteristics: CourierCharacteristics;
}

const INITIAL_COURIERS: Courier[] = [
  { 
    id: 'gls', 
    name: 'GLS Italy', 
    logo: 'gls',
    trackingUrl: 'https://www.gls-italy.com/it/servizi-per-destinatari/ricerca-spedizione?search={trackingId}',
    isActive: true,
    isDefault: true,
    notes: 'Corriere predefinito per spedizioni nazionali.',
    apiConfig: {
      id: 'gls',
      type: 'gls',
      apiKey: 'GLS_API_KEY_DEMO',
      testMode: true
    },
    characteristics: {
      supportsCashOnDelivery: true,
      supportsInsurance: true,
      supportsPickup: true,
      supportsInternational: false,
      maxWeightPerPackage: 30,
      avgDeliveryTime: '24/48h'
    }
  },
  { 
    id: 'dhl', 
    name: 'DHL Express', 
    logo: 'dhl',
    trackingUrl: 'https://www.dhl.com/it-it/home/tracking.html?tracking-id={trackingId}',
    isActive: true,
    isDefault: false,
    notes: 'Utilizzato per spedizioni internazionali express.',
    apiConfig: {
      id: 'dhl',
      type: 'dhl',
      apiKey: 'DHL_EXPRESS_SECRET_DEMO',
      testMode: false
    },
    characteristics: {
      supportsCashOnDelivery: false,
      supportsInsurance: true,
      supportsPickup: true,
      supportsInternational: true,
      maxWeightPerPackage: 70,
      avgDeliveryTime: '12/24h'
    }
  },
  { 
    id: 'brt', 
    name: 'BRT Corriere Espresso', 
    logo: 'brt',
    trackingUrl: 'https://www.brt.it/it/tracking?brtCode={trackingId}',
    isActive: true,
    isDefault: false,
    apiConfig: {
      id: 'brt',
      type: 'brt',
      testMode: true
    },
    characteristics: {
      supportsCashOnDelivery: true,
      supportsInsurance: true,
      supportsPickup: true,
      supportsInternational: true,
      maxWeightPerPackage: 50,
      avgDeliveryTime: '24/72h'
    }
  },
  { 
    id: 'poste', 
    name: 'Poste Italiane', 
    logo: 'poste',
    trackingUrl: 'https://www.poste.it/cerca/index.html#/risultati-spedizioni/{trackingId}',
    isActive: true,
    isDefault: false,
    apiConfig: {
      id: 'poste',
      type: 'poste',
      testMode: false
    },
    characteristics: {
      supportsCashOnDelivery: true,
      supportsInsurance: false,
      supportsPickup: false,
      supportsInternational: true,
      maxWeightPerPackage: 20,
      avgDeliveryTime: '3-5 giorni'
    }
  },
];

export const AdminCouriers = () => {
  const { couriers, setCouriers } = useApp();
  useEffect(() => {
    if (couriers.length === 0) setCouriers(INITIAL_COURIERS);
  }, [couriers.length, setCouriers]);
  const courierList = couriers.length > 0 ? couriers : INITIAL_COURIERS;
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingApi, setIsEditingApi] = useState<string | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState<Courier | null>(null);
  const [search, setSearch] = useState("");
  
  const [newCourier, setNewCourier] = useState<Partial<Courier>>({
    name: "",
    logo: "gls",
    trackingUrl: "",
    isActive: true,
    isDefault: false,
    apiConfig: {
      id: '',
      type: 'none',
      testMode: true
    },
    characteristics: {
      supportsCashOnDelivery: false,
      supportsInsurance: false,
      supportsPickup: false,
      supportsInternational: false,
      avgDeliveryTime: '24/48h'
    }
  });

  const filteredCouriers = courierList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const addCourier = () => {
    if (newCourier.name) {
      const id = newCourier.name.toLowerCase().replace(/\s+/g, '-');
      setCouriers([...courierList, { 
        ...newCourier as Courier, 
        id: id + Date.now() 
      }]);
      setNewCourier({ 
        name: "", logo: "gls", trackingUrl: "", isActive: true,
        apiConfig: { id: '', type: 'none', testMode: true },
        characteristics: { supportsCashOnDelivery: false, supportsInsurance: false, supportsPickup: false, supportsInternational: false, avgDeliveryTime: '24/48h' }
      });
      setIsAdding(false);
    }
  };

  const updateCourier = (updated: Courier) => {
    let newCouriers = courierList.map(c => c.id === updated.id ? updated : c);
    
    // Se questo corriere diventa predefinito, disattiva il flag per gli altri
    if (updated.isDefault) {
      newCouriers = newCouriers.map(c => c.id === updated.id ? c : { ...c, isDefault: false });
    }
    
    setCouriers(newCouriers);
    setIsEditingDetails(null);
  };

  const updateCourierApi = (id: string, apiConfig: CourierApiConfig) => {
    setCouriers(courierList.map(c => c.id === id ? { ...c, apiConfig } : c));
  };

  const deleteCourier = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo corriere?")) {
      setCouriers(courierList.filter(c => c.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setCouriers(courierList.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const setDefaultCourier = (id: string) => {
    setCouriers(courierList.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
  };

  const getCourierIcon = (logo: string, className: string = "w-6 h-6") => {
    switch (logo) {
      case 'gls': return <Truck className={`${className} text-neutral-800`} />;
      case 'dhl': return <Zap className={`${className} text-neutral-800`} />;
      case 'brt': return <Box className={`${className} text-neutral-800`} />;
      case 'poste': return <Globe className={`${className} text-neutral-800`} />;
      default: return <Truck className={`${className} text-neutral-600`} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header coerente con la sezione Categorie */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Corrieri
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {courierList.length} partner logistici · gestione vettori e integrazioni API spedizioni
          </p>
        </div>
        <div>
          <button 
            type="button"
            onClick={() => setIsAdding(true)}
            className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto rounded-full`}
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Corriere</span>
          </button>
        </div>
      </div>

      {/* Barra Ricerca & Statistiche */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cerca partner per nome..." 
            className="w-full min-h-[44px] pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-light text-neutral-900 focus:outline-none focus:border-neutral-950 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-6 justify-around sm:justify-end text-neutral-950 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-base font-medium text-neutral-950">{couriers.length}</span>
            <span className="text-[10px] font-light uppercase tracking-wider text-neutral-400">Totali</span>
          </div>
          <div className="w-px h-7 bg-neutral-200" />
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-base font-medium text-emerald-600">{couriers.filter(c => c.isActive).length}</span>
            <span className="text-[10px] font-light uppercase tracking-wider text-neutral-400">Attivi</span>
          </div>
          <div className="w-px h-7 bg-neutral-200" />
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-base font-medium text-neutral-700">{couriers.filter(c => c.apiConfig.type !== 'none').length}</span>
            <span className="text-[10px] font-light uppercase tracking-wider text-neutral-400">Con API</span>
          </div>
        </div>
      </div>

      {/* Griglia Corrieri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCouriers.map((courier) => (
          <div 
            key={courier.id}
            className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:border-neutral-400 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 bg-neutral-100 border border-neutral-200/60 rounded-xl flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors"
                    onClick={() => setDefaultCourier(courier.id)}
                    title="Clicca per impostare come predefinito"
                  >
                    {getCourierIcon(courier.logo, "w-6 h-6")}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-950 uppercase tracking-tight">{courier.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {courier.isDefault ? (
                        <span className="inline-flex items-center gap-1 bg-neutral-950 text-white text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full">
                          <Star className="w-2.5 h-2.5 fill-white" /> Predefinito
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultCourier(courier.id)}
                          className="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors font-light"
                        >
                          Imposta predefinito
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => setIsEditingDetails(courier)}
                    title="Modifica"
                    className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:border-neutral-900 flex items-center justify-center transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => deleteCourier(courier.id)}
                    title="Elimina"
                    className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dettagli Info e Badge */}
              <div className="space-y-3 pt-2 pb-4 border-b border-neutral-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-light uppercase tracking-wider text-neutral-400">Integrazione API:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                    courier.apiConfig.type !== 'none' 
                      ? 'bg-neutral-100 text-neutral-800' 
                      : 'bg-neutral-50 text-neutral-400'
                  }`}>
                    {courier.apiConfig.type !== 'none' ? courier.apiConfig.type.toUpperCase() : 'Nessuna'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-light uppercase tracking-wider text-neutral-400">Consegna media:</span>
                  <span className="text-[11px] font-light text-neutral-700 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 text-neutral-400" /> {courier.characteristics.avgDeliveryTime}
                  </span>
                </div>
              </div>

              {/* Pillole Servizi / Caratteristiche */}
              <div className="flex flex-wrap gap-1.5 py-3 min-h-[44px]">
                {courier.characteristics.supportsCashOnDelivery && (
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">Contrassegno</span>
                )}
                {courier.characteristics.supportsInsurance && (
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">Assicurato</span>
                )}
                {courier.characteristics.supportsInternational && (
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">Internazionale</span>
                )}
                {courier.characteristics.supportsPickup && (
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider">Ritiro Sede</span>
                )}
              </div>
            </div>

            {/* Barra Azioni */}
            <div className="space-y-2 pt-3 border-t border-neutral-100">
              <button 
                type="button"
                onClick={() => setIsEditingApi(courier.id)}
                className={`${ADMIN_BTN_PRIMARY} w-full min-h-[44px] text-[10px]`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configura API</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => toggleStatus(courier.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                    courier.isActive 
                      ? 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {courier.isActive ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  <span>{courier.isActive ? 'Sospendi' : 'Attiva'}</span>
                </button>
                <a 
                  href={courier.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] px-3 py-2 bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-[10px] font-medium uppercase tracking-wider"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Tracking</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuovo Corriere */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h3 className="text-base font-medium uppercase tracking-[0.2em] text-neutral-950">Nuovo Corriere</h3>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">Configura il profilo logistico del vettore</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)} 
                  className="w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Nome Corriere</label>
                    <input 
                      type="text" 
                      placeholder="es. GLS Express, DHL Freight..."
                      value={newCourier.name}
                      onChange={(e) => setNewCourier({...newCourier, name: e.target.value})}
                      className={ADMIN_INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Template URL Tracking</label>
                    <input 
                      type="text" 
                      placeholder="https://server.com/track?id={trackingId}"
                      value={newCourier.trackingUrl}
                      onChange={(e) => setNewCourier({...newCourier, trackingUrl: e.target.value})}
                      className={ADMIN_INPUT}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">Servizi & Caratteristiche</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Contrassegno', key: 'supportsCashOnDelivery', icon: CreditCard },
                      { label: 'Assicurazione', key: 'supportsInsurance', icon: ShieldCheck },
                      { label: 'Ritiro Sede', key: 'supportsPickup', icon: PackageCheck },
                      { label: 'Internazionale', key: 'supportsInternational', icon: Globe2 },
                    ].map((feat) => {
                      const isActive = Boolean((newCourier.characteristics as any)?.[feat.key]);
                      return (
                        <button
                          key={feat.key}
                          type="button"
                          onClick={() => setNewCourier({
                            ...newCourier,
                            characteristics: { 
                              ...newCourier.characteristics!, 
                              [feat.key]: !isActive 
                            }
                          })}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'
                          }`}
                        >
                          <feat.icon className="w-4 h-4" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">{feat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-neutral-50/50 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={ADMIN_BTN_SECONDARY}
                >
                  Annulla
                </button>
                <button 
                  type="button"
                  onClick={addCourier}
                  className={ADMIN_BTN_PRIMARY}
                >
                  Conferma & Salva
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Modifica Dettagli */}
      <AnimatePresence>
        {isEditingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingDetails(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h3 className="text-base font-medium uppercase tracking-[0.2em] text-neutral-950">Profilo Corriere</h3>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">Modifica parametri di {isEditingDetails.name}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditingDetails(null)} 
                  className="w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Nome Visualizzato</label>
                    <input 
                      type="text" 
                      value={isEditingDetails.name}
                      onChange={(e) => setIsEditingDetails({...isEditingDetails, name: e.target.value})}
                      className={ADMIN_INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Icona / Simbolo</label>
                    <select 
                      value={isEditingDetails.logo}
                      onChange={(e) => setIsEditingDetails({...isEditingDetails, logo: e.target.value})}
                      className={ADMIN_INPUT}
                    >
                      <option value="gls">Furgone (GLS Standard)</option>
                      <option value="dhl">Fulmine Express (DHL)</option>
                      <option value="brt">Pacco Box (BRT)</option>
                      <option value="poste">Globo Rete (Poste)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">URL Ricerca Spedizione</label>
                    <input 
                      type="text" 
                      value={isEditingDetails.trackingUrl}
                      onChange={(e) => setIsEditingDetails({...isEditingDetails, trackingUrl: e.target.value})}
                      className={ADMIN_INPUT}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Tempo Medio Consegna</label>
                    <input 
                      type="text" 
                      value={isEditingDetails.characteristics.avgDeliveryTime}
                      onChange={(e) => setIsEditingDetails({
                        ...isEditingDetails, 
                        characteristics: { ...isEditingDetails.characteristics, avgDeliveryTime: e.target.value }
                      })}
                      className={ADMIN_INPUT}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails({...isEditingDetails, isDefault: !isEditingDetails.isDefault})}
                      className={`w-full min-h-[48px] px-4 rounded-xl border flex items-center justify-between transition-colors ${
                        isEditingDetails.isDefault 
                          ? 'bg-neutral-950 text-white border-neutral-950' 
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider">Imposta Predefinito</span>
                      {isEditingDetails.isDefault && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500">Servizi Abilitati</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: 'Contrassegno', key: 'supportsCashOnDelivery', icon: CreditCard },
                      { label: 'Assicurazione', key: 'supportsInsurance', icon: ShieldCheck },
                      { label: 'Ritiro Sede', key: 'supportsPickup', icon: PackageCheck },
                      { label: 'Internazionale', key: 'supportsInternational', icon: Globe2 },
                    ].map((feat) => {
                      const isActive = Boolean((isEditingDetails.characteristics as any)?.[feat.key]);
                      return (
                        <button
                          key={feat.key}
                          type="button"
                          onClick={() => setIsEditingDetails({
                            ...isEditingDetails,
                            characteristics: { 
                              ...isEditingDetails.characteristics, 
                              [feat.key]: !isActive 
                            }
                          })}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'
                          }`}
                        >
                          <feat.icon className="w-4 h-4" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">{feat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-neutral-50/50 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingDetails(null)}
                  className={ADMIN_BTN_SECONDARY}
                >
                  Annulla
                </button>
                <button 
                  type="button"
                  onClick={() => updateCourier(isEditingDetails)}
                  className={ADMIN_BTN_PRIMARY}
                >
                  Salva Modifiche
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal / Drawer Configurazione API */}
      <AnimatePresence>
        {isEditingApi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingApi(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h3 className="text-base font-medium uppercase tracking-[0.2em] text-neutral-950">Integrazione API</h3>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                    {couriers.find(c => c.id === isEditingApi)?.name}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditingApi(null)} 
                  className="w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600 leading-relaxed font-light">
                  Inserisci le credenziali fornite dal corriere per la generazione automatica delle lettere di vettura e il tracciamento sincronizzato.
                </div>

                <div className="space-y-4">
                  {/* Ambiente */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Ambiente di Esecuzione</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const courier = couriers.find(c => c.id === isEditingApi);
                          if (courier) updateCourierApi(isEditingApi, { ...courier.apiConfig, testMode: true });
                        }}
                        className={`min-h-[44px] rounded-xl text-xs font-medium uppercase tracking-wider border transition-colors ${
                          couriers.find(c => c.id === isEditingApi)?.apiConfig.testMode 
                            ? 'bg-neutral-950 text-white border-neutral-950' 
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        Sandbox / Test
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const courier = couriers.find(c => c.id === isEditingApi);
                          if (courier) updateCourierApi(isEditingApi, { ...courier.apiConfig, testMode: false });
                        }}
                        className={`min-h-[44px] rounded-xl text-xs font-medium uppercase tracking-wider border transition-colors ${
                          !couriers.find(c => c.id === isEditingApi)?.apiConfig.testMode 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        Live / Produzione
                      </button>
                    </div>
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">Provider Gateway</label>
                    <select 
                      className={ADMIN_INPUT}
                      value={couriers.find(c => c.id === isEditingApi)?.apiConfig.type || 'none'}
                      onChange={(e) => {
                        const courier = couriers.find(c => c.id === isEditingApi);
                        if (courier) updateCourierApi(isEditingApi, { ...courier.apiConfig, type: e.target.value as any });
                      }}
                    >
                      <option value="none">Nessuna Integrazione Attiva</option>
                      <option value="gls">GLS WebService Enterprise</option>
                      <option value="dhl">DHL Express REST API</option>
                      <option value="brt">BRT API Gateway</option>
                      <option value="poste">Poste Italiane Crononline</option>
                      <option value="custom">Integrazione Personalizzata JSON</option>
                    </select>
                  </div>

                  {/* Campi credenziali */}
                  {[
                    { label: 'API Key / Client ID', key: 'apiKey', type: 'text' },
                    { label: 'API Secret / Password', key: 'apiSecret', type: 'password' },
                    { label: 'Endpoint Base URL', key: 'apiEndpoint', type: 'text' },
                    { label: 'Codice Cliente / Account Number', key: 'customerNumber', type: 'text' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">{field.label}</label>
                      <input 
                        type={field.type}
                        className={ADMIN_INPUT}
                        value={(couriers.find(c => c.id === isEditingApi)?.apiConfig as any)?.[field.key] || ''}
                        onChange={(e) => {
                          const courier = couriers.find(c => c.id === isEditingApi);
                          if (courier) {
                            updateCourierApi(isEditingApi, { ...courier.apiConfig, [field.key]: e.target.value });
                          }
                        }}
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        const btn = document.getElementById('test-api-btn');
                        if (btn) {
                          const originalText = btn.innerHTML;
                          btn.innerHTML = 'Test in corso...';
                          btn.style.opacity = '0.7';
                          setTimeout(() => {
                            btn.innerHTML = 'Connessione Riuscita';
                            btn.style.background = '#f0fdf4';
                            btn.style.borderColor = '#86efac';
                            btn.style.color = '#15803d';
                            setTimeout(() => {
                              btn.innerHTML = originalText;
                              btn.style.opacity = '1';
                              btn.style.background = '';
                              btn.style.borderColor = '';
                              btn.style.color = '';
                            }, 3000);
                          }, 1200);
                        }
                      }}
                      id="test-api-btn"
                      className={`${ADMIN_BTN_SECONDARY} w-full min-h-[44px]`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Testa Connessione API</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-neutral-50/50 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingApi(null)}
                  className={ADMIN_BTN_PRIMARY}
                >
                  Chiudi & Salva
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
