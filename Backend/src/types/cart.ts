export type CartLine = {
  slug: string;
  pdpSlug: string;
  name: string;
  priceCents: number;
  imageSrc: string;
  imageAlt: string;
};

export type CartView = {
  lines: CartLine[];
};
