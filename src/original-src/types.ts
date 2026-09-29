export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  category: string;
  subcategory?: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  specs: Record<string, string>;
  gallery: string[];
  has3D?: boolean;
  videoUrl?: string;
  isFeatured?: boolean;
  sku?: string;
  ean?: string;
  tags?: string[];
  stock?: number;
  amazonStock?: number;
  ebayStock?: number;
  weight?: number;
  amazonActive?: boolean;
  ebayActive?: boolean;
  courier?: string;
  relatedProductIds?: string[];
  isSpecialPromotion?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  cost?: number;
  markup?: number;
  amazonMarkup?: number;
  ebayMarkup?: number;
  vinceCommission?: number;
  amazonPrice?: string;
  ebayPrice?: string;
  amazonTitle?: string;
  ebayTitle?: string;
  amazonDescription?: string;
  ebayDescription?: string;
  variants?: {
    id: string;
    type: string;
    value: string;
    sku: string;
    title?: string;
    note?: string;
    ean?: string;
    showEan?: boolean;
    webStock: number;
    amazonStock: number;
    ebayStock: number;
    costType?: 'fixed' | 'delta' | 'percent';
    costValue?: number;
  }[];
  showBrand?: boolean;
  showEan?: boolean;
  energyLabel?: string;
  techSheet?: string;
  manual?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
