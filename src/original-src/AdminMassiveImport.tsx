import React, { useState, useRef, useMemo } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, Check, X, ArrowRight, AlertCircle, Table, ChevronLeft, Layers, Edit2, Info, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminSingleProduct } from "./AdminSingleProduct";
import { Product } from "./types";
import { toProperCase } from "./utils";

type ImportStep = 'upload' | 'mapping' | 'preview' | 'success';

interface FieldMapping {
  internal: string;
  label: string;
  required: boolean;
  fileColumn: string;
}

// Preset BesPoint Listino — mappatura completa con tutte le immagini del CSV
const BESPOINT_PRESET: FieldMapping[] = [
  { internal: 'sku',         label: 'Codice SKU (Master)',       required: true,  fileColumn: 'v_products_model' },
  { internal: 'ean',         label: 'Codice EAN/Barcode',        required: false, fileColumn: 'v_products_model_stock_ean' },
  { internal: 'brand',       label: 'Marca / Produttore',        required: false, fileColumn: 'v_manufacturers_name' },
  { internal: 'name',        label: 'Nome Prodotto',             required: true,  fileColumn: 'v_products_name_4' },
  { internal: 'description', label: 'Descrizione (HTML/Text)',   required: false, fileColumn: 'v_products_description_4' },
  { internal: 'category',    label: 'Categoria (Root)',          required: true,  fileColumn: 'v_categories_name_1_4' },
  { internal: 'subcategory', label: 'Sottocategoria (Sub)',       required: false, fileColumn: 'v_categories_name_2_4' },
  { internal: 'price',       label: 'Prezzo Vendita (B2C)',       required: true,  fileColumn: 'v_products_price' },
  { internal: 'stock',       label: 'Giacenza Totale (Master)',   required: false, fileColumn: 'v_stock_quantity' },
  { internal: 'weight',      label: 'Peso Prodotto (Kg)',         required: false, fileColumn: 'v_products_weight' },
  // Immagine principale
  { internal: 'image',       label: 'Immagine Principale',        required: false, fileColumn: 'v_products_image' },
  // Galleria: 6 slot subimage del listino BesPoint (https://www.beselettronica.com/userfiles/<filename>)
  { internal: 'gallery_1',   label: 'Galleria — Foto 1',         required: false, fileColumn: 'v_products_subimage1' },
  { internal: 'gallery_2',   label: 'Galleria — Foto 2',         required: false, fileColumn: 'v_products_subimage2' },
  { internal: 'gallery_3',   label: 'Galleria — Foto 3',         required: false, fileColumn: 'v_products_subimage3' },
  { internal: 'gallery_4',   label: 'Galleria — Foto 4',         required: false, fileColumn: 'v_products_subimage4' },
  { internal: 'gallery_5',   label: 'Galleria — Foto 5',         required: false, fileColumn: 'v_products_subimage5' },
  { internal: 'gallery_6',   label: 'Galleria — Foto 6',         required: false, fileColumn: 'v_products_subimage6' },
];


