import React, { useState, useRef } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Loader2, 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  FileImage,
  ArrowLeft 
} from "lucide-react";
import { Product } from "./types";
import Papa from "papaparse";
import { 
  ADMIN_BTN_PRIMARY, 
  ADMIN_BTN_SECONDARY 
} from "@/components/admin/adminTouchTargets";

interface ImageMatch {
  productSku: string;
  foundProduct: Product | null;
  newImageUrl: string;
  status: 'pending' | 'match' | 'not_found' | 'success';
}

export const AdminImageLinker = ({ 
  products, 
  setProducts, 
  onBack 
}: { 
  products: Product[], 
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  onBack: () => void
}) => {
  const [matches, setMatches] = useState<ImageMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMode, setActiveMode] = useState<'csv' | 'files'>('files');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: File[]) => {
    setIsProcessing(true);
    const newMatches: ImageMatch[] = [];

    files.forEach(file => {
      // 12345.jpg -> 12345
      const fileName = file.name.split('.').slice(0, -1).join('.');
      
      // Cerca per SKU, EAN o Nome esatto
      const found = products.find(p => 
        p.sku === fileName || 
        p.ean === fileName || 
        p.name.toLowerCase().trim() === fileName.toLowerCase().trim()
      );
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setMatches(prev => prev.map(m => m.productSku === fileName ? { ...m, newImageUrl: e.target?.result as string } : m));
      };
      reader.readAsDataURL(file);

      newMatches.push({
        productSku: fileName,
        foundProduct: found || null,
        newImageUrl: '',
        status: found ? 'match' : 'not_found'
      });
    });

    setMatches(newMatches);
    setIsProcessing(false);
  };

  const processCsv = (data: any[]) => {
    const newMatches: ImageMatch[] = [];
    data.forEach(row => {
      const sku = String(Object.values(row)[0] || '').trim();
      const url = String(Object.values(row)[1] || '').trim();
      
      if (!sku || !url) return;

      const found = products.find(p => 
        p.sku === sku || 
        p.ean === sku || 
        p.name.toLowerCase().trim() === sku.toLowerCase().trim()
      );

      newMatches.push({
        productSku: sku,
        foundProduct: found || null,
        newImageUrl: url,
        status: found ? 'match' : 'not_found'
      });
    });
    setMatches(newMatches);
  };

  const finalizeLinking = () => {
    setIsProcessing(true);
    setProducts(prev => prev.map(p => {
      const match = matches.find(m => 
        m.status === 'match' && (
          m.productSku === p.sku || 
          m.productSku === p.ean || 
          m.productSku.toLowerCase().trim() === p.name.toLowerCase().trim()
        )
      );
      if (match) {
        return { ...p, image: match.newImageUrl };
      }
      return p;
    }));
    
    // Segna come success
    setMatches(prev => prev.map(m => m.status === 'match' ? { ...m, status: 'success' } : m));
    setIsProcessing(false);
  };

  const matchedCount = matches.filter(m => m.status === 'match').length;
  const successCount = matches.filter(m => m.status === 'success').length;

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header coerente con le sezioni admin */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Bulk Images
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            Associazione massiva immagini ai prodotti tramite SKU o listino CSV
          </p>
        </div>
        <div>
          <button 
            type="button"
            onClick={onBack} 
            className={`${ADMIN_BTN_SECONDARY} w-full sm:w-auto rounded-full`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna ai Prodotti</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sinistra: Selettore e Caricamento */}
        <div className="space-y-6">
          {/* Selettore Modalità */}
          <div className="bg-neutral-100 p-1 rounded-xl flex gap-1">
            <button 
              type="button"
              onClick={() => setActiveMode('files')}
              className={`flex-1 min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeMode === 'files' 
                  ? 'bg-neutral-950 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>File Immagine</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveMode('csv')}
              className={`flex-1 min-h-[44px] px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeMode === 'csv' 
                  ? 'bg-neutral-950 text-white shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>File CSV</span>
            </button>
          </div>

          {/* Area Drop / Caricamento */}
          <div
            onClick={() => activeMode === 'files' ? fileInputRef.current?.click() : csvInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-neutral-300 hover:border-neutral-950 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-16 h-16 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 group-hover:bg-neutral-100 transition-all text-neutral-800">
              {activeMode === 'files' ? <ImageIcon className="w-7 h-7" /> : <FileSpreadsheet className="w-7 h-7" />}
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-950 mb-1.5">
              {activeMode === 'files' ? 'Seleziona le foto dei prodotti' : 'Seleziona il listino immagini CSV'}
            </p>
            <p className="text-[11px] text-neutral-400 font-light max-w-xs mx-auto leading-relaxed">
              {activeMode === 'files' 
                ? 'Il nome del file deve corrispondere allo SKU o EAN (es. 1234.jpg o PROD-01.png)' 
                : 'File CSV con due colonne: CODICE e URL'}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*"
              onChange={(e) => processFiles(Array.from(e.target.files || []))} 
            />
            <input 
              type="file" 
              ref={csvInputRef} 
              className="hidden" 
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  Papa.parse(file, {
                    header: true,
                    complete: (result) => processCsv(result.data as any[])
                  });
                }
              }} 
            />
          </div>

          {/* Riepilogo e Azione */}
          {matches.length > 0 && (
            <div className="bg-neutral-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs tracking-wider">
                <span className="font-light text-neutral-300">Totale analizzati: <strong className="text-white font-medium">{matches.length}</strong></span>
                <span className="font-medium text-emerald-400">Match trovati: {matchedCount}</span>
              </div>
              <button 
                type="button"
                onClick={finalizeLinking}
                disabled={isProcessing || matchedCount === 0}
                className="w-full min-h-[48px] bg-white text-neutral-950 py-3 rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-neutral-100 active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvataggio in corso...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Applica {matchedCount} Collegamenti</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Destra: Anteprima e Risultati */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-sm h-[560px] flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Risultati Anteprima ({matches.length})</span>
            </h4>
            {matches.length > 0 && (
              <button 
                type="button"
                onClick={() => setMatches([])}
                className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Pulisci</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-300">
                <ImageIcon className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="text-xs font-light text-neutral-400">Nessun file caricato</p>
                <p className="text-[10px] text-neutral-300 mt-1">Carica file o un CSV per verificare le corrispondenze</p>
              </div>
            ) : (
              matches.map((match, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-xl flex items-center justify-between border transition-all ${
                    match.status === 'success' 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : match.status === 'match' 
                      ? 'bg-white border-neutral-200 hover:border-neutral-400' 
                      : 'bg-neutral-50/50 border-neutral-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200/80 flex items-center justify-center">
                      {match.newImageUrl ? (
                        <img src={match.newImageUrl} alt={match.productSku} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-950 truncate">{match.productSku}</p>
                      {match.foundProduct ? (
                        <p className="text-[11px] font-light text-neutral-500 truncate max-w-[180px] sm:max-w-xs">{match.foundProduct.name}</p>
                      ) : (
                        <p className="text-[10px] font-light text-rose-500">Nessun prodotto trovato</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 ml-3">
                    {match.status === 'match' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium uppercase tracking-wider">
                        <Check className="w-3 h-3" /> Match
                      </span>
                    )}
                    {match.status === 'not_found' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-medium uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Assente
                      </span>
                    )}
                    {match.status === 'success' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-medium uppercase tracking-wider">
                        <Check className="w-3 h-3" /> Collegato
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

