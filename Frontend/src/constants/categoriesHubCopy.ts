export const categoriesHubCopy = {
  metaTitle: "Categories | Embroidery Designs",
  metaDescription:
    "Browse embroidery design categories — floral, animals, monograms, seasonal, and more.",
  eyebrow: "Shop by theme",
  heading: "Find Designs By Category.",
  body: "Explore embroidery collections by theme. Open a category to browse designs ready for your machine.",
  designSingular: "Design",
  designPlural: "Designs",
  browseAll: "Browse All Designs",
  emptyNote: "More designs arrive as the catalog grows.",
} as const;

import { shopCategoryChips } from "@/constants/shopCatalog";

const categoryImages = [
  "designOne.jfif",
  "designTwo.jpeg",
  "designThree.webp",
  "designFour.jfif",
  "designFive.jfif",
  "designSix.jfif",
  "designSeven.jpg",
  "designEight.jpg",
  "designNine.jfif",
  "designTen.jpg",
  "designEleven.jfif",
  "butterRadiance.webp",
  "iznikMaxiFrock.webp",
  "sapphireSunAzure.webp",
  "whatsAppImage.jpeg",
  "bd2506b.webp",
  "imagesTwo.jfif",
  "stardomElafLime.webp",
  "stardomElafGlamorous.webp",
];

const exactImages: Record<string, string> = {
  "wilcom-embroidery-software": "cat_wilcom.jpg",
  "embroidery-digitizing-course": "cat_course.jpg",
  "step-by-step-embroidery-digitizing-guide": "cat_guide.jpg",
  "cap-cart-embroidery": "cat_cap_cart.jpg",
  "anarkali-kurti-shirt-embroidery": "cat_anarkali.jpg",
  "maxi-lehenga-embroidery": "cat_maxi.jpg",
  "sherwani-embroidery": "cat_sherwani.jpg",
  "shawl-embroidery": "cat_shawl.jpg",
  "neckline-embroidery": "cat_neckline.jpg",
  "gala-daman-embroidery": "cat_gala_daman.jpg",
  "gala-daman-sequins-embroidery": "cat_gala_daman_sequins.jpg",
  "all-over-embroidery": "cat_all_over.jpg",
  "motif-embroidery": "cat_motif.jpg",
  "velvet-embroidery": "cat_velvet.jpg",
  "cotton-embroidery": "cat_cotton.jpg",
  "shaneel-embroidery": "cat_shaneel.jpg",
  "aari-embroidery": "cat_aari.jpg",
  "dori-embroidery": "cat_dori.jpg",
  "fancy-lace-embroidery": "cat_fancy_lace.jpg",
  "sequins-embroidery": "cat_sequins.jpg",
  "logo-embroidery": "cat_logo.jpg",
  "4-head-embroidery": "cat_4_head.jpg",
  "2-head-3-head-embroidery": "cat_2_head_3_head.jpg",
  "4-border-shawl": "cat_4_border_shawl.jpg",
  "islamic-embroidery": "cat_islamic.jpg",
};

export const categoryHubTiles = shopCategoryChips
  .filter((chip) => chip.id !== "all")
  .map((chip, index) => {
    const img = exactImages[chip.id] || categoryImages[index % categoryImages.length];
    return {
      id: chip.id,
      label: chip.label,
      imageSrc: `/assets/images/${img}`,
      imageAlt: chip.label + " designs",
    };
  });

export type CategoryHubTileId = (typeof categoryHubTiles)[number]["id"];
