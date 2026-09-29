import React, { useState, useRef, useEffect, useMemo } from "react";
import { Package, X, Trash2, Layers, Globe, ExternalLink, Camera, Plus, Check, RefreshCw, Search, ChevronDown, ChevronUp, Truck, Info, Upload, Link as LinkIcon, Star, Maximize2, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Image as ImageIcon, Link as LucideLink, Eraser, Zap, FileText, FileSpreadsheet, Compass, FileCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, SUBCATEGORIES } from "./data";
import { GoogleGenAI, Type as GenAIType } from "@google/genai";
import { toProperCase } from "./utils";
import { Sparkles, Loader2 as LoaderIcon } from "lucide-react";

/**
 * MASTER RICH EDITOR v3
 * Editor di testo ricco personalizzato, ultra-stabile per React 19.
 * Supporta: Grassetto, Corsivo, Sottolineato, Allineamento,
 * Dimensione Testo, Immagini con +/− resize e Link.
 */
const MasterRichEditor = ({ value, onChange, placeholder, minHeight = "200px" }: { value: string, onChange: (val: string) => void, placeholder?: string, minHeight?: string }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgBtnPos, setImgBtnPos] = useState<{ top: number, right: number } | null>(null);

  // Sincronizza il valore quando cambia dall'esterno (es. da un altro editor o reset)
  // solo se l'utente non sta scrivendo in QUESTO editor (evita salto cursore)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // Calcola la posizione del pannello +/- rispetto al container
  const updateBtnPos = (img: HTMLImageElement) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    setImgBtnPos({
      top: imgRect.top - containerRect.top + imgRect.height / 2 - 20, // centra verticalmente
      right: 8, // fisso a destra, dentro il container
    });
  };

  // Click sull'editor: se clicco su immagine la seleziono, altrimenti deseleziono
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setSelectedImg(img);
      updateBtnPos(img);
    } else {
      setSelectedImg(null);
      setImgBtnPos(null);
    }
  };

  // Resize: passo 20% per click
  const resizeImg = (factor: number) => {
    if (!selectedImg) return;
    const currentW = selectedImg.offsetWidth || selectedImg.naturalWidth || 200;
    const currentH = selectedImg.offsetHeight || selectedImg.naturalHeight || 150;
    const aspect = currentH / currentW;
    const newW = Math.max(40, Math.round(currentW * factor));
    selectedImg.style.width = `${newW}px`;
    selectedImg.style.height = `${Math.round(newW * aspect)}px`;
    updateBtnPos(selectedImg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleFontSize = (px: string) => {
    if (!px) return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = px;
      try {
        range.surroundContents(span);
      } catch {
        document.execCommand('fontSize', false, '7');
        editorRef.current?.querySelectorAll('font[size="7"]').forEach(el => {
          const s = document.createElement('span');
          s.style.fontSize = px;
          while (el.firstChild) s.appendChild(el.firstChild);
          el.parentNode?.replaceChild(s, el);
        });
      }
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }
  };

  const FONT_SIZES = Array.from({ length: Math.ceil((60 - 8) / 5) + 1 }, (_, i) => 8 + i * 5).filter(s => s <= 60);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          editorRef.current?.focus();
          document.execCommand('insertImage', false, re.target?.result as string);
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleImageUrl = () => {
    const url = prompt("Inserisci URL Immagine:");
    if (url) {
      editorRef.current?.focus();
      document.execCommand('insertImage', false, url);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt("Inserisci URL Link:");
    if (url) execCommand('createLink', url);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-inner relative"
    >
      {/* Toolbar Premium */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm sticky top-0 z-10">
        
        {/* Grassetto / Corsivo / Sottolineato */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold className="w-4 h-4"/>} title="Grassetto" />
          <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic className="w-4 h-4"/>} title="Corsivo" />
          <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline className="w-4 h-4"/>} title="Sottolineato" />
        </div>

        {/* Dimensione testo — selettore da 8pt a 60pt passo 5 */}
        <div className="flex items-center px-2 border-r border-gray-200">
          <select
            defaultValue=""
            onChange={(e) => { handleFontSize(e.target.value); e.currentTarget.value = ''; }}
            title="Dimensione testo"
            className="text-[11px] font-bold text-gray-500 bg-transparent border border-gray-200 rounded-lg px-1.5 py-1 hover:border-brand-blue focus:outline-none cursor-pointer appearance-none min-w-[56px]"
          >
            <option value="" disabled>pt ▾</option>
            {FONT_SIZES.map(size => (
              <option key={size} value={`${size}px`}>{size} pt</option>
            ))}
          </select>
        </div>

        {/* Allineamento */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={<AlignLeft className="w-4 h-4"/>} title="Allinea Sinistra" />
          <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={<AlignCenter className="w-4 h-4"/>} title="Allinea Centro" />
          <ToolbarButton onClick={() => execCommand('justifyRight')} icon={<AlignRight className="w-4 h-4"/>} title="Allinea Destra" />
        </div>

        {/* Immagini */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={handleImageUpload} icon={<ImageIcon className="w-4 h-4"/>} title="Carica Immagine" />
          <ToolbarButton onClick={handleImageUrl} icon={<LucideLink className="w-4 h-4 text-brand-blue"/>} title="Immagine da URL" />
        </div>

        {/* Link + Clear */}
        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton onClick={handleLink} icon={<Type className="w-4 h-4"/>} title="Inserisci Link" />
          <ToolbarButton onClick={() => execCommand('removeFormat')} icon={<Eraser className="w-4 h-4 text-red-400"/>} title="Pulisci Formattazione" />
        </div>
      </div>

      {/* Area di Editing */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e: any) => onChange(e.target.innerHTML)}
        onClick={handleEditorClick}
        className="p-6 focus:outline-none overflow-auto prose prose-sm max-w-none text-brand-dark font-medium"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* Bottoni +/− resize immagine */}
      {selectedImg && imgBtnPos && (
        <div
          style={{
            position: 'absolute',
            top: imgBtnPos.top,
            right: imgBtnPos.right,
            zIndex: 30,
          }}
          className="flex flex-col gap-1"
          onMouseDown={(e) => e.preventDefault()} // evita perdita selezione editor
        >
          <button
            onClick={() => resizeImg(1.2)}
            title="Ingrandisci immagine"
            className="w-8 h-8 rounded-xl bg-brand-dark text-white text-lg font-black flex items-center justify-center shadow-lg hover:bg-brand-blue transition-colors leading-none"
          >+</button>
          <button
            onClick={() => resizeImg(0.8)}
            title="Riduci immagine"
            className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 text-lg font-black flex items-center justify-center shadow-lg hover:bg-gray-300 transition-colors leading-none"
          >−</button>
        </div>
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-weight: 500;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 1rem;
          margin: 1rem auto;
          display: block;
          cursor: pointer;
        }
        [contenteditable] img:hover {
          outline: 2px solid #6b7280;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

const ToolbarButton = ({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className="p-2 hover:bg-white hover:text-brand-blue hover:shadow-sm rounded-lg transition-all active:scale-95 text-gray-500"
  >
    {icon}
  </button>
);

export const AdminSingleProduct = ({ onBack, onSave, onDelete, initialData, existingBrands = [], existingCategories = [], existingSubcategories = {}, allProducts = [], availableVariants = ['Colore', 'Taglia'], setAvailableVariants }: { onBack: () => void, onSave: (p: any) => void, onDelete?: (id: string) => void, initialData?: any, existingBrands?: string[], existingCategories?: string[], existingSubcategories?: Record<string, string[]>, allProducts?: any[], availableVariants?: string[], setAvailableVariants?: (v: string[]) => void }) => {
  const [baseCost, setBaseCost] = useState<number>(Number(initialData?.cost) || 0);
  // Prezzo al pubblico IVA inclusa (manuale)
  const [manualB2c, setManualB2c] = useState<string>(initialData?.price ? String(initialData.price) : "");
  // Sconto % rivenditori rispetto al prezzo pubblico
  const [b2bDiscount, setB2bDiscount] = useState<number>(Number(initialData?.b2bDiscount) || 20);
  // Spedizione
  const [freeShipping, setFreeShipping] = useState<boolean>(initialData?.freeShipping ?? false);
  const [shippingCost, setShippingCost] = useState<string>(initialData?.shippingCost ? String(initialData.shippingCost) : "");

  const [isAmazonActive, setIsAmazonActive] = useState<boolean>(initialData?.amazonActive ?? false);
  const [isEbayActive, setIsEbayActive] = useState<boolean>(initialData?.ebayActive ?? false);
  const [selectedCourier, setSelectedCourier] = useState<string>(initialData?.courier || "GLS Italy");
  const [isCourierDropdownOpen, setIsCourierDropdownOpen] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isSpecialPromotion, setIsSpecialPromotion] = useState<boolean>(initialData?.isSpecialPromotion || false);
  const [showBrand, setShowBrand] = useState<boolean>(initialData?.showBrand || false);
  const [showEan, setShowEan] = useState<boolean>(initialData?.showEan || false);
  const [has3D, setHas3D] = useState<boolean>(initialData?.has3D || false);

  // Core Data States
  const [title, setTitle] = useState<string>(toProperCase(initialData?.name || ""));
  // Genera SKU Automatico SKU-01...
  const generateAutoSku = () => {
    if (!allProducts || allProducts.length === 0) return "SKU-01";
    const codes = allProducts
      .map(p => p.sku || "")
      .filter(s => s.startsWith("SKU-"))
      .map(s => parseInt(s.replace("SKU-", "")))
      .filter(n => !isNaN(n));
    
    const max = codes.length > 0 ? Math.max(...codes) : 0;
    return `SKU-${(max + 1).toString().padStart(2, '0')}`;
  };

  const [sku, setSku] = useState<string>(initialData?.sku || generateAutoSku());
  const [ean, setEan] = useState<string>(initialData?.ean || "");
  const [brand, setBrand] = useState<string>(initialData?.brand || "");
  const [productDescription, setProductDescription] = useState<string>(initialData?.description || "");
  const [weight, setWeight] = useState<number>(Number(initialData?.weight) || 0);
  const [length, setLength] = useState<number>(Number(initialData?.length) || 0);
  const [width, setWidth] = useState<number>(Number(initialData?.width) || 0);
  const [height, setHeight] = useState<number>(Number(initialData?.height) || 0);

  const [energyLabel, setEnergyLabel] = useState<string>(initialData?.energyLabel || "");
  const [techSheet, setTechSheet] = useState<string>(initialData?.techSheet || "");
  const [manual, setManual] = useState<string>(initialData?.manual || "");

  const [category, setCategory] = useState<string>(initialData?.category || existingCategories[0] || "");
  const [subcategory, setSubcategory] = useState<string>(initialData?.subcategory || "Tutti");
  
  const [metaTitle, setMetaTitle] = useState<string>(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState<string>(initialData?.metaDescription || "");
   
  // Related Products States
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initialData?.relatedProductIds || []);
  const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
  const [isSearchingRelated, setIsSearchingRelated] = useState(false);

  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState<boolean>(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [isAddingNewSubcategory, setIsAddingNewSubcategory] = useState<boolean>(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);

  const [isAddingVariantType, setIsAddingVariantType] = useState(false);
  const [newVariantTypeName, setNewVariantTypeName] = useState("");
  const [editingVariantType, setEditingVariantType] = useState<string | null>(null);
  const [editingVariantValue, setEditingVariantValue] = useState("");

  const [newBrand, setNewBrand] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newSubcategory, setNewSubcategory] = useState<string>("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);
  const [isVariantImageModalOpen, setIsVariantImageModalOpen] = useState(false);
  const [variantImageUrlInput, setVariantImageUrlInput] = useState("");
  const [variantImageTargetIndex, setVariantImageTargetIndex] = useState<number | null>(null);
  const [isGeneratingAmazon, setIsGeneratingAmazon] = useState(false);
  const [isGeneratingEbay, setIsGeneratingEbay] = useState(false);
  const [amazonDescription, setAmazonDescription] = useState<string>(initialData?.amazonDescription || "");
  const [ebayDescription, setEbayDescription] = useState<string>(initialData?.ebayDescription || "");
  const [aiError, setAiError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

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
          
          const newImage = canvas.toDataURL('image/jpeg', 0.8);
          
          setGallery(prev => {
            if (replacingImageIndex !== null) {
               const newGallery = [...prev];
               newGallery[replacingImageIndex] = newImage;
               return newGallery.slice(0, 10);
            }
            return [...prev, newImage].slice(0, 10);
          });
          setIsImageModalOpen(false);
          setReplacingImageIndex(null);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      const newImage = imageUrlInput.trim();
      setGallery(prev => {
        if (replacingImageIndex !== null) {
           const newGallery = [...prev];
           newGallery[replacingImageIndex] = newImage;
           return newGallery.slice(0, 10);
        }
        return [...prev, newImage].slice(0, 10);
      });
      setImageUrlInput("");
      setIsImageModalOpen(false);
      setReplacingImageIndex(null);
    }
  };

  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && variantImageTargetIndex !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          const newImage = canvas.toDataURL('image/jpeg', 0.8);
          const newV = [...variants]; newV[variantImageTargetIndex].image = newImage; setVariants(newV);
          setIsVariantImageModalOpen(false); setVariantImageTargetIndex(null);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariantImageUrl = () => {
    if (variantImageUrlInput.trim() && variantImageTargetIndex !== null) {
      const newV = [...variants]; newV[variantImageTargetIndex].image = variantImageUrlInput.trim(); setVariants(newV);
      setVariantImageUrlInput(""); setIsVariantImageModalOpen(false); setVariantImageTargetIndex(null);
    }
  };

  // Sync isFeatured if initialData changes Externally
  React.useEffect(() => {
    if (initialData) {
      setIsFeatured(initialData.isFeatured || false);
      setIsSpecialPromotion(initialData.isSpecialPromotion || false);
      setVariants(initialData.variants || []);
    }
  }, [initialData?.isFeatured, initialData?.isSpecialPromotion]);

  const COURIER_OPTIONS = [
    { name: "GLS Italy", details: "Nazionale Standard — Arrivo 24/48h" },
    { name: "DHL Express", details: "Internazionale / Express Priority — Arrivo 12/24h" },
    { name: "BRT Corriere Espresso", details: "Bartolini — Indirizzi Particolari & Carichi Voluminosi" },
    { name: "Poste Italiane", details: "Economy & Punti Ritiro — Arrivo 3-5gg" },
  ];

  const b2cPriceFinal = parseFloat(manualB2c || '0');
  const b2bPriceFinal = b2cPriceFinal * (1 - b2bDiscount / 100);

  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || (initialData?.image ? [initialData.image] : []));
  const [specs, setSpecs] = useState<{key: string, value: string}[]>(
    initialData?.specs && typeof initialData.specs === 'object' && !Array.isArray(initialData.specs)
      ? Object.entries(initialData.specs).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: "", value: "" }]
  );
  
  // NEW: Independent Channel Stock Management
  const [webStock, setWebStock] = useState<number>(Number(initialData?.stock) || 0);
  const [amazonStock, setAmazonStock] = useState<number>(Number(initialData?.amazonStock) || 0);
  const [ebayStock, setEbayStock] = useState<number>(Number(initialData?.ebayStock) || 0);

  // UPDATED: Variants State with independent inventory
  const [variants, setVariants] = useState<{
    id: string, 
    type: string, 
    value: string, 
    sku: string, 
    title?: string,
    note?: string,
    costType: 'fixed' | 'delta' | 'percent',
    costValue: number,
    webStock: number,
    amazonStock: number,
    ebayStock: number,
    ean: string,
    showEan?: boolean,
    image: string
  }[]>(Array.isArray(initialData?.variants) ? initialData.variants.map((v: any) => ({
    ...v,
    title: v.title || "",
    note: v.note || "",
    ean: v.ean || "",
    showEan: v.showEan ?? true,
    image: v.image || "",
    webStock: v.webStock ?? (Number(v.totalStock || 0) - Number(v.allocations?.amazon || 0) - Number(v.allocations?.ebay || 0)),
    amazonStock: v.amazonStock ?? Number(v.allocations?.amazon || 0),
    ebayStock: v.ebayStock ?? Number(v.allocations?.ebay || 0),
    costType: v.costType || 'fixed',
    costValue: v.costValue ?? (Number(v.cost) || baseCost)
  })) : []);

  const [amazonMarkup, setAmazonMarkup] = useState<number>(Number(initialData?.amazonMarkup) || 15);
  const [amazonManualPrice, setAmazonManualPrice] = useState<string>(initialData?.amazonPrice || "");
  const [ebayMarkup, setEbayMarkup] = useState<number>(Number(initialData?.ebayMarkup) || 11);
  const [ebayManualPrice, setEbayManualPrice] = useState<string>(initialData?.ebayPrice || "");

  const [videoUrl, setVideoUrl] = useState<string>(initialData?.videoUrl || "");
  const [description, setDescription] = useState<string>(initialData?.description || "");
  const [amazonTitle, setAmazonTitle] = useState<string>(toProperCase(initialData?.amazonTitle || ""));
  const [ebayTitle, setEbayTitle] = useState<string>(toProperCase(initialData?.ebayTitle || ""));

  const amazonPrice = amazonManualPrice ? parseFloat(amazonManualPrice) : baseCost * (1 + amazonMarkup / 100);
  const ebayPrice = ebayManualPrice ? parseFloat(ebayManualPrice) : baseCost * (1 + ebayMarkup / 100);

  const generateAIContent = async (marketplace: 'Amazon' | 'eBay') => {
    const setLoader = marketplace === 'Amazon' ? setIsGeneratingAmazon : setIsGeneratingEbay;
    const setTitle = marketplace === 'Amazon' ? setAmazonTitle : setEbayTitle;
    const setDesc = marketplace === 'Amazon' ? setAmazonDescription : setEbayDescription;

    const modelsToTry = ['gemini-1.5-flash'];
    let lastError = null;

    setAiError(null);
    setLoader(true);
    
    try {
      let apiKey = "";
      try {
        const saved = localStorage.getItem('companySettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          apiKey = parsed.customGeminiKey || "";
        }
      } catch (e) {}
      
      if (!apiKey) {
        apiKey = (process.env as any).GEMINI_API_KEY;
      }

      if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'INSERISCI_QUI_LA_TUA_CHIAVE_API') {
        throw new Error("API_KEY_MISSING");
      }
      const genAI = new GoogleGenAI({ apiKey });
      const model = "gemini-1.5-flash";

      const prompt = `Sei un esperto SEO per marketplace. Crea un titolo ottimizzato e una descrizione persuasiva per il marketplace ${marketplace} per questo prodotto:
Nome Master: ${title}
Marca: ${brand || 'N/D'}
Categoria: ${category || 'N/D'}
Descrizione Base: ${productDescription.replace(/<[^>]*>?/gm, '').slice(0, 500)}
Specifiche: ${JSON.stringify(specs).slice(0, 300)}

REGOLE TITOLO: Massimo 150 caratteri. Usa parole chiave rilevanti. Prima lettera di ogni parola MAIUSCOLA.
REGOLE DESCRIZIONE: ${marketplace === 'Amazon' ? 'Usa punti elenco (• ) per i benefici principali.' : 'Tono professionale, evidenzia affidabilità e compatibilità.'}

Rispondi SOLO con JSON valido, nessun testo extra: { "title": "...", "description": "..." }`;

      let success = false;
      for (const modelName of modelsToTry) {
        try {
          const response = await genAI.models.generateContent({
            model: modelName,
            contents: prompt,
          });

          if (response && response.text) {
            const text = response.text.trim();
            const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleanJson);

            setTitle(toProperCase(parsed.title));
            setDesc(parsed.description ?? '');
            success = true;
            break; // Successo! Esci dal ciclo dei modelli
          }
        } catch (err: any) {
          console.warn(`Modello ${modelName} non disponibile, provo il prossimo...`, err);
          lastError = err;
          // Se è un errore di quota o sovraccarico, continua al prossimo modello
          continue;
        }
      }

      if (!success) {
        throw lastError || new Error("Nessun modello disponibile al momento.");
      }

    } catch (error: any) {
      console.error("Errore generazione AI finale:", error);
      if (error.message === 'API_KEY_MISSING') {
        setAiError('🔑 Chiave API Gemini non trovata. Inserisci la chiave nel file .env e riavvia.');
      } else if (error.status === 'UNAVAILABLE' || error.code === 503) {
        setAiError('⏳ I server di Google sono molto carichi. Riprova tra qualche istante.');
      } else {
        setAiError('❌ Errore: ' + (error.message || 'Servizio non disponibile'));
      }
    } finally {
      setLoader(false);
    }
  };

  const handleManualPrice = (val: string, type: 'amazon' | 'ebay') => {
    if (type === 'amazon') setAmazonManualPrice(val);
    if (type === 'ebay') setEbayManualPrice(val);
  };

  const moveVariant = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= variants.length) return;
    const newVariants = [...variants];
    const temp = newVariants[index];
    newVariants[index] = newVariants[targetIndex];
    newVariants[targetIndex] = temp;
    setVariants(newVariants);
  };

  const handleSave = () => {
    const isSimpleProduct = variants.length === 0;
    
    const finalProduct = {
      ...initialData,
      id: initialData?.id || (Math.random() * 1000).toString(),
      sku,
      ean,
      brand: isAddingNewBrand ? newBrand : brand,
      name: title,
      description: productDescription || "",
      price: parseFloat(manualB2c || '0'),
      b2bPrice: b2bPriceFinal,
      b2bDiscount,
      freeShipping,
      shippingCost: freeShipping ? 0 : (shippingCost ? parseFloat(shippingCost) : (
        selectedCourier === 'GLS Italy' ? 6.90 :
        selectedCourier === 'DHL Express' ? 14.90 :
        selectedCourier === 'BRT Corriere Espresso' ? 8.50 :
        selectedCourier === 'Poste Italiane' ? 4.90 : 0
      )),
      stock: webStock,
      amazonStock: isAmazonActive ? amazonStock : 0,
      ebayStock: isEbayActive ? ebayStock : 0,
      weight,
      length,
      width,
      height,
      category: isAddingNewCategory ? newCategory : category,
      subcategory: isAddingNewSubcategory ? newSubcategory : subcategory,
      isFeatured,
      isSpecialPromotion,
      amazonPrice: amazonManualPrice ? parseFloat(amazonManualPrice) : parseFloat(amazonPrice.toFixed(2)),
      ebayPrice: ebayManualPrice ? parseFloat(ebayManualPrice) : parseFloat(ebayPrice.toFixed(2)),
      amazonActive: isAmazonActive,
      ebayActive: isEbayActive,
      courier: selectedCourier,
      specs: specs.reduce((acc, s) => { if (s.key) acc[s.key] = s.value; return acc; }, {} as any),
      variants,
      image: gallery[0] || initialData?.image || "https://picsum.photos/seed/default/800/800",
      gallery: gallery.length > 0 ? gallery : (initialData?.gallery || []),
      relatedProductIds: relatedProductIds || [],
      metaTitle,
      metaDescription,
      amazonDescription,
      ebayDescription,
      showBrand,
      showEan,
      videoUrl,
      has3D,
      energyLabel,
      techSheet,
      manual,
      cost: baseCost,
      amazonMarkup,
      ebayMarkup,
      amazonTitle,
      ebayTitle,
      // Campi obbligatori con default — evitano crash in ProductSheet su nuovi prodotti
      rating: initialData?.rating ?? 0,
      reviews: initialData?.reviews ?? 0,
      tags: initialData?.tags || [],
    };
    onSave(finalProduct);
    setIsSaveSuccess(true);
  };

  return (
    <>
    <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-xl space-y-10 animate-in slide-in-from-bottom-8 duration-500 relative w-full max-w-7xl mx-auto">
      <button onClick={onBack} className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-500 hover:bg-brand-yellow hover:text-brand-dark rounded-xl transition-all">
        <X className="w-6 h-6" />
      </button>
      
      <div>
        <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-2">Creazione Prodotto Master</h2>
        <p className="text-sm font-bold text-gray-400">Dati completi per il sito eCommerce e sincronizzazione avanzata canali (B2C, B2B, Marketplace).</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Colonna Centrale: Dati Principali */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="space-y-6">
            {/* Assegnazione Categoria & Sottocategoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-6">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1.5 block">Categoria *</span>
                {isAddingNewCategory ? (
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Nuova Categoria..." 
                      className="w-full bg-yellow-50 border-brand-yellow rounded-xl px-4 py-2.5 text-xs font-bold" 
                    />
                    <button onClick={() => setIsAddingNewCategory(false)} className="px-2 text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                  </div>
                ) : (
                  <select 
                    value={category}
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setIsAddingNewCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-white border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-brand-blue focus:border-brand-blue"
                  >
                    {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="ADD_NEW" className="text-brand-blue font-black">+ NUOVA CATEGORIA</option>
                  </select>
                )}
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1.5 block">Sottocategoria *</span>
                {isAddingNewSubcategory ? (
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      value={newSubcategory}
                      onChange={e => setNewSubcategory(e.target.value)}
                      placeholder="Nuova Sotto..." 
                      className="w-full bg-yellow-50 border-brand-yellow rounded-xl px-4 py-2.5 text-xs font-bold" 
                    />
                    <button onClick={() => setIsAddingNewSubcategory(false)} className="px-2 text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                  </div>
                ) : (
                  <select 
                    value={subcategory}
                    onChange={e => {
                      if (e.target.value === "ADD_NEW") {
                        setIsAddingNewSubcategory(true);
                      } else {
                        setSubcategory(e.target.value);
                      }
                    }}
                    className="w-full bg-white border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-brand-blue focus:border-brand-blue"
                  >
                    <option value="Tutti">Tutte</option>
                    {(existingSubcategories[category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="ADD_NEW" className="text-brand-blue font-black">+ NUOVA SOTTOCATEGORIA</option>
                  </select>
                )}
              </label>
            </div>

            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue block">Titolo Prodotto (DB Interno & Sito) *</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md transition-all ${title.length > 90 ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                {title.length} / 90
              </span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(toProperCase(e.target.value))}
                placeholder="Titolo gestionale per sito web..." 
                className={`w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold transition-all ${title.length > 90 ? 'border-red-500 ring-4 ring-red-500/10' : 'focus:ring-brand-blue focus:border-brand-blue'}`} 
              />
              {title.length > 90 && (
                <div className="mt-2 text-[11px] leading-relaxed p-3 bg-red-50 border border-red-100 rounded-xl text-gray-600 font-medium">
                  <span className="text-red-500 font-black uppercase text-[9px] block mb-1">Limite Superato!</span>
                  {title.substring(0, 90)}<span className="text-red-500 bg-red-100 px-0.5 rounded font-black">{title.substring(90)}</span>
                </div>
              )}
            </div>

            {/* Galleria Media (Spostata qui sotto il titolo) */}
            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-dark mb-4 flex items-center justify-between">
                Galleria Immagini Prodotto
                <span className="text-[10px] font-bold text-gray-400">{gallery.length}/10 Max</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                 {gallery.map((img, i) => (
                    <div key={i} className={`aspect-square bg-white rounded-xl relative group overflow-hidden border-2 shadow-sm ${i===0 ? 'border-brand-yellow':'border-transparent'}`}>
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-brand-yellow text-brand-dark text-[8px] font-black uppercase text-center py-0.5">Principale</div>}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                           onClick={() => {
                             setReplacingImageIndex(i);
                             setIsImageModalOpen(true);
                           }}
                           className="p-1.5 bg-brand-yellow text-brand-dark rounded-full hover:scale-110 transition-transform"
                         >
                           <RefreshCw className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={() => setGallery(g => g.filter((_, idx) => idx !== i))} className="p-1.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                 ))}
                 {gallery.length < 10 && (
                   <button 
                     onClick={() => {
                       setReplacingImageIndex(null);
                       setIsImageModalOpen(true);
                     }}
                     className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-blue hover:bg-brand-blue/5 transition-all text-gray-400 hover:text-brand-blue group cursor-pointer"
                   >
                     <Plus className="w-7 h-7 group-hover:scale-110 transition-transform mb-1" />
                     <span className="text-[9px] font-black uppercase text-center tracking-tighter">Aggiungi</span>
                   </button>
                 )}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1 block">Descrizione Prodotto</span>
              
              <div className="relative group/editor">
                <MasterRichEditor 
                  key={`collapsed-editor-${isDescModalOpen}`}
                  value={productDescription}
                  onChange={setProductDescription}
                  placeholder="Scrivi qui la descrizione professionale per il sito..."
                  minHeight="250px"
                />
                
                {/* Overlay per Espandere */}
                <button 
                  onClick={(e) => { e.preventDefault(); setIsDescModalOpen(true); }}
                  className="absolute bottom-4 right-4 bg-brand-blue text-white p-3 rounded-xl shadow-lg opacity-0 group-hover/editor:opacity-100 transition-all hover:scale-110 active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase z-20"
                >
                  <Maximize2 className="w-4 h-4" />
                  Espandi Editor
                </button>
              </div>

              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 italic">
                Editor nativo ultra-stabile. Carica immagini da file o incolla URL esterni.
              </p>
            </div>

            {/* === BLOCCO PREZZI RIDISEGNATO === */}
            <div className="bg-brand-dark rounded-[2.5rem] p-8 relative overflow-hidden ring-4 ring-brand-yellow/20 shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full blur-[100px] opacity-10 -mr-20 -mt-20"></div>
               <h3 className="text-lg font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3 relative z-10">
                 <RefreshCw className="w-5 h-5 text-brand-yellow"/>
                 Prezzi e Spedizione
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-start">

                 {/* COL 1: Costo acquisto */}
                 <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block h-8 flex items-center">Costo d'Acquisto (Imponibile)</span>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-500">€</span>
                     <input
                       type="number"
                       value={baseCost}
                       onFocus={e => baseCost === 0 && setBaseCost('' as any)}
                       onChange={e => setBaseCost(Number(e.target.value))}
                       className="w-full bg-black/40 border-2 border-gray-800 text-white rounded-2xl pl-9 pr-4 py-3 text-xl font-black focus:border-brand-yellow focus:ring-brand-yellow outline-none transition-all"
                       placeholder="0.00"
                     />
                   </div>
                   <div className="bg-black/20 rounded-xl px-4 py-2 flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase text-gray-500">Prezzo Netto</span>
                     <span className="text-sm font-black text-gray-400">€{(Number(baseCost) || 0).toFixed(2)}</span>
                   </div>
                   <div className="bg-black/20 rounded-xl px-4 py-2 flex justify-between items-center opacity-0 pointer-events-none">
                     <span className="text-[9px]">&nbsp;</span>
                   </div>
                 </div>

                 {/* COL 2: Prezzo al Pubblico */}
                 <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow block h-8 flex items-center">Prezzo al Pubblico (IVA Inclusa)</span>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-brand-dark/50">€</span>
                     <input
                       type="number"
                       value={manualB2c}
                       onChange={e => setManualB2c(e.target.value)}
                       onFocus={e => manualB2c === "0" && setManualB2c('')}
                       className="w-full bg-brand-yellow text-brand-dark border-none rounded-2xl pl-9 pr-4 py-3 text-xl font-black focus:ring-4 focus:ring-white outline-none transition-all"
                       placeholder="0.00"
                     />
                   </div>
                   <div className="bg-black/30 rounded-xl px-4 py-2 flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase text-gray-500">Senza IVA (22%)</span>
                     <span className="text-sm font-black text-white">
                       €{manualB2c ? (parseFloat(manualB2c) / 1.22).toFixed(2) : "0.00"}
                     </span>
                   </div>
                    {/* Totale cliente inclusa spedizione */}
                    {!freeShipping && (() => {
                      const effShip = shippingCost ? parseFloat(shippingCost) : (
                        selectedCourier === 'GLS Italy' ? 6.90 :
                        selectedCourier === 'DHL Express' ? 14.90 :
                        selectedCourier === 'BRT Corriere Espresso' ? 8.50 :
                        selectedCourier === 'Poste Italiane' ? 4.90 : 0
                      );
                      const total = parseFloat(manualB2c || '0') + effShip;
                      return (
                        <div className="bg-brand-yellow/20 border border-brand-yellow/40 rounded-xl px-4 py-2 flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase text-brand-yellow">Totale + Sped. (€{effShip.toFixed(2)})</span>
                          <span className="text-sm font-black text-brand-yellow">€{total.toFixed(2)}</span>
                        </div>
                      );
                    })()}
                   <div className="bg-black/20 rounded-xl px-4 py-2 flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase text-gray-500">Margine Lordo</span>
                     <span className={`text-sm font-black ${ (parseFloat(manualB2c || '0') - (Number(baseCost) || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                       €{(parseFloat(manualB2c || '0') - (Number(baseCost) || 0)).toFixed(2)}
                     </span>
                   </div>
                 </div>

                 {/* COL 3: Prezzo Rivenditori */}
                 <div className="flex flex-col gap-3">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block h-8 flex items-center">Prezzo Rivenditori (B2B)</span>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-white/40 text-sm">€</span>
                     <input
                       type="number"
                       readOnly
                       value={manualB2c ? (parseFloat(manualB2c) * (1 - b2bDiscount / 100)).toFixed(2) : "0.00"}
                       className="w-full bg-blue-600 text-white border-none rounded-2xl pl-8 pr-3 py-3 text-xl font-black outline-none cursor-default"
                     />
                   </div>
                   {/* Slider + input numerico sincronizzati */}
                   <div className="bg-black/30 rounded-xl px-4 py-2.5 space-y-2">
                     <span className="text-[9px] font-black uppercase text-gray-500 block">Sconto % dal Prezzo Pubblico</span>
                     <div className="flex items-center gap-2">
                       <input
                         type="range"
                         min={1} max={60} step={1}
                         value={b2bDiscount}
                         onChange={e => setB2bDiscount(Number(e.target.value))}
                         className="flex-1 accent-blue-500 h-1.5"
                       />
                       <input
                         type="number"
                         min={1} max={60}
                         value={b2bDiscount}
                         onChange={e => setB2bDiscount(Math.min(60, Math.max(1, Number(e.target.value))))}
                         className="w-14 bg-black/60 border border-gray-700 text-white rounded-lg px-2 py-1 text-sm font-black text-center focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                       />
                       <span className="text-white font-black text-sm -ml-[3px]">%</span>
                     </div>
                   </div>
                   <div className="bg-black/20 rounded-xl px-4 py-2 flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase text-gray-500">Margine B2B</span>
                     <span className={`text-sm font-black ${ (parseFloat(manualB2c || '0') * (1 - b2bDiscount/100) - (Number(baseCost) || 0)) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                       €{(parseFloat(manualB2c || '0') * (1 - b2bDiscount / 100) - (Number(baseCost) || 0)).toFixed(2)}
                     </span>
                   </div>
                 </div>

               </div>


               {/* SPEDIZIONE */}
               <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                 <div className="flex items-center justify-between mb-5">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2">
                     <Truck className="w-4 h-4 text-brand-yellow" />
                     Modalità Spedizione
                   </span>
                   {/* Toggle Gratuita / A pagamento */}
                   <div className="flex items-center gap-3 bg-black/30 rounded-2xl p-1">
                     <button
                       onClick={() => setFreeShipping(true)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         freeShipping ? 'bg-green-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                       }`}
                     >
                       Gratuita
                     </button>
                     <button
                       onClick={() => setFreeShipping(false)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                         !freeShipping ? 'bg-brand-yellow text-brand-dark shadow-lg' : 'text-gray-500 hover:text-white'
                       }`}
                     >
                       A Pagamento
                     </button>
                   </div>
                 </div>

                 {freeShipping ? (
                   <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4">
                     <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                       <Check className="w-5 h-5 text-green-400" />
                     </div>
                     <div>
                       <p className="text-sm font-black text-green-400">Spedizione Gratuita Attiva</p>
                       <p className="text-[9px] text-green-600 uppercase font-bold">Il cliente non paga spese di spedizione</p>
                     </div>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase text-gray-500 pl-1">
                         Costo Spedizione 
                         <span className="text-gray-600 ml-1">
                           (Corriere: {selectedCourier})
                         </span>
                       </span>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-500">€</span>
                         <input
                           type="number"
                           value={shippingCost}
                           onChange={e => setShippingCost(e.target.value)}
                           placeholder={
                             selectedCourier === 'GLS Italy' ? '6.90' :
                             selectedCourier === 'DHL Express' ? '14.90' :
                             selectedCourier === 'BRT Corriere Espresso' ? '8.50' :
                             selectedCourier === 'Poste Italiane' ? '4.90' : '0.00'
                           }
                           className="w-full bg-brand-yellow/10 border border-brand-yellow/30 text-white rounded-2xl pl-9 pr-4 py-3 text-base font-black focus:border-brand-yellow outline-none transition-all"
                         />
                       </div>
                       <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider pl-1">
                         Lascia vuoto per usare il costo standard del corriere
                       </p>
                     </div>
                     <div className="bg-black/20 rounded-2xl p-4 flex flex-col justify-center gap-2">
                       <p className="text-[9px] font-black uppercase text-gray-500">Costi Standard Corrieri</p>
                       {[
                         { name: 'GLS Italy', cost: '6.90' },
                         { name: 'DHL Express', cost: '14.90' },
                         { name: 'BRT Corriere Espresso', cost: '8.50' },
                         { name: 'Poste Italiane', cost: '4.90' },
                       ].map(c => (
                         <div key={c.name} className={`flex justify-between items-center text-[9px] ${ selectedCourier === c.name ? 'text-brand-yellow font-black' : 'text-gray-600 font-bold'}`}>
                           <span>{c.name}</span>
                           <span>€{c.cost}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            </div>

            
            {/* Frontend Specs: 3D, Video, Specifiche */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
               <label className="block">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">URL Video Youtube (Opzionale)</span>
                 <input 
                   type="text" 
                   value={videoUrl}
                   onChange={e => setVideoUrl(e.target.value)}
                   placeholder="https://youtube.com/..." 
                   className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-brand-yellow focus:border-brand-yellow" 
                 />
               </label>

               <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                   <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isFeatured} 
                        onChange={e => setIsFeatured(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow relative"></div>
                   </label>
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">In Vetrina (Home)</span>
                 </div>

                 <div className="flex items-center gap-3">
                   <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isSpecialPromotion} 
                        onChange={e => setIsSpecialPromotion(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                       {isSpecialPromotion && <Star className="absolute left-[3px] top-[4px] w-3 h-3 text-white pointer-events-none z-10 fill-current" />}
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Scelti Per Te</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={has3D}
                      onChange={e => setHas3D(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 relative"></div>
                  </label>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Modello Vista 3D / AR</span>
                </div>
            </div>
          </div>

          {/* New Stock Section moved here */}
          <div className="space-y-4 pt-4">
             <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2">
               <Package className="w-5 h-5 text-indigo-500"/> Disponibilità & Stock Canali
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Independent Channel Stocks Interface */}
               <label className="lg:col-span-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1 block">Web Shop</span>
                 <input 
                   type="number" 
                   value={webStock} 
                   onFocus={e => webStock === 0 && setWebStock('' as any)} 
                   onChange={e => setWebStock(Number(e.target.value))} 
                   className="w-full bg-indigo-50 border-indigo-100 rounded-xl px-4 py-3 text-sm font-black text-indigo-700" 
                 />
               </label>

               {isAmazonActive && (
                 <label className="lg:col-span-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Amazon</span>
                   <input 
                     type="number" 
                     value={amazonStock} 
                     onFocus={e => amazonStock === 0 && setAmazonStock('' as any)} 
                     onChange={e => setAmazonStock(Number(e.target.value))} 
                     className="w-full bg-orange-50 border-orange-100 rounded-xl px-4 py-3 text-sm font-black text-orange-700" 
                   />
                 </label>
               )}
               
               {isEbayActive && (
                 <label className="lg:col-span-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">eBay</span>
                   <input 
                     type="number" 
                     value={ebayStock} 
                     onFocus={e => ebayStock === 0 && setEbayStock('' as any)} 
                     onChange={e => setEbayStock(Number(e.target.value))} 
                     className="w-full bg-blue-50 border-blue-100 rounded-xl px-4 py-3 text-sm font-black text-blue-700" 
                   />
                 </label>
               )}

               <label className="lg:col-span-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1 block">Stock Totale (Somma)</span>
                 <div className="w-full bg-green-50 border-green-100 rounded-xl px-4 py-3 text-sm font-black text-green-700 flex items-center h-[46px]">
                   {webStock + (isAmazonActive ? amazonStock : 0) + (isEbayActive ? ebayStock : 0)}
                 </div>
               </label>
             </div>
          </div>
            
          <div className="space-y-6 pt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue block">Peso e dimensioni dell'imballo</span>
              
              {/* Parametri Fissi */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Peso + Imballo (Kg)</span>
                  <input type="number" value={weight} onFocus={e => weight === 0 && setWeight('' as any)} onChange={e => setWeight(Number(e.target.value))} step="0.01" className="w-full bg-white border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-brand-blue" />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Lunghezza (cm)</span>
                  <input type="number" value={length} onFocus={e => length === 0 && setLength('' as any)} onChange={e => setLength(Number(e.target.value))} step="0.1" className="w-full bg-white border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-brand-blue" />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Larghezza (cm)</span>
                  <input type="number" value={width} onFocus={e => width === 0 && setWidth('' as any)} onChange={e => setWidth(Number(e.target.value))} step="0.1" className="w-full bg-white border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-brand-blue" />
                </label>
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Altezza (cm)</span>
                  <input type="number" value={height} onFocus={e => height === 0 && setHeight('' as any)} onChange={e => setHeight(Number(e.target.value))} step="0.1" className="w-full bg-white border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-brand-blue" />
                </label>
              </div>

              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block pt-2">Voci Aggiuntive Manuali</span>
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue block">Specifiche Tecniche per Tabella (Sito)</span>
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={s.key} onChange={e => {
                    const newSpecs = [...specs]; newSpecs[i].key = e.target.value; setSpecs(newSpecs);
                  }} placeholder="Proprietà (es. Peso)" className="flex-1 bg-white border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  <input type="text" value={s.value} onChange={e => {
                    const newSpecs = [...specs]; newSpecs[i].value = e.target.value; setSpecs(newSpecs);
                  }} placeholder="Valore (es. 2Kg)" className="flex-1 bg-white border-gray-200 rounded-lg px-3 py-2 text-sm font-bold" />
                  <button onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
              <button onClick={() => setSpecs([...specs, {key:"", value:""}])} className="text-[10px] font-black uppercase text-brand-blue hover:text-brand-yellow transition-colors bg-brand-blue/5 px-3 py-2 rounded-lg">+ Aggiungi Riga Specifica</button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2"><Package className="w-5 h-5 text-gray-400"/> Identificativi & Core</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="lg:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1 block">SKU Master *</span>
                <div className="relative group">
                    <input 
                      type="text" 
                      value={sku}
                      onChange={e => setSku(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                      placeholder="SKU-01" 
                      className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue" 
                    />
                    <button 
                      onClick={() => {
                        const newV = variants.map(v => ({
                          ...v,
                          sku: `${sku}-${v.value}`.toUpperCase().replace(/\s+/g, '-')
                        }));
                        setVariants(newV);
                      }}
                      title="Sincronizza SKU Varianti"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-blue hover:text-brand-yellow transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
              </label>
              <label className="lg:col-span-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue block">EAN</span>
                  <label className="inline-flex items-center cursor-pointer scale-75 origin-right">
                    <input type="checkbox" className="sr-only peer" checked={showEan} onChange={e => setShowEan(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue relative"></div>
                    <span className="ml-2 text-[8px] font-black uppercase text-gray-400 peer-checked:text-brand-blue">Visibile</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={ean}
                  onChange={e => setEan(e.target.value)}
                  placeholder="801234..." 
                  className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue" 
                />
              </label>
              <label className="lg:col-span-1">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue block">Marca / Brand</span>
                   <label className="inline-flex items-center cursor-pointer scale-75 origin-right">
                     <input type="checkbox" className="sr-only peer" checked={showBrand} onChange={e => setShowBrand(e.target.checked)} />
                     <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue relative"></div>
                     <span className="ml-2 text-[8px] font-black uppercase text-gray-400 peer-checked:text-brand-blue">Visibile</span>
                   </label>
                 </div>
                 {isAddingNewBrand ? (
                   <div className="flex gap-1">
                     <input 
                        type="text" 
                        value={newBrand}
                        onChange={e => setNewBrand(e.target.value)}
                        placeholder="Nuova Marca..." 
                        className="w-full bg-yellow-50 border-brand-yellow rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-yellow" 
                     />
                     <button onClick={() => setIsAddingNewBrand(false)} className="px-2 text-red-500 hover:bg-red-50 rounded-lg">×</button>
                   </div>
                 ) : (
                   <select 
                     value={brand}
                     onChange={e => {
                       if (e.target.value === "ADD_NEW") {
                         setIsAddingNewBrand(true);
                       } else {
                         setBrand(e.target.value);
                       }
                     }}
                     className="w-full bg-white border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-yellow"
                   >
                     <option value="">Seleziona...</option>
                     {existingBrands.map(b => <option key={b} value={b}>{b}</option>)}
                     <option value="ADD_NEW" className="text-brand-blue font-black">+ NUOVA MARCA</option>
                   </select>
                 )}
               </label>
               <div className="hidden">
                </div>
              </div>
          </div>

          
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gray-400"/> Varianti & Stock Canali
            </h3>
             <div className="space-y-4">
               {/* Global Variants Management */}
               <div className="bg-brand-blue/5 rounded-2xl p-6 border border-brand-blue/10 mb-4">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                       <Layers className="w-4 h-4" /> Configurazione Tipi Varianti (Tabella Master)
                     </h4>
                     {!isAddingVariantType && (
                       <button 
                         onClick={() => setIsAddingVariantType(true)}
                         className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-dark transition-all shadow-md active:scale-95"
                       >
                         + Nuovo Parametro
                       </button>
                     )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                     {availableVariants.map(type => (
                       <div key={type} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm group">
                          {editingVariantType === type ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={editingVariantValue} 
                                onChange={e => setEditingVariantValue(e.target.value)}
                                className="w-24 bg-gray-50 border-none rounded-lg px-2 py-1 text-[10px] font-bold focus:ring-1 focus:ring-brand-blue"
                                autoFocus
                              />
                              <button 
                                onClick={() => {
                                  if (editingVariantValue && setAvailableVariants) {
                                    setAvailableVariants(availableVariants.map(v => v === type ? editingVariantValue : v));
                                    setEditingVariantType(null);
                                  }
                                }}
                                className="text-green-500 hover:scale-110"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-[10px] font-black uppercase text-brand-dark tracking-tight">{type}</span>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => {
                                     setEditingVariantType(type);
                                     setEditingVariantValue(type);
                                   }}
                                   className="text-gray-300 hover:text-brand-blue transition-colors"
                                 >
                                   <RefreshCw className="w-3 h-3" />
                                 </button>
                                 <button 
                                   onClick={() => setAvailableVariants?.(availableVariants.filter(v => v !== type))}
                                   className="text-gray-300 hover:text-red-500 transition-colors"
                                 >
                                   <X className="w-3 h-3" />
                                 </button>
                              </div>
                            </>
                          )}
                       </div>
                     ))}
                     
                     {isAddingVariantType && (
                       <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-dashed border-brand-blue/30 shadow-sm">
                          <input 
                            type="text" 
                            placeholder="Nome parametro..."
                            value={newVariantTypeName}
                            onChange={e => setNewVariantTypeName(e.target.value)}
                            className="w-32 bg-gray-50 border-none rounded-lg px-3 py-1.5 text-[10px] font-bold focus:ring-1 focus:ring-brand-blue"
                            autoFocus
                          />
                          <button 
                            onClick={() => {
                               if (newVariantTypeName && setAvailableVariants) {
                                 setAvailableVariants([...availableVariants, newVariantTypeName]);
                                 setNewVariantTypeName("");
                                 setIsAddingVariantType(false);
                               }
                            }}
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setIsAddingVariantType(false);
                              setNewVariantTypeName("");
                            }}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                       </div>
                     )}
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4 flex items-center gap-2 opacity-60">
                    <Info className="w-3 h-3" /> Questi parametri saranno disponibili per tutti i prodotti dello store.
                  </p>
               </div>

               <div className="space-y-4">
                 {variants.map((v, i) => {
                 // Dynamic grid columns based on active channels + Total
                 let gridCols = 1; // Solo Web inizialmente
                 if (isAmazonActive) gridCols++;
                 if (isEbayActive) gridCols++;

                  return (
                     <div key={v.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                       <div className="flex flex-col lg:flex-row gap-6">
                         
                         {/* Col 1+2: Form fields */}
                         <div className="flex-1 flex flex-col gap-4">
                           
                           {/* Row 1: Variante & Valore */}
                           <div className="grid grid-cols-2 gap-4">
                             <div className="flex flex-col gap-1">
                               <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Variante</span>
                               <select 
                                 value={v.type}
                                 onChange={e => { const newV = [...variants]; newV[i].type = e.target.value; setVariants(newV); }}
                                 className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-black uppercase border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
                               >
                                 {availableVariants.map(type => (<option key={type} value={type}>{type}</option>))}
                               </select>
                             </div>
                             <div className="flex flex-col gap-1">
                               <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Valore</span>
                               <input 
                                 type="text" value={v.value ?? ""}
                                 onChange={e => {
                                   const val = e.target.value;
                                   const newV = [...variants]; 
                                   newV[i].value = val;
                                   newV[i].sku = `${sku}-${val}`.toUpperCase().replace(/\s+/g, '-');
                                   setVariants(newV);
                                 }}
                                 placeholder="es. XL, Rosso..." 
                                 className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-black uppercase border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all" 
                               />
                             </div>
                            </div>

                            {/* Row: Titolo & Nota */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Titolo Variante (Descrizione)</span>
                                <input 
                                  type="text" 
                                  value={v.title ?? ""}
                                  onChange={e => { const newV = [...variants]; newV[i].title = e.target.value; setVariants(newV); }}
                                  placeholder="es. Antifurto Bianco con sensore PIR"
                                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">Nota Variante (Opzionale)</span>
                                <input 
                                  type="text" 
                                  value={v.note ?? ""}
                                  onChange={e => { const newV = [...variants]; newV[i].note = e.target.value; setVariants(newV); }}
                                  placeholder="es. Spedizione rapida 24h"
                                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
                                />
                              </div>
                            </div>

                           {/* Row 2: SKU & EAN */}
                           <div className="grid grid-cols-2 gap-4">
                             <div className="flex flex-col gap-1">
                               <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1">SKU Variante</span>
                               <input 
                                 type="text" value={v.sku ?? ""}
                                 onChange={e => { const newV = [...variants]; newV[i].sku = e.target.value; setVariants(newV); }}
                                 placeholder="SKU-001"
                                 className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
                               />
                             </div>
                             <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center pl-1 w-full">
                                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">EAN Variante</span>
                                  <label className="inline-flex items-center cursor-pointer scale-75 origin-right">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer" 
                                      checked={v.showEan !== false} 
                                      onChange={e => { 
                                        const newV = [...variants]; 
                                        newV[i].showEan = e.target.checked; 
                                        setVariants(newV); 
                                      }} 
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue relative"></div>
                                    <span className="ml-2 text-[8px] font-black uppercase text-gray-400 peer-checked:text-brand-blue">Visibile</span>
                                  </label>
                                </div>
                               <input 
                                 type="text" value={v.ean ?? ""}
                                 onChange={e => { const newV = [...variants]; newV[i].ean = e.target.value; setVariants(newV); }}
                                 placeholder="801234..."
                                 className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[11px] font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
                               />
                             </div>
                           </div>

                           {/* Row 3: Logica Prezzo */}
                           <div className="flex flex-col gap-1 bg-blue-50/40 p-4 rounded-2xl border border-blue-100/60">
                             <span className="text-[9px] font-black uppercase text-brand-blue tracking-widest pl-1">Logica Prezzo Variante</span>
                             <div className="flex items-center gap-2 mt-1">
                               <select 
                                 value={v.costType}
                                 onChange={e => { const newV = [...variants]; newV[i].costType = e.target.value as any; setVariants(newV); }}
                                 className="flex-1 text-[11px] font-black uppercase bg-white rounded-lg px-3 py-2.5 border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 shadow-sm"
                               >
                                 <option value="fixed">Fisso €</option>
                                 <option value="delta">Delta €</option>
                                 <option value="percent">% Su Pubblico</option>
                               </select>
                               <input 
                                 type="number" 
                                 step="0.01" 
                                 value={v.costValue === 0 || v.costValue === undefined ? "" : v.costValue}
                                 placeholder="0.00"
                                 onChange={e => { 
                                   const val = e.target.value === "" ? 0 : Number(e.target.value);
                                   const newV = [...variants]; 
                                   newV[i].costValue = val; 
                                   setVariants(newV); 
                                 }}
                                 className="w-28 bg-white rounded-lg px-3 py-2.5 text-[12px] font-black text-center border border-gray-200 outline-none focus:ring-2 focus:ring-brand-blue/30 shadow-sm"
                               />
                             </div>
                           </div>

                           {/* Row 4: Stock Canali */}
                           <div className="grid gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                             <div className="flex flex-col gap-1">
                               <div className="flex items-center justify-between px-1">
                                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Webshop</span>
                                 <Globe className="w-3 h-3 text-indigo-300" />
                               </div>
                               <input 
                                 type="number" value={v.webStock ?? ""}
                                 onFocus={e => (v.webStock === 0 || v.webStock === ('' as any)) && ( () => { const newV = [...variants]; newV[i].webStock = '' as any; setVariants(newV); } )()}
                                 onChange={e => {
                                   const val = Number(e.target.value); const newV = [...variants]; newV[i].webStock = val;
                                   if (newV.length > 1 && i !== 0) { const otherSum = newV.reduce((acc, curr, idx) => idx === 0 ? acc : acc + Number(curr.webStock || 0), 0); newV[0].webStock = Math.max(0, webStock - otherSum); }
                                   setVariants(newV);
                                 }}
                                 className="w-full h-11 bg-white rounded-xl px-3 text-[14px] font-black text-center text-indigo-700 border border-indigo-100 focus:ring-2 focus:ring-indigo-300 transition-all" 
                               />
                             </div>
                             {isAmazonActive && (
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-center justify-between px-1">
                                   <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Amazon</span>
                                   <ExternalLink className="w-3 h-3 text-orange-300" />
                                 </div>
                                 <input 
                                   type="number" value={v.amazonStock ?? ""}
                                   onFocus={e => (v.amazonStock === 0 || v.amazonStock === ('' as any)) && ( () => { const newV = [...variants]; newV[i].amazonStock = '' as any; setVariants(newV); } )()}
                                   onChange={e => {
                                     const val = Number(e.target.value); const newV = [...variants]; newV[i].amazonStock = val;
                                     if (newV.length > 1 && i !== 0) { const otherSum = newV.reduce((acc, curr, idx) => idx === 0 ? acc : acc + Number(curr.amazonStock || 0), 0); newV[0].amazonStock = Math.max(0, amazonStock - otherSum); }
                                     setVariants(newV);
                                   }}
                                   className="w-full h-11 bg-white rounded-xl px-3 text-[14px] font-black text-center text-orange-600 border border-orange-100 focus:ring-2 focus:ring-orange-300 transition-all" 
                                 />
                               </div>
                             )}
                             {isEbayActive && (
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-center justify-between px-1">
                                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">eBay</span>
                                   <ExternalLink className="w-3 h-3 text-blue-300" />
                                 </div>
                                 <input 
                                   type="number" value={v.ebayStock ?? ""}
                                   onFocus={e => (v.ebayStock === 0 || v.ebayStock === ('' as any)) && ( () => { const newV = [...variants]; newV[i].ebayStock = '' as any; setVariants(newV); } )()}
                                   onChange={e => {
                                     const val = Number(e.target.value); const newV = [...variants]; newV[i].ebayStock = val;
                                     if (newV.length > 1 && i !== 0) { const otherSum = newV.reduce((acc, curr, idx) => idx === 0 ? acc : acc + Number(curr.ebayStock || 0), 0); newV[0].ebayStock = Math.max(0, ebayStock - otherSum); }
                                     setVariants(newV);
                                   }}
                                   className="w-full h-11 bg-white rounded-xl px-3 text-[14px] font-black text-center text-blue-600 border border-blue-100 focus:ring-2 focus:ring-blue-300 transition-all" 
                                 />
                               </div>
                             )}
                           </div>
                         </div>

                         {/* Col 3: Foto + Elimina */}
                         <div className="lg:w-[150px] flex-shrink-0 flex flex-col items-center gap-4">
                           <div className="flex flex-col items-center gap-2 w-full">
                             <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest text-center">Foto Variante</span>
                             <div
                               onClick={() => { setVariantImageTargetIndex(i); setIsVariantImageModalOpen(true); }}
                               className="w-[130px] h-[130px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[1.5rem] overflow-hidden cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center relative group/vimg"
                             >
                               {v.image ? (
                                 <>
                                   <img src={v.image} className="w-full h-full object-cover" alt="" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/vimg:opacity-100 transition-opacity flex items-center justify-center">
                                     <RefreshCw className="w-5 h-5 text-white" />
                                   </div>
                                 </>
                               ) : (
                                 <div className="flex flex-col items-center gap-2 text-gray-400 group-hover/vimg:text-brand-blue transition-colors">
                                   <Camera className="w-6 h-6" />
                                   <span className="text-[9px] font-black uppercase">Aggiungi</span>
                                 </div>
                               )}
                             </div>
                             {v.image && (
                               <button
                                 onClick={() => { const newV = [...variants]; newV[i].image = ""; setVariants(newV); }}
                                 className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors"
                               >Rimuovi</button>
                             )}
                           </div>
                           <div className="flex gap-2 w-full justify-center mt-auto">
                             <button
                               onClick={() => moveVariant(i, 'up')}
                               disabled={i === 0}
                               className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-brand-blue hover:text-white disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-500 rounded-xl transition-all"
                               title="Sposta Su"
                             >
                               <ChevronUp className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => moveVariant(i, 'down')}
                               disabled={i === variants.length - 1}
                               className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-brand-blue hover:text-white disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-500 rounded-xl transition-all"
                               title="Sposta Giù"
                             >
                               <ChevronDown className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                               className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                               title="Elimina Variante"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>

                       </div>
                     </div>
                 );
               })}
               
               <div className="flex justify-center pt-2">
                 <button 
                   onClick={() => setVariants([...variants, {
                     id: Math.random().toString(36).substr(2, 9),
                     type: availableVariants[0] || 'Colore', 
                     value: "", 
                     sku: sku ? `${sku}-` : "", 
                     title: "",
                     note: "",
                     costType: 'fixed',
                     costValue: baseCost,
                     webStock: variants.length === 0 ? webStock : 0,
                     amazonStock: variants.length === 0 ? amazonStock : 0,
                     ebayStock: variants.length === 0 ? ebayStock : 0,
                     ean: ""
                   }])} 
                   className="group flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-brand-yellow hover:text-brand-dark rounded-3xl border-2 border-dashed border-gray-200 hover:border-brand-yellow transition-all duration-300"
                 >
                   <Plus className="w-5 h-5 text-gray-400 group-hover:text-brand-dark" />
                   <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-dark">Aggiungi Nuova Variante Indipendente</span>
                 </button>
               </div>
            </div>
          </div>
            {/* Livello 3 e 4 opzionali rimangono in fondo */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2"><Layers className="w-5 h-5 text-gray-400"/> Tassonomia Avanzata Opzionale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Livello 3 (Optional)</span>
                  <input type="text" placeholder="es. Led Integrato" className="w-full bg-white border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold placeholder:text-gray-300" />
                </label>
                <label className="block">
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Livello 4 (Deep)</span>
                   <input type="text" placeholder="N/A" className="w-full bg-white border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold placeholder:text-gray-300" />
                </label>
              </div>
            </div>

          {/* DOCUMENTAZIONE PRODOTTO */}
          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-blue"/> Documentazione & Etichette
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Etichetta Energetica */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Etichetta Efficienza</span>
                  <Zap className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
                </div>
                
                <div className="aspect-[3/4] bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                  {energyLabel ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      {energyLabel.startsWith('data:application/pdf') ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-brand-yellow" />
                          <span className="text-[10px] font-black text-brand-yellow uppercase">Etichetta PDF</span>
                        </div>
                      ) : (
                        <img src={energyLabel} className="w-full h-full object-contain" alt="Energy Label" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {energyLabel.startsWith('data:application/pdf') && (
                          <button onClick={() => window.open(energyLabel)} className="p-2 bg-brand-yellow text-brand-dark rounded-lg"><ExternalLink className="w-4 h-4"/></button>
                        )}
                        <button onClick={() => setEnergyLabel("")} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-brand-blue transition-colors w-full h-full justify-center">
                      <Upload className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase">Carica JPG/PNG o PDF</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => setEnergyLabel(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">Visibile in scheda prodotto e area cliente</p>
              </div>

              {/* Scheda Prodotto (PDF) */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Scheda Tecnica (PDF)</span>
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] bg-white rounded-xl border-2 border-dashed border-gray-200 relative group">
                  {techSheet ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase">PDF Caricato</span>
                      <div className="flex gap-2">
                        <button onClick={() => window.open(techSheet)} className="p-2 bg-indigo-500 text-white rounded-lg"><ExternalLink className="w-4 h-4"/></button>
                        <button onClick={() => setTechSheet("")} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-indigo-600 transition-colors">
                      <Upload className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase">Carica PDF</span>
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => setTechSheet(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">Apertura diretta nel browser (No anteprima)</p>
              </div>

              {/* Manualistica (PDF) */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Manuale d'Uso (PDF)</span>
                  <Compass className="w-4 h-4 text-teal-400" />
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] bg-white rounded-xl border-2 border-dashed border-gray-200 relative group">
                  {manual ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                        <FileCode className="w-6 h-6 text-teal-600" />
                      </div>
                      <span className="text-[10px] font-black text-teal-600 uppercase">Manuale Caricato</span>
                      <div className="flex gap-2">
                        <button onClick={() => window.open(manual)} className="p-2 bg-teal-500 text-white rounded-lg"><ExternalLink className="w-4 h-4"/></button>
                        <button onClick={() => setManual("")} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer text-gray-400 hover:text-teal-600 transition-colors">
                      <Upload className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase">Carica PDF</span>
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => setManual(re.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">Istruzioni tecniche per l'utente</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-gray-400"/> Sincronizzazione Marketplace (Overrides)</h3>
            
            {/* AI Error Banner */}
            {aiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 flex items-start gap-3 text-sm font-medium">
                <span className="flex-1">{aiError}</span>
                <button onClick={() => setAiError(null)} className="text-red-400 hover:text-red-600 font-black text-lg leading-none">×</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amazon Block */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border border-orange-100 relative overflow-hidden group hover:border-orange-300 transition-all flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 text-orange-500 flex items-center justify-center rounded-xl"><Globe className="w-5 h-5" /></div>
                    <span className="font-black text-brand-dark uppercase tracking-tight">Amazon.it</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isAmazonActive} onChange={e => setIsAmazonActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 relative"></div>
                  </label>
                </div>
                <div className="space-y-4 relative z-10">
                  <label className="block">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block">Titolo Ottimizzato SEO</span>
                      <button 
                        type="button"
                        onClick={() => generateAIContent('Amazon')}
                        disabled={isGeneratingAmazon}
                        className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all disabled:opacity-50"
                      >
                        {isGeneratingAmazon ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Auto-Componi
                      </button>
                    </div>
                    <input type="text" value={amazonTitle} onChange={e => setAmazonTitle(toProperCase(e.target.value))} placeholder="Override per Amazon..." className="w-full bg-white border-orange-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-orange-500 focus:border-orange-500" />
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Costo riferimento:</span>
                    <span className="text-[9px] font-black text-brand-dark">€{(Number(baseCost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Ricarico (%)</span>
                      <input type="number" value={amazonMarkup} onFocus={e => amazonMarkup === 0 && setAmazonMarkup('' as any)} onChange={e => setAmazonMarkup(Number(e.target.value))} className="w-full bg-white border-orange-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-orange-500 focus:border-orange-500" />
                    </label>
                    <label className="block relative">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Prezzo Finale (Manuale)</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">€</span>
                        <input type="number" value={amazonManualPrice || (amazonPrice ? amazonPrice.toFixed(2) : "0.00")} onFocus={e => (amazonManualPrice === "0" || amazonManualPrice === "") && setAmazonManualPrice('')} onChange={e => setAmazonManualPrice(e.target.value)} className={`w-full bg-orange-500 text-white border-none rounded-xl pl-7 pr-2 py-3 text-sm font-black focus:ring-2 focus:ring-orange-300 ${amazonManualPrice ? 'ring-2 ring-orange-200' : ''}`} />
                        {amazonManualPrice && <button onClick={() => setAmazonManualPrice("")} className="absolute -bottom-4 right-0 text-[8px] font-black text-orange-600 uppercase">Reset</button>}
                      </div>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Esenzione GTIN</span>
                    <select className="w-full bg-white border-orange-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-orange-500 focus:border-orange-500">
                      <option>Nessuna (EAN Base)</option>
                      <option>Sì, approvata su Brand</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Descrizione Ottimizzata Amazon</span>
                    <textarea 
                      rows={3} 
                      value={amazonDescription}
                      onChange={e => setAmazonDescription(e.target.value)}
                      placeholder="Descrizione specifica per Amazon (Bullet points ecc)..." 
                      className="w-full bg-white border-orange-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-orange-500 focus:border-orange-500 resize-none"
                    ></textarea>
                  </label>
                </div>
              </div>

              {/* eBay Block */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group hover:border-blue-300 transition-all flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 text-blue-500 flex items-center justify-center rounded-xl"><ExternalLink className="w-5 h-5" /></div>
                    <span className="font-black text-brand-dark uppercase tracking-tight">eBay</span>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isEbayActive} onChange={e => setIsEbayActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 relative"></div>
                  </label>
                </div>
                <div className="space-y-4 relative z-10">
                  <label className="block">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">Titolo + Sottotitolo Store</span>
                      <button 
                        type="button"
                        onClick={() => generateAIContent('eBay')}
                        disabled={isGeneratingEbay}
                        className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-200 transition-all disabled:opacity-50"
                      >
                        {isGeneratingEbay ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Auto-Componi
                      </button>
                    </div>
                    <input type="text" value={ebayTitle} onChange={e => setEbayTitle(toProperCase(e.target.value))} placeholder="Titolo per inserzione eBay..." className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-blue-500 focus:border-blue-500" />
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Costo riferimento:</span>
                    <span className="text-[9px] font-black text-brand-dark">€{(Number(baseCost) || 0).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Ricarico (%)</span>
                      <input type="number" value={ebayMarkup} onFocus={e => ebayMarkup === 0 && setEbayMarkup('' as any)} onChange={e => setEbayMarkup(Number(e.target.value))} className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-blue-500 focus:border-blue-500" />
                    </label>
                    <label className="block relative">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Prezzo Finale (Manuale)</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">€</span>
                        <input type="number" value={ebayManualPrice || ebayPrice.toFixed(2)} onFocus={e => (ebayManualPrice === "0" || ebayManualPrice === "") && setEbayManualPrice('')} onChange={e => handleManualPrice(e.target.value, 'ebay')} className={`w-full bg-blue-500 text-white border-none rounded-xl pl-7 pr-2 py-3 text-sm font-black focus:ring-2 focus:ring-blue-300 ${ebayManualPrice ? 'ring-2 ring-blue-200' : ''}`} />
                        {ebayManualPrice && <button onClick={() => setEbayManualPrice("")} className="absolute -bottom-4 right-0 text-[8px] font-black text-blue-600 uppercase">Reset</button>}
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Comm. (%)</span>
                      <input type="number" defaultValue="11" className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-blue-500 focus:border-blue-500" />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Condizioni</span>
                      <select className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-blue-500 focus:border-blue-500">
                        <option>Nuovo</option>
                        <option>Usato</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Descrizione Ottimizzata eBay</span>
                    <textarea 
                      rows={3} 
                      value={ebayDescription}
                      onChange={e => setEbayDescription(e.target.value)}
                      placeholder="HTML/Descrizione specifica per eBay..." 
                      className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-blue-500 focus:border-blue-500 resize-none"
                    ></textarea>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Prodotti Correlati */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2"><LinkIcon className="w-5 h-5 text-gray-400"/> Upsell & Cross-sell (Correlati)</h3>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-200">
               <label className="block relative">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-2 block">Imposta Prodotti Correlati Manualmente</span>
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input
                     type="text"
                     value={relatedSearchTerm}
                     onChange={e => {
                       setRelatedSearchTerm(e.target.value);
                       setIsSearchingRelated(e.target.value.length > 0);
                     }}
                     onFocus={() => setIsSearchingRelated(relatedSearchTerm.length > 0)}
                     placeholder="Cerca prodotto da collegare..."
                     className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-brand-blue"
                   />
                 </div>
                 {isSearchingRelated && (
                   <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                     {allProducts?.filter(p => p.id !== initialData?.id && (p.name || "").toLowerCase().includes(relatedSearchTerm.toLowerCase())).map(p => (
                       <div
                         key={`search-${p.id}`}
                         className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                         onClick={() => {
                           if (!relatedProductIds.includes(p.id)) {
                             setRelatedProductIds([...relatedProductIds, p.id]);
                           }
                           setRelatedSearchTerm("");
                           setIsSearchingRelated(false);
                         }}
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                             <img src={p.image} className="w-full h-full object-cover" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-brand-dark line-clamp-1">{p.name}</p>
                             <p className="text-[9px] font-black uppercase text-gray-400">{p.sku || p.id}</p>
                           </div>
                         </div>
                         <Plus className="w-4 h-4 text-brand-blue" />
                       </div>
                     ))}
                   </div>
                 )}
               </label>
               
               {relatedProductIds.length > 0 && (
                 <div className="mt-6 flex flex-col gap-2">
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Prodotti Collegati ({relatedProductIds.length})</span>
                   {relatedProductIds.map(id => {
                     const p = allProducts?.find((x: any) => x.id === id);
                     return p ? (
                       <div key={`rel-${id}`} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                         <div className="flex items-center gap-3">
                           <img src={p.image} className="w-8 h-8 rounded-md object-cover" />
                           <span className="text-xs font-bold text-brand-dark">{p.name}</span>
                         </div>
                         <button onClick={() => setRelatedProductIds(relatedProductIds.filter(x => x !== id))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ) : null;
                   })}
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mt-10">
               <h3 className="text-lg font-black uppercase tracking-widest text-brand-dark flex items-center gap-2">
                 <Search className="w-5 h-5 text-gray-400"/> SEO & Google Search Console
               </h3>
               <button 
                onClick={() => {
                  setMetaTitle(`${title} | Acquista su BesPoint`);
                  setMetaDescription(productDescription.substring(0, 155) + "...");
                }}
                className="text-[10px] font-black uppercase bg-brand-yellow/10 text-brand-dark px-3 py-1.5 rounded-lg border border-brand-yellow/20 hover:bg-brand-yellow transition-all"
               >
                 Auto-Genera SEO
               </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <label className="block">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1 block">Meta Title (Sito Web)</span>
                 <input 
                   id="seo-title" 
                   type="text" 
                   value={metaTitle}
                   onChange={e => setMetaTitle(e.target.value)}
                   placeholder="Titolo SEO ottimizzato per Google..." 
                   className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-brand-blue focus:border-brand-blue" 
                 />
               </label>
               <label className="block">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1 block">Meta Description (Sito Web)</span>
                 <textarea 
                   id="seo-desc" 
                   rows={3} 
                   value={metaDescription}
                   onChange={e => setMetaDescription(e.target.value)}
                   placeholder="Descrizione persuasiva per aumentare i click sui motori di ricerca..." 
                   className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-brand-blue focus:border-brand-blue resize-none"
                 ></textarea>
               </label>

               <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-gray-100 space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Anteprima Risultato Google (Desktop)</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#202124]">
                       <span>https://bespoint.it</span>
                       <ChevronDown className="w-2.5 h-2.5 text-[#5f6368] rotate-270" />
                       <span className="text-[#5f6368]">prodotti</span>
                    </div>
                    <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight mb-1">
                      {metaTitle || "Titolo Prodotto Ottimizzato | BesPoint Shop"}
                    </div>
                    <p className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-2">
                       {metaDescription || "Questa è la descrizione che apparirà su Google. Deve essere accattivante per convincere gli utenti a cliccare sul tuo prodotto."}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Sezione Logistica - FULL WIDTH BLOCK spostata alla fine */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 space-y-8 mt-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-brand-dark leading-none">Logistica & Partner di Spedizione</h4>
                <div className="flex items-center gap-2 mt-2">
                   <span className="w-6 h-1 bg-indigo-500 rounded-full" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Configurazione Automazione Consegne</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3 ml-2 block group-hover:text-indigo-500 transition-colors">Corriere Predefinito per questo Prodotto (Sito & Marketplace)</span>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setIsCourierDropdownOpen(!isCourierDropdownOpen)}
                >
                  <div className="w-full pl-8 pr-16 py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] text-base font-medium focus:border-indigo-500 flex items-center">
                    <span className="font-extrabold mr-2 tracking-tighter uppercase">{selectedCourier}</span>
                    <span className="text-gray-400 text-sm italic font-normal">
                      — {COURIER_OPTIONS.find(c => c.name === selectedCourier)?.details?.split(' — ')?.[1] || COURIER_OPTIONS.find(c => c.name === selectedCourier)?.details || "Standard Nazione"}
                    </span>
                  </div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-indigo-500 rounded-2xl transition-transform group-hover:scale-110">
                    <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isCourierDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isCourierDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 bottom-[calc(100%+12px)] bg-white border border-gray-100 rounded-[2.5rem] p-4 z-50 space-y-2 origin-bottom"
                    >
                      {COURIER_OPTIONS.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => {
                            setSelectedCourier(option.name);
                            setIsCourierDropdownOpen(false);
                          }}
                          className={`w-full text-left px-6 py-4 rounded-[1.5rem] transition-all flex items-center ${selectedCourier === option.name ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          <span className={`${selectedCourier === option.name ? 'font-black' : 'font-extrabold'} text-sm tracking-tighter uppercase mr-3`}>
                            {option.name}
                          </span>
                          <span className={`text-xs ${selectedCourier === option.name ? 'text-white/70' : 'text-gray-400'} font-medium italic`}>
                            {option.details}
                          </span>
                          {selectedCourier === option.name && <Check className="ml-auto w-5 h-5" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div 
                className="flex items-center gap-6 bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <div className="w-14 h-14 rounded-[1.2rem] bg-white flex items-center justify-center shrink-0">
                  <Info className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="text-[13px] font-medium text-indigo-700/80 italic leading-relaxed tracking-tight">
                  <span className="font-extrabold uppercase">Logistica Attiva:</span> L'impostazione rifletterà la logistica principale di questo prodotto sul frontend. 
                  In caso di checkout Multi-Corriere, il sistema darà priorità a questa configurazione per il calcolo volumetrico e delle commissioni.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna DX: Media & Pricing Engine */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="sticky top-28 space-y-8">
            
            {/* Galleria Media */}




            <button 
              onClick={handleSave}
              className="w-full bg-brand-yellow text-brand-dark px-8 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-yellow-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 mb-4"
            >
              <Check className="w-6 h-6" />
              Salva e Pubblica
            </button>

            {initialData?.id && (
              <button 
                onClick={() => onDelete?.(initialData.id)}
                className="w-full bg-red-50 text-red-500 border border-red-100 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                Elimina Prodotto
              </button>
            )}
           </div>
         </div>
       </div>
     </div>
   </div>




    {/* Modal Importazione Immagine */}
    <AnimatePresence>
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            onClick={() => {
              setIsImageModalOpen(false);
              setReplacingImageIndex(null);
            }}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 overflow-hidden"
          >
            <button onClick={() => {
              setIsImageModalOpen(false);
              setReplacingImageIndex(null);
            }} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8 text-center md:text-left">
              <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">
                {replacingImageIndex !== null ? 'Sostituisci Immagine' : 'Importa Media'}
              </h3>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">
                {replacingImageIndex !== null ? `Stai sostituendo l'immagine posizione #${replacingImageIndex + 1}` : 'Scegli come caricare la tua immagine prodotto'}
              </p>
            </div>

            <div className="space-y-6">
              {/* Opzione 1: Local Upload */}
              <label className="block group cursor-pointer">
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50 group-hover:bg-brand-blue/5 group-hover:border-brand-blue transition-all">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-brand-blue" />
                  </div>
                  <span className="text-xs font-black uppercase text-gray-700">Carica dal Dispositivo</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">JPG, PNG, WEBP (MAX 5MB)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </label>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-gray-100 flex-1"></div>
                <span className="text-[10px] font-black text-gray-300 uppercase">Oppure tramite Link</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              {/* Opzione 2: URL Input */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="url" 
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    placeholder="Incolla URL immagine (es. https://...)" 
                    className="w-full pl-16 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-brand-yellow focus:bg-white placeholder:text-gray-300 transition-all border-none outline-none"
                  />
                </div>
                <button 
                  onClick={addImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="w-full py-4 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Importa Media da Link
                </button>
              </div>
            </div>

            <p className="text-[9px] text-gray-400 font-bold text-center mt-8 italic">
              * La prima immagine della galleria sarà quella principale.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Modal Immagine Variante */}
    <AnimatePresence>
      {isVariantImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            onClick={() => { setIsVariantImageModalOpen(false); setVariantImageTargetIndex(null); }}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 overflow-hidden"
          >
            <button onClick={() => { setIsVariantImageModalOpen(false); setVariantImageTargetIndex(null); }} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-8 text-center md:text-left">
              <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Foto Variante</h3>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">
                {variantImageTargetIndex !== null ? `Variante #${variantImageTargetIndex + 1}` : ''} — carica o incolla un link
              </p>
            </div>
            <div className="space-y-6">
              <label className="block group cursor-pointer">
                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50 group-hover:bg-brand-blue/5 group-hover:border-brand-blue transition-all">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-brand-blue" />
                  </div>
                  <span className="text-xs font-black uppercase text-gray-700">Carica dal Dispositivo</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">JPG, PNG, WEBP (MAX 5MB)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleVariantImageUpload} />
                </div>
              </label>
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-gray-100 flex-1"></div>
                <span className="text-[10px] font-black text-gray-300 uppercase">Oppure tramite Link</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="url" value={variantImageUrlInput}
                    onChange={e => setVariantImageUrlInput(e.target.value)}
                    placeholder="Incolla URL immagine (es. https://...)" 
                    className="w-full pl-16 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:ring-brand-yellow focus:bg-white placeholder:text-gray-300 transition-all border-none outline-none"
                  />
                </div>
                <button 
                  onClick={addVariantImageUrl}
                  disabled={!variantImageUrlInput.trim()}
                  className="w-full py-4 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Importa Foto Variante da Link
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    {/* Modal Successo Salvataggio */}
     <AnimatePresence>
       {isSaveSuccess && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl"
             onClick={() => setIsSaveSuccess(false)}
           />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 overflow-hidden"
           >
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
             
             <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
             </div>
             
             <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Modifiche Salvate</h3>
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-8 leading-relaxed">
               I dati del prodotto sono stati aggiornati con successo nel database centrale di BesPoint.
             </p>
             
             <button 
               onClick={() => setIsSaveSuccess(false)}
               className="w-full py-4 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
             >
               Continua a Modificare
             </button>
             
             <button 
               onClick={() => {
                 setIsSaveSuccess(false);
                 onBack();
               }}
               className="w-full mt-3 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
             >
               Torna al Pannello Admin
             </button>
           </motion.div>
         </div>
       )}
     </AnimatePresence>
      <AnimatePresence>
        {isDescModalOpen && (
          <ExpandedDescriptionModal 
            isOpen={isDescModalOpen}
            onClose={() => setIsDescModalOpen(false)}
            value={productDescription}
            onChange={setProductDescription}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Modale Editor Espanso
const ExpandedDescriptionModal = ({ isOpen, onClose, value, onChange }: { isOpen: boolean, onClose: () => void, value: string, onChange: (v: string) => void }) => {
  const [tempValue, setTempValue] = useState(value);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/90 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-6xl h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter">Editor Descrizione Avanzato</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestione professionale dei contenuti</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-gray-50 text-gray-400 hover:bg-brand-blue hover:text-white rounded-2xl transition-all flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-gray-50/50">
          <div className="h-full bg-white rounded-3xl shadow-inner border border-gray-100 overflow-hidden">
             <MasterRichEditor 
                value={tempValue}
                onChange={setTempValue}
                placeholder="Inizia a scrivere la descrizione estesa..."
                minHeight="100%"
             />
          </div>
        </div>
        
        <div className="p-8 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[11px] font-black uppercase hover:bg-gray-200 transition-all font-bold"
          >
            Annulla Modifiche
          </button>
          <button 
            onClick={() => {
              onChange(tempValue);
              onClose();
            }}
            className="px-8 py-4 bg-brand-blue text-white rounded-2xl text-[11px] font-black uppercase hover:bg-brand-dark shadow-xl transition-all flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            Salva e Conferma
          </button>
        </div>
      </motion.div>
    </div>
  );
};
