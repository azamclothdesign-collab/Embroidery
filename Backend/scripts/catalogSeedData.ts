export type SeedCategory = {
  id: string;
  label: string;
  sortOrder: number;
  isVisible: boolean;
};

export type SeedProduct = {
  slug: string;
  pdpSlug: string;
  name: string;
  categoryId: string;
  rating: number;
  priceCents: number;
  hoopSize: string;
  stitchCount: number;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  stitchedImageSrc?: string | undefined;
  stitchedImageAlt?: string | undefined;
  description: string;
  formats: string[];
};

const categoryLabels = [
  { id: "wilcom-embroidery-software", label: "Wilcom Embroidery Software" },
  { id: "embroidery-digitizing-course", label: "Embroidery Digitizing Course" },
  {
    id: "step-by-step-embroidery-digitizing-guide",
    label: "Step-by-Step Embroidery Digitizing Guide in Urdu/Hindi",
  },
  { id: "cap-cart-embroidery", label: "Cap & Cart Embroidery Designs" },
  {
    id: "anarkali-kurti-shirt-embroidery",
    label: "Anarkali, Kurti & Shirt Embroidery Designs",
  },
  { id: "maxi-lehenga-embroidery", label: "Maxi & Lehenga Embroidery Designs" },
  { id: "sherwani-embroidery", label: "Sherwani Embroidery Designs" },
  { id: "shawl-embroidery", label: "Shawl Embroidery Designs" },
  { id: "neckline-embroidery", label: "Neckline Embroidery Designs" },
  { id: "gala-daman-embroidery", label: "Gala Daman Embroidery Designs" },
  {
    id: "gala-daman-sequins-embroidery",
    label: "Gala Daman Sequins Embroidery Designs",
  },
  { id: "all-over-embroidery", label: "All-Over Embroidery Designs" },
  { id: "motif-embroidery", label: "Motif Embroidery Designs" },
  { id: "velvet-embroidery", label: "Velvet Embroidery Designs" },
  { id: "cotton-embroidery", label: "Cotton Embroidery Designs" },
  { id: "shaneel-embroidery", label: "Shaneel Embroidery Designs" },
  { id: "aari-embroidery", label: "Aari Embroidery Designs" },
  { id: "dori-embroidery", label: "Dori Embroidery Designs" },
  { id: "fancy-lace-embroidery", label: "Fancy Lace Embroidery Designs" },
  { id: "sequins-embroidery", label: "Sequins Embroidery Designs" },
  { id: "logo-embroidery", label: "Logo Embroidery Designs" },
  { id: "4-head-embroidery", label: "4-Head Embroidery Designs" },
  {
    id: "2-head-3-head-embroidery",
    label: "2-Head & 3-Head Embroidery Designs",
  },
  { id: "4-border-shawl", label: "4-Border Shawl Designs" },
  { id: "islamic-embroidery", label: "Islamic Embroidery Designs" },
] as const;

export const seedCategories: SeedCategory[] = categoryLabels.map(
  (category, index) => ({
    id: category.id,
    label: category.label,
    sortOrder: index,
    isVisible: true,
  }),
);

const defaultFormats = ["PES", "DST", "JEF"];

function productSeed(
  slug: string,
  name: string,
  categoryId: string,
  imageSrc: string,
  imageAlt: string,
): SeedProduct {
  return {
    slug,
    pdpSlug: slug,
    name,
    categoryId,
    rating: 4.9,
    formats: [...defaultFormats],
    priceCents: 499,
    hoopSize: '5 × 7"',
    stitchCount: 15000,
    badge: "Best Seller",
    imageSrc,
    imageAlt,
    stitchedImageSrc: imageSrc,
    stitchedImageAlt: `${name} stitched design`,
    description: `A professionally digitized ${name} embroidery design created for apparel, accessories, gifts, and creative embroidery projects.`,
  };
}

