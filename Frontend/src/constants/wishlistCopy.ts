export const wishlistCopy = {
  heading: "My Saved Designs",
  body: "Your favorite embroidery designs, kept in one place.",
  support: "Save designs you love and come back whenever you're ready to create.",
  shopNow: "Shop Now",
  sortLabel: "Sort by",
  addToCart: "Add to Cart",
  adding: "Adding...",
  added: "Added",
  viewDesign: "View Design",
  remove: "Remove",
  unavailable: "Currently Unavailable",
  unavailableBody: "This design is currently unavailable.",
  removedToast: "Design removed from your saved designs.",
  undo: "Undo",
  errorToast: "Couldn't update your saved designs.",
  tryAgain: "Try Again",
  emptyHeading: "Nothing Saved Yet.",
  emptyBody:
    "When you find a design you love, save it here so you can easily come back to it later.",
  exploreDesigns: "Explore Designs",
  browseBestSellers: "Browse Best Sellers",
  popularHeading: "Start With Something Popular",
  popularCta: "Explore All Designs",
  machineHeading: "Not Sure Which File Format You Need?",
  machineBody: "Check your machine before choosing a design.",
  findMachine: "Find My Machine",
  exploreHeading: "Keep Exploring",
  finalPopulatedHeading: "Ready to Start Stitching?",
  finalPopulatedBody: "Your next project might already be saved.",
  viewCart: "View Cart",
  keepExploring: "Keep Exploring",
  finalEmptyHeading: "Find Something Worth Saving.",
  syncNotice:
    "Designs are saved on this device. Sign in to keep them with your account on this browser.",
  syncNoticeSignedIn:
    "Saved designs stay with your account on this browser.",
  syncCta: "Sign In",
  syncCtaAccount: "Go to Account",
} as const;

export const wishlistSortOptions = [
  { id: "recent", label: "Recently Saved" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
] as const;

export function formatSavedDesignCount(count: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(count);
  return count === 1
    ? `${formatted} Saved Design`
    : `${formatted} Saved Designs`;
}

export function formatSavedShortCount(count: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(count);
  return count === 1 ? `${formatted} Saved` : `${formatted} Saved`;
}