export const AdminMassiveImport = ({ 
  onBack, 
  products, 
  setProducts,
  pageSettings,
  setPageSettings
}: { 
  onBack: () => void,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  pageSettings: any,
  setPageSettings: React.Dispatch<React.SetStateAction<any>>
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fullCsvData, setFullCsvData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mappings, setMappings] = useState<FieldMapping[]>(BESPOINT_PRESET);

  
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [duplicateSkus, setDuplicateSkus] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importMode, setImportMode] = useState<'integrate' | 'replace'>('integrate');
  
  const [savedMappings, setSavedMappings] = useState<Record<string, FieldMapping[]>>(() => {
    const saved = localStorage.getItem('bespoint_import_presets');
    const base = saved ? JSON.parse(saved) : {};
    // Inietta sempre il preset BesPoint aggiornato
    return { ...base, 'BesPoint Listino': BESPOINT_PRESET };
  });
  const [newMappingName, setNewMappingName] = useState("");
  
  const addGalleryField = () => {
    const galleryFields = mappings.filter(m => String(m.internal).startsWith('gallery_'));
    const nextIndex = galleryFields.length + 1;
    setMappings(prev => [
      ...prev,
      { internal: `gallery_${nextIndex}`, label: `Nuovo Campo ${nextIndex}`, required: false, fileColumn: '' }
    ]);
  };

  const handleLabelChange = (internal: string, newLabel: string) => {
    setMappings(prev => prev.map(m => m.internal === internal ? { ...m, label: newLabel } : m));
  };

  const removeMappingField = (internal: string) => {
    setMappings(prev => prev.filter(m => m.internal !== internal));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setIsLoading(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const headers = results?.meta?.fields || [];
            const data = Array.isArray(results?.data) ? results.data : [];
            setFileHeaders(headers);
            setFullCsvData(data);
            setStep('mapping');
          } catch (innerErr) {
            console.error("Error processing CSV results:", innerErr);
            alert("Errore nell'elaborazione del CSV. Verifica il formato del file.");
          } finally {
            setIsLoading(false);
          }
        },
        error: (error) => {
          console.error("CSV Parsing error:", error);
          setIsLoading(false);
          alert("Errore nel caricamento del file CSV. Assicurati che sia un formato valido.");
        }
      });
    } catch (err) {
      console.error("Unexpected error during file upload:", err);
      setIsLoading(false);
      alert("Errore inaspettato durante il caricamento. Riprova.");
    }
  };

  const handleMappingChange = (internal: string, column: string) => {
    setMappings(prev => prev.map(m => m.internal === internal ? { ...m, fileColumn: column } : m));
  };

  const saveMappingPreset = () => {
    if (!newMappingName.trim()) return;
    const updated = { ...savedMappings, [newMappingName]: mappings };
    setSavedMappings(updated);
    localStorage.setItem('bespoint_import_presets', JSON.stringify(updated));
    setNewMappingName("");
  };

  const loadMappingPreset = (name: string) => {
    if (savedMappings[name]) {
      setMappings(savedMappings[name]);
    }
  };

  const startPreview = () => {
    setIsLoading(true);
    
    try {
      // Process real data using mappings
      const currentSkus = (products || []).map(p => String(p.sku || '').toUpperCase()).filter(Boolean);
      const IMAGE_BASE_URL = "https://www.beselettronica.com/userfiles/";

      const processed = (fullCsvData || []).map(row => {
        if (!row) return null;
        const item: any = { gallery: [] }; 
        
        mappings.forEach(m => {
          if (m.fileColumn && row[m.fileColumn] !== undefined && row[m.fileColumn] !== null) {
            const rawValue = row[m.fileColumn];
            const stringValue = String(rawValue).trim();
            
            // Data sanitization and transformation
            if (m.internal === 'price') {
              item[m.internal] = parseFloat(stringValue.replace(',', '.')) || 0;
            } else if (m.internal === 'stock') {
              item[m.internal] = parseInt(stringValue, 10) || 0;
            } else if (m.internal === 'image') {
              item[m.internal] = (stringValue && !stringValue.startsWith('http')) 
                ? IMAGE_BASE_URL + stringValue 
                : stringValue;
            } else if (m.internal === 'gallery' && stringValue) {
              const files = stringValue.split(',').map(f => f.trim()).filter(Boolean);
              const processedFiles = files.map(f => f.startsWith('http') ? f : IMAGE_BASE_URL + f);
              item.gallery = [...(item.gallery || []), ...processedFiles];
            } else if (m.internal.startsWith('gallery_') && stringValue) {
              const imageUrl = stringValue.startsWith('http') ? stringValue : IMAGE_BASE_URL + stringValue;
              item.gallery = [...(item.gallery || []), imageUrl];
            } else if (m.internal === 'name') {
              item[m.internal] = toProperCase(stringValue);
            } else {
              item[m.internal] = rawValue;
            }
          } else {
            // Ensure gallery is always an array even if not mapped/empty
            if (m.internal === 'gallery' && !item.gallery) item.gallery = [];
          }
        });

        // Skip rows without SKU
        if (!item.sku) return null;

        const itemSku = String(item.sku).toUpperCase();
        const isDuplicate = currentSkus.includes(itemSku);
        
        return { 
          ...item, 
          status: isDuplicate ? 'duplicate' : 'ready',
          isNew: !isDuplicate
        };
      }).filter((item): item is any => item !== null && item !== undefined); 

      setPreviewData(processed);
      setDuplicateSkus(processed.filter(p => p && p.status === 'duplicate').map(p => p.sku));
      
      // Auto-select only NEW products by default
      setSelectedRows(processed.map((p, i) => (p && p.isNew) ? i : -1).filter(i => i !== -1));
      setStep('preview');
    } catch (error) {
      console.error("Critical error during CSV processing:", error);
      alert("Si è verificato un errore durante l'elaborazione del listino. Verifica che il file non sia corrotto.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedRows(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectedRows.length === previewData.length ? [] : previewData.map((_, i) => i));
  };

  const finalizeImport = () => {
    setIsFinalizing(true);
    
    setTimeout(() => {
      const selectedProducts = previewData.filter((_, i) => selectedRows.includes(i));
      
      // 1. Identify New Categories
      const importedCategories = Array.from(new Set(selectedProducts.map(p => p.category as string)));
      const newCategories = importedCategories.filter(cat => !pageSettings.categories.includes(cat)) as string[];
      
      if (newCategories.length > 0) {
        setPageSettings((prev: any) => {
          const nextSub: Record<string, any> = { ...prev.subcategories };
          const nextBanners: Record<string, any> = { ...prev.categoryBanners };
          const nextSeo: Record<string, any> = { ...prev.categorySeo };

          newCategories.forEach(cat => {
            if (cat) {
              nextSub[cat] = [];
              nextBanners[cat] = { url: `https://picsum.photos/seed/${cat.toLowerCase()}/1920/600`, alt: cat, title: cat, link: "" };
              nextSeo[cat] = { metaTitle: `${cat} di Alta Qualità - BesPoint`, metaDescription: `Scopri la nostra selezione esclusiva di ${cat}.` };
            }
          });

          return {
            ...prev,
            categories: [...prev.categories, ...newCategories],
            subcategories: nextSub,
            categoryBanners: nextBanners,
            categorySeo: nextSeo
          };
        });
      }

      // 2. Map imported data to Product type
      const newProducts = selectedProducts.map(p => ({
        id: (products.length + Math.floor(Math.random() * 10000)).toString(),
        sku: p.sku || "",
        ean: p.ean || "",
        brand: p.brand || "",
        name: p.name || "Prodotto Senza Nome",
        category: p.category || "Generale",
        subcategory: p.subcategory || "Tutti",
        price: Number(p.price) || 0,
        cost: Number(p.cost) || (Number(p.price) * 0.7) || 0,
        markup: 30,
        stock: Number(p.stock) || 0,
        weight: typeof p.weight === 'string' ? parseFloat(p.weight) : (Number(p.weight) || 0),
        image: p.image || "https://picsum.photos/seed/" + (p.sku || Math.random()) + "/800/800",
        description: p.description || "",
        rating: 4.5,
        reviews: 0,
        isFeatured: false,
        isNew: true,
        isSpecialPromotion: false,
        amazonActive: true,
        ebayActive: true,
        amazonStock: 0,
        ebayStock: 0,
        amazonMarkup: 15,
        ebayMarkup: 12,
        vinceCommission: 10,
        relatedProductIds: [],
        specs: {},
        gallery: Array.isArray(p.gallery) ? p.gallery : (p.gallery ? (typeof p.gallery === 'string' ? p.gallery.split(',').map((u: string) => u.trim()).filter(Boolean) : []) : []),
        galleryIdx: 0,
        variants: [],
        courier: "GLS Italy"
      } as Product));

      // 3. Update products state
      setProducts(prev => {
        const baseProducts = importMode === 'replace' ? [] : prev;
        return [...baseProducts, ...newProducts as Product[]];
      });
      
      setIsFinalizing(false);
      setShowConfirmModal(false);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-xl space-y-10 animate-in slide-in-from-bottom-8 duration-500 relative min-h-[500px]">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2.5rem]">
          <div className="w-16 h-16 bg-brand-yellow/20 text-brand-yellow rounded-2xl flex items-center justify-center animate-bounce mb-4">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="font-black text-brand-dark uppercase tracking-widest text-xs animate-pulse">Analisi dati in corso...</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-1">Importazione Massiva</h2>
          <p className="text-sm font-bold text-gray-400">Analisi catalogo e sincronizzazione intelligente.</p>
        </div>
        <button onClick={onBack} className="p-3 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto py-4">
        {[
          { id: 'upload', icon: Upload, label: 'Carica' },
          { id: 'mapping', icon: Layers, label: 'Mappa' },
          { id: 'preview', icon: Table, label: 'Verifica' },
          { id: 'success', icon: Check, label: 'Fine' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center gap-1 ${step === s.id ? 'text-brand-yellow saturate-150' : 'text-gray-300'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step === s.id ? 'bg-brand-dark shadow-lg ring-4 ring-brand-yellow/20 translate-y-[-2px]' : 'bg-gray-100'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className={`h-[2px] flex-1 min-w-[30px] rounded-full transition-all ${arr.indexOf(arr.find(x => x.id === step)!) > i ? 'bg-brand-yellow' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* CONTENT: Upload Phase */}
      {step === 'upload' && (
        <div className="max-w-3xl mx-auto">
          <label className="group relative flex flex-col items-center justify-center w-full h-[400px] border-4 border-dashed border-gray-100 rounded-[3rem] hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all cursor-pointer overflow-hidden p-12 text-center">
            <input type="file" className="hidden" accept=".csv,.xls,.xlsx,.txt" onChange={handleFileUpload} />
            <div className="w-24 h-24 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Seleziona Listino CSV</h3>
            <p className="text-gray-400 font-bold max-w-sm mb-8">Importa il file `listino.csv` per analizzare i nuovi prodotti e aggiornare le giacenze.</p>
            <div className="flex gap-4">
               <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest">v_products_model</span>
               <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest">Mappatura Core</span>
            </div>
          </label>
        </div>
      )}

      {/* CONTENT: Mapping Phase */}
      {step === 'mapping' && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-50">
              <div className="border-l-4 border-brand-yellow pl-4">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tighter">Associa Colonne del File</h3>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Collega i campi del tuo file CSV alle proprietà del catalogo</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-1">
                   <span className="text-[8px] font-black uppercase text-gray-400 ml-1">Carica Preset Fornitore</span>
                   <select 
                     onChange={e => loadMappingPreset(e.target.value)}
                     className="bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-blue"
                   >
                     <option value="">Seleziona Mappatura...</option>
                     {Object.keys(savedMappings).map(name => <option key={name} value={name}>{name}</option>)}
                   </select>
                </div>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={newMappingName}
                     onChange={e => setNewMappingName(e.target.value)}
                     placeholder="Nome Mappatura (es. Esprinet)" 
                     className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:bg-white" 
                   />
                   <button 
                     onClick={saveMappingPreset}
                     disabled={!newMappingName}
                     className="bg-brand-blue text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark disabled:opacity-30 transition-all"
                   >
                     Salva Preset
                   </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {mappings.map((m) => (
                <div key={m.internal} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center group/map">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${m.required ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-300'}`} />
                    {String(m.internal).startsWith('gallery_') ? (
                      <input 
                        type="text" 
                        value={m.label}
                        onChange={(e) => handleLabelChange(m.internal, e.target.value)}
                        className="text-[10px] font-black text-brand-dark uppercase tracking-widest bg-transparent border-b border-dashed border-gray-300 focus:border-brand-yellow outline-none px-1 w-32"
                      />
                    ) : (
                      <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest leading-none">{m.label}</span>
                    )}
                    {String(m.internal).startsWith('gallery_') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMappingField(m.internal); }}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/map:opacity-100 transition-all focus:opacity-100"
                        title="Rimuovi questo campo"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <select 
                    value={m.fileColumn}
                    onChange={(e) => handleMappingChange(m.internal, e.target.value)}
                    className={`w-full bg-white rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-tight transition-all focus:ring-4 focus:ring-brand-yellow/20 ${m.fileColumn ? 'border-brand-yellow text-brand-dark' : 'border-gray-100 text-gray-400'}`}
                  >
                    <option value="">-- Ignora Campo --</option>
                    {(fileHeaders || []).map((h, hi) => <option key={`${h}-${hi}`} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
               <button 
                 type="button"
                 onClick={addGalleryField}
                 className="flex items-center gap-2 px-6 py-4 bg-brand-yellow/10 text-brand-yellow border-2 border-dashed border-brand-yellow/30 rounded-[2rem] hover:bg-brand-yellow/20 hover:border-brand-yellow/50 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm"
               >
                 <Plus className="w-4 h-4" /> Aggiungi Campo Galleria
               </button>
            </div>
            
            <div className="pt-8 flex justify-end border-t border-gray-50">
              <button 
                disabled={mappings.filter(m => m.required && !m.fileColumn).length > 0}
                onClick={startPreview}
                className="group bg-brand-dark text-brand-yellow px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.05]"
              >
                Avvia Analisi Catalogo <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Review Queue Phase */}
      {step === 'preview' && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
           {editingIndex !== null ? (
              <div className="animate-in zoom-in-95 duration-300 ring-4 ring-brand-yellow/30 rounded-[3rem] overflow-hidden shadow-2xl relative">
                <div className="bg-brand-dark p-6 flex justify-between items-center sticky top-0 z-50">
                   <h4 className="text-white font-black uppercase text-xs tracking-widest px-4">Modifica manuale riga: {previewData[editingIndex].sku}</h4>
                   <button onClick={() => setEditingIndex(null)} className="bg-white/10 hover:bg-white/20 text-brand-yellow px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase border border-brand-yellow/20"><X className="w-4 h-4"/> Esci e Salva</button>
                </div>
                <div className="p-8 bg-white max-h-[70vh] overflow-y-auto">
                   <AdminSingleProduct 
                     onBack={() => setEditingIndex(null)} 
                     initialData={previewData[editingIndex]} 
                     onSave={(updated) => {
                       setPreviewData(prev => prev.map((item, idx) => idx === editingIndex ? { ...updated, status: item.status, isNew: item.isNew } : item));
                       setEditingIndex(null);
                     }}
                   />
                </div>
              </div>
           ) : (
            <>
              <div className="flex items-center justify-between">
                  <button onClick={() => setStep('mapping')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase hover:text-brand-dark transition-colors bg-gray-100 px-4 py-2 rounded-xl">
                    <ChevronLeft className="w-4 h-4" /> Torna a Mappatura
                  </button>
                  <div className="flex gap-4 items-center">
                    <div className="px-5 py-3 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20 flex flex-col items-center">
                       <span className="text-[8px] font-black uppercase text-brand-orange tracking-widest">Prodotti Nuovi</span>
                       <span className="text-xl font-black text-brand-dark">{previewData.filter(p => p.isNew).length}</span>
                    </div>
                    <div className="px-5 py-3 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center opacity-60">
                       <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Duplicati Rilevati</span>
                       <span className="text-xl font-black text-gray-500">{duplicateSkus.length}</span>
                    </div>
                  </div>
              </div>

              <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 text-brand-blue" />
                     Report Analisi Importazione
                   </h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Seleziona i prodotti da aggiungere al catalogo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                          <th className="p-6 w-10">
                            <input type="checkbox" checked={selectedRows.length === previewData.length} onChange={toggleSelectAll} className="w-4 h-4 rounded-lg border-gray-300 text-brand-yellow focus:ring-brand-yellow" />
                          </th>
                          <th className="p-6">Prodotto / Marca</th>
                          <th className="p-6">Categoria</th>
                          <th className="p-6">Prezzo / Peso</th>
                          <th className="p-6">Stock</th>
                          <th className="p-6 text-center">Stato</th>
                          <th className="p-6 text-right">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewData.map((row, i) => (
                          <tr key={i} className={`hover:bg-brand-yellow/5 transition-all group ${selectedRows.includes(i) ? 'bg-brand-yellow/10' : ''}`}>
                            <td className="p-6">
                              <input type="checkbox" checked={selectedRows.includes(i)} onChange={() => toggleSelect(i)} className="w-4 h-4 rounded-lg border-gray-300 text-brand-yellow focus:ring-brand-yellow" />
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase text-brand-blue tracking-widest">{row.brand || '---'}</span>
                                 <span className="text-sm font-black text-brand-dark tracking-tight leading-tight">{row.name}</span>
                                 <span className="text-[9px] font-bold text-gray-400 mt-0.5">SKU: {row.sku}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase">{row.category}</span>
                            </td>
                            <td className="p-6">
                               <div className="flex flex-col">
                                 <span className="text-sm font-black text-brand-dark">€{row.price}</span>
                                 <span className="text-[9px] font-bold text-gray-400">{row.weight} Kg</span>
                               </div>
                            </td>
                            <td className="p-6 font-bold text-sm">{row.stock} <span className="text-[10px] text-gray-400 ml-1">pz</span></td>
                            <td className="p-6 text-center">
                              {row.isNew ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-200">
                                  <Check className="w-2.5 h-2.5" /> Nuovo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">
                                  <AlertCircle className="w-2.5 h-2.5" /> Esistente
                                </span>
                              )}
                            </td>
                            <td className="p-6 text-right">
                               <button 
                                 onClick={() => setEditingIndex(i)}
                                 className="p-3 bg-white text-gray-400 hover:text-brand-dark hover:shadow-xl rounded-2xl transition-all border border-gray-100 opacity-0 group-hover:opacity-100"
                               >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between bg-brand-dark p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-80 h-80 bg-brand-yellow rounded-full blur-[150px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10 space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Sincronizzazione Pronta</h3>
                  <p className="text-gray-400 font-bold max-w-lg">Verranno importati <span className="text-brand-yellow underline decoration-brand-yellow/30 font-black">{selectedRows.length} prodotti</span>. Il sistema creerà automaticamente le nuove categorie se necessario.</p>
                </div>
                <button 
                  disabled={selectedRows.length === 0}
                  onClick={() => setShowConfirmModal(true)} 
                  className="relative z-10 bg-brand-yellow text-brand-dark px-12 py-6 rounded-[2rem] font-black uppercase text-lg tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
                >
                    Sincronizza Ora
                </button>
              </div>

              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/80 backdrop-blur-md animate-in fade-in duration-300">
                   <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
                      <div className="w-24 h-24 bg-brand-yellow/20 text-brand-yellow rounded-[2rem] flex items-center justify-center mx-auto rotate-12">
                         <Layers className="w-12 h-12" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Conferma Azione</h4>
                        <p className="text-gray-500 font-bold leading-relaxed">Stai per aggiungere <span className="text-brand-dark font-black underline">{selectedRows.length} prodotti</span> al tuo catalogo live. Questa operazione modificherà le categorie e il database prodotti.</p>
                      </div>
                      <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-1">Seleziona Strategia di Importazione:</p>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => setImportMode('integrate')}
                              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${importMode === 'integrate' ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-50 bg-gray-50'}`}
                            >
                              <Layers className={`w-8 h-8 ${importMode === 'integrate' ? 'text-brand-yellow' : 'text-gray-300'}`} />
                              <div className="text-center">
                                <p className="font-black uppercase text-[10px] tracking-tighter">Integra Nuovi</p>
                                <p className="text-[9px] text-gray-400 font-bold">Mantieni catalogo attuale</p>
                              </div>
                            </button>
                            <button 
                              onClick={() => setImportMode('replace')}
                              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${importMode === 'replace' ? 'border-red-500 bg-red-50' : 'border-gray-50 bg-gray-50'}`}
                            >
                              <AlertCircle className={`w-8 h-8 ${importMode === 'replace' ? 'text-red-500' : 'text-gray-300'}`} />
                              <div className="text-center">
                                <p className="font-black uppercase text-[10px] tracking-tighter">Sostituisci Tutto</p>
                                <p className="text-[9px] text-red-400 font-bold">Elimina tutto e importa</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {importMode === 'replace' && (
                          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-[9px] font-black text-red-500 uppercase leading-snug">ATTENZIONE! Questa azione eliminerà permanentemente tutti i prodotti esistenti.</p>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => setShowConfirmModal(false)}
                            disabled={isFinalizing}
                            className="flex-1 px-8 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Annulla
                          </button>
                          <button 
                            onClick={finalizeImport}
                            disabled={isFinalizing}
                            className={`flex-[2] px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 ${importMode === 'replace' ? 'bg-red-500 text-white' : 'bg-brand-dark text-brand-yellow'}`}
                          >
                            {isFinalizing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                In Corso...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Conferma
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </>
           )}
        </div>
      )}

      {/* CONTENT: Success Phase */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center h-[500px] text-center animate-in zoom-in-95 duration-500 relative">
          <div className="absolute inset-0 bg-brand-yellow/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 w-32 h-32 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_30px_60px_rgba(34,197,94,0.4)] rotate-12">
            <Check className="w-16 h-16 stroke-[4]" />
          </div>
          <h2 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-4">Mmissione Compiuta!</h2>
          <p className="text-xl text-gray-500 font-bold max-w-md mb-12">Il catalogo è stato aggiornato con successo. <span className="text-brand-blue">{previewData.filter(p => p.isNew && selectedRows.includes(previewData.indexOf(p))).length} prodotti</span> sono stati importati.</p>
          <div className="flex gap-4 relative z-10">
             <button onClick={() => setStep('upload')} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all border border-gray-200">Nuovo Import</button>
             <button onClick={onBack} className="px-10 py-5 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">Torna alla Lista</button>
          </div>
        </div>
      )}

    </div>
  );
};