export const seedProducts: SeedProduct[] = [
  productSeed(
    "design-one",
    "Design One",
    "wilcom-embroidery-software",
    "/assets/images/designOne.jfif",
    "Design One embroidery design",
  ),
  productSeed(
    "design-two",
    "Design Two",
    "embroidery-digitizing-course",
    "/assets/images/designTwo.jpeg",
    "Design Two embroidery design",
  ),
  productSeed(
    "design-three",
    "Design Three",
    "step-by-step-embroidery-digitizing-guide",
    "/assets/images/designThree.webp",
    "Design Three embroidery design",
  ),
  productSeed(
    "design-four",
    "Design Four",
    "cap-cart-embroidery",
    "/assets/images/designFour.jfif",
    "Design Four embroidery design",
  ),
  productSeed(
    "design-five",
    "Design Five",
    "anarkali-kurti-shirt-embroidery",
    "/assets/images/designFive.jfif",
    "Design Five embroidery design",
  ),
  productSeed(
    "design-six",
    "Design Six",
    "maxi-lehenga-embroidery",
    "/assets/images/designSix.jfif",
    "Design Six embroidery design",
  ),
  productSeed(
    "design-seven",
    "Design Seven",
    "sherwani-embroidery",
    "/assets/images/designSeven.jpg",
    "Design Seven embroidery design",
  ),
  productSeed(
    "design-eight",
    "Design Eight",
    "shawl-embroidery",
    "/assets/images/designEight.jpg",
    "Design Eight embroidery design",
  ),
  productSeed(
    "design-nine",
    "Design Nine",
    "neckline-embroidery",
    "/assets/images/designNine.jfif",
    "Design Nine embroidery design",
  ),
  productSeed(
    "design-ten",
    "Design Ten",
    "gala-daman-embroidery",
    "/assets/images/designTen.jpg",
    "Design Ten embroidery design",
  ),
  productSeed(
    "design-eleven",
    "Design Eleven",
    "gala-daman-sequins-embroidery",
    "/assets/images/designEleven.jfif",
    "Design Eleven embroidery design",
  ),
  productSeed(
    "butter-radiance",
    "Butter Radiance",
    "all-over-embroidery",
    "/assets/images/butterRadiance.webp",
    "Butter Radiance embroidery design",
  ),
  productSeed(
    "iznik-maxi-frock",
    "Iznik Maxi Frock",
    "motif-embroidery",
    "/assets/images/iznikMaxiFrock.webp",
    "Iznik Maxi Frock embroidery design",
  ),
  productSeed(
    "sapphire-sun-azure",
    "Sapphire Sun Azure",
    "velvet-embroidery",
    "/assets/images/sapphireSunAzure.webp",
    "Sapphire Sun Azure embroidery design",
  ),
  productSeed(
    "whats-app-image",
    "WhatsApp Image",
    "cotton-embroidery",
    "/assets/images/whatsAppImage.jpeg",
    "WhatsApp Image embroidery design",
  ),
  productSeed(
    "bd2506b",
    "BD 2506B",
    "shaneel-embroidery",
    "/assets/images/bd2506b.webp",
    "BD 2506B embroidery design",
  ),
  productSeed(
    "images-two",
    "Images Two",
    "aari-embroidery",
    "/assets/images/imagesTwo.jfif",
    "Images Two embroidery design",
  ),
  productSeed(
    "stardom-elaf-lime",
    "Stardom Elaf Lime",
    "dori-embroidery",
    "/assets/images/stardomElafLime.webp",
    "Stardom Elaf Lime embroidery design",
  ),
  productSeed(
    "stardom-elaf-glamorous",
    "Stardom Elaf Glamorous",
    "fancy-lace-embroidery",
    "/assets/images/stardomElafGlamorous.webp",
    "Stardom Elaf Glamorous embroidery design",
  ),
];

export const seedAdmin = {
  email: "admin@example.com",
  password: "admin123",
} as const;
