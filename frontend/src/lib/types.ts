export type Locale = "en" | "ur";
export type Localized = { en: string; ur: string };

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  intro: Localized;
  seoTitle: Localized;
  seoDescription: Localized;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  productCount: number;
  updatedAt: string;
};

export type Product = {
  id: string;
  slug: string;
  category: { id: string; slug: string; name: Localized };
  name: Localized;
  description: Localized;
  priceMinor: number;
  salePriceMinor: number | null;
  formats: string[];
  hoopSize: string;
  stitchCount: number;
  images: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  seoTitle: Localized;
  seoDescription: Localized;
  publishedAt: string | null;
  updatedAt: string;
  package: { id: string; name: string; size: number; files: string[] } | null;
};

export type ProductPage = { items: Product[]; total: number; page: number; pages: number };

export type PublicMethod = {
  code: "payfast" | "jazzcash" | "easypaisa" | "bank" | "cod";
  kind: "gateway" | "manual";
  label: Localized;
  instructions: Localized;
  details: Record<string, string>;
};

export type Storefront = {
  store: {
    name: Localized;
    tagline: Localized;
    email: string;
    phone: string;
    whatsapp: string;
    address: Localized;
    logo: string;
    social: { facebook: string; instagram: string; youtube: string; tiktok: string };
    downloadLimit: number;
    accessDays: number;
  };
  home: {
    heading: Localized;
    text: Localized;
    primaryCta: Localized;
    secondaryCta: Localized;
    showNewArrivals: boolean;
    showSale: boolean;
    showHowItWorks: boolean;
    showFormats: boolean;
    showFaq: boolean;
  };
  announcement: { enabled: boolean; items: Localized[] };
  faq: { items: Array<{ q: Localized; a: Localized }> };
  seo: { titleSuffix: string; description: Localized };
  pages: Array<{ slug: string; title: Localized }>;
};

export type CmsPage = { slug: string; title: Localized; body: Localized; seoDescription: Localized; updatedAt: string };

export type Quote = {
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  couponCode: string | null;
  couponError: string | null;
  methods: PublicMethod[];
};

export type RedirectForm = { action: string; method: "POST"; fields: Record<string, string> };

export type CustomerOrder = {
  number: string;
  status: "pending_payment" | "awaiting_verification" | "paid" | "failed" | "cancelled" | "refunded";
  paymentMethod: PublicMethod["code"];
  method: { label: Localized; instructions: Localized; details: Record<string, string> } | null;
  customer: { name: string; email: string; phone: string };
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  couponCode: string | null;
  createdAt: string;
  paidAt: string | null;
  canPay: boolean;
  bankProof: { status: string; createdAt: string } | null;
  downloadLimit: number;
  lines: Array<{
    id: string;
    slug: string;
    name: Localized;
    image: string | null;
    priceMinor: number;
    downloadsLeft: number;
    downloadUrl: string | null;
  }>;
};

export function pick(value: Localized, locale: Locale): string {
  return locale === "ur" && value.ur.trim().length > 0 ? value.ur : value.en;
}
