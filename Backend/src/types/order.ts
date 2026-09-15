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

export type OrderRecord = {
  id: string;
  email: string;
  createdAt: string;
  totalCents: number;
  discountCents: number;
  lines: OrderLine[];
};
