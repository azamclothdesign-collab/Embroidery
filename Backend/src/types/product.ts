export type ShopProduct = {
  slug: string;
  pdpSlug: string;
  name: string;
  categoryId: string;
  rating: number;
  formats: string[];
  priceCents: number;
  hoopSize: string;
  stitchCount: number;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  stitchedImageSrc?: string | undefined;
  stitchedImageAlt?: string | undefined;
  description?: string | undefined;
  packagePath?: string | undefined;
  packageFileName?: string | undefined;
  isVisible?: boolean | undefined;
};

export type CategoryRecord = {
  id: string;
  label: string;
  sortOrder: number;
  isVisible: boolean;
  imageSrc?: string | undefined;
  imageAlt?: string | undefined;
};
