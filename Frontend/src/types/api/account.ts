export type AccountSettings = {
  firstName: string;
  lastName: string;
  displayName: string;
  country: string;
  preferredFormat: "PES" | "DST" | "JEF" | "all";
  rememberFormat: boolean;
  openDownloadInstructions: boolean;
};

export type DownloadLibraryItem = {
  key: string;
  orderId: string;
  orderCreatedAt: string;
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
};
