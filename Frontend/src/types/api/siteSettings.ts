export type SiteGlobalSettings = {
  brandName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  instagram: string;
  pinterest: string;
};

export type SiteHomeSection = {
  id: string;
  label: string;
  enabled: boolean;
};

export type SiteHomeSettings = {
  hero: {
    eyebrow: string;
    heading: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  sections: SiteHomeSection[];
};

export type SiteFaqItem = {
  question: string;
  answer: string;
  visible: boolean;
};

export type SiteFaqsSettings = {
  items: SiteFaqItem[];
};

export type SitePageItem = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
};

export type SitePagesSettings = {
  pages: SitePageItem[];
};
