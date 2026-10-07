export type OrderLine = {
  slug: string;
  pdpSlug: string;
  name: string;
  displayName: string;
  priceCents: number;
  imageSrc: string;
  imageAlt: string;
  formats: string[];
  formatsLabel: string;
  sizeLabel: string;
  stitchLabel: string;
  packagePath?: string | undefined;
  packageFileName?: string | undefined;
};

export type OrderPaymentStatus = "pending" | "paid" | "failed";

export type OrderRecord = {
  id: string;
  email: string;
  contactName?: string | undefined;
  phone?: string | undefined;
  createdAt: string;
  totalCents: number;
  discountCents: number;
  paymentStatus: OrderPaymentStatus;
  paymentProvider?: string | undefined;
  paymentReference?: string | undefined;
  paidAt?: string | undefined;
  lines: OrderLine[];
};
