import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Check, AlertCircle, Loader2, Search, Trash2, FileSpreadsheet, FileImage } from "lucide-react";
import { Product } from "./types";
import Papa from "papaparse";

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Bulk Image Linker</h2>
          <p className="text-gray-400 font-bold">Collega immagini ai prodotti tramite Codice SKU</p>
        </div>
        <button onClick={onBack} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Annulla</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sinistra: Caricamento */}
        <div className="space-y-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveMode('files')}
              className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeMode === 'files' ? 'bg-brand-dark text-brand-yellow' : 'bg-gray-100 text-gray-400'}`}
            >
              <FileImage className="w-4 h-4 mx-auto mb-1" /> File Immagine
            </button>
            <button 
              onClick={() => setActiveMode('csv')}
              className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeMode === 'csv' ? 'bg-brand-dark text-brand-yellow' : 'bg-gray-100 text-gray-400'}`}
            >
              <FileSpreadsheet className="w-4 h-4 mx-auto mb-1" /> File CSV
            </button>
          </div>

          <div
            onClick={() => activeMode === 'files' ? fileInputRef.current?.click() : csvInputRef.current?.click()}
            className="border-4 border-dashed border-gray-100 rounded-[3rem] p-12 text-center hover:border-brand-yellow/30 hover:bg-brand-yellow/5 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-brand-yellow/10 transition-all">
              {activeMode === 'files' ? <ImageIcon className="w-10 h-10 text-brand-yellow" /> : <FileSpreadsheet className="w-10 h-10 text-brand-yellow" />}
            </div>
            <p className="text-sm font-black text-brand-dark uppercase tracking-wider mb-2">
              {activeMode === 'files' ? 'Seleziona le foto dei prodotti' : 'Seleziona il listino immagini'}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {activeMode === 'files' ? 'Il nome del file deve corrispondere allo SKU (es. 1234.jpg)' : 'CSV con due colonne: CODICE e URL'}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
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

          {matches.length > 0 && (
            <div className="bg-brand-dark p-8 rounded-[2.5rem] shadow-2xl space-y-4">
              <div className="flex justify-between items-center text-white">
                <span className="font-black uppercase text-xs tracking-widest">Totale Analizzati: {matches.length}</span>
                <span className="font-black uppercase text-xs tracking-widest text-brand-yellow">Match Trovati: {matches.filter(m => m.status === 'match').length}</span>
              </div>
              <button 
                onClick={finalizeLinking}
                disabled={isProcessing || !matches.some(m => m.status === 'match')}
                className="w-full bg-brand-yellow text-brand-dark py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Applica Collegamenti'}
              </button>
            </div>
          )}
        </div>

        {/* Destra: Preview */}
        <div className="bg-gray-50 rounded-[3rem] p-8 border border-gray-100 h-[600px] flex flex-col">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2 px-2">
            <Search className="w-3 h-3" /> Risultati Anteprima
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
            {matches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <ImageIcon className="w-16 h-16 mb-4" />
                <p className="font-black uppercase text-xs">In attesa di dati...</p>
              </div>
            ) : (
              matches.map((match, i) => (
                <div key={i} className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  match.status === 'success' ? 'bg-green-50 border-green-200' :
                  match.status === 'match' ? 'bg-white border-brand-yellow/30' : 
                  'bg-red-50 border-red-100 opacity-60'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                      {match.newImageUrl && <img src={match.newImageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-black text-brand-dark text-xs">{match.productSku}</p>
                      {match.foundProduct ? (
                        <p className="text-[9px] font-bold text-gray-400 truncate w-32">{match.foundProduct.name}</p>
                      ) : (
                        <p className="text-[9px] font-bold text-red-500 uppercase">Prodotto non trovato</p>
                      )}
                    </div>
                  </div>
                  
                  {match.status === 'match' && <Check className="w-5 h-5 text-green-500" />}
                  {match.status === 'not_found' && <AlertCircle className="w-5 h-5 text-red-400" />}
                  {match.status === 'success' && <div className="text-[10px] font-black text-green-600 uppercase">Collegato!</div>}
                </div>
              ))
            )}
          </div>

          {matches.length > 0 && (
            <button 
              onClick={() => setMatches([])}
              className="mt-6 flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-all font-black uppercase text-[10px] tracking-widest"
            >
              <Trash2 className="w-3 h-3" /> Pulisci Tutto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
