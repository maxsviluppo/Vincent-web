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
    ean?: string;
    webStock: number;
    amazonStock: number;
    ebayStock: number;
    image?: string;
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

export interface CompanySettings {
  logo: string;
  imageLogo: string;
  favicon: string;
  name: string;
  legalName: string;
  vatNumber: string;
  sdiCode: string;
  legalAddress: string;
  phone: string;
  email: string;
  bioLink: string;
  mission: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  googleVerificationTag: string;
  googleAnalyticsId: string;
  googleAnalyticsSnippet: string;
  adsTxtContent: string;
  customGeminiKey: string;
  orderStatusSenderEmail: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  customer?: string;
  address?: string;
}
