export const cartCopy = {
  eyebrow: "Digital embroidery checkout",
  heading: "Your Cart",
  body: "Review your designs, then pay to download each embroidery ZIP instantly.",
  promiseHeading: "Pay, then get your ZIP",
  promiseBody:
    "No shipping. After payment, your embroidery ZIP files are ready to download right away.",
  progressCart: "Cart",
  progressCheckout: "Pay",
  progressDownload: "Get ZIP",
  yourDesigns: "Your Designs",
  orderSummary: "Order Summary",
  subtotal: "Subtotal",
  discount: "Discount",
  total: "Total",
  checkout: "Continue to Pay",
  checkoutLoading: "Preparing secure checkout...",
  securePayment: "Secure payment",
  instantDelivery: "Instant ZIP download after payment",
  downloadAfter: "Download files after purchase",
  digitalNotice:
    "Digital products only. Pay securely, then download your embroidery ZIP — nothing is shipped.",
  secureCheckout: "Secure Checkout",
  secureBody: "Your payment information is securely processed.",
  continueShopping: "Continue Shopping",
  remove: "Remove",
  saveForLater: "Save for Later",
  instantDownload: "ZIP after payment",
  havePromo: "Have a promo code?",
  promoPlaceholder: "Enter promo code",
  apply: "Apply",
  promoInvalid: "That code isn't valid or has expired.",
  removedToast: "Design removed.",
  undo: "Undo",
  wishlistToast: "Added to your wishlist",
  emptyEyebrow: "Nothing here yet",
  emptyHeading: "Your Next Project Starts With a Design.",
  emptyBody:
    "Explore our collection of professionally digitized embroidery designs and find something worth stitching.",
  exploreDesigns: "Explore Designs",
  browsePopular: "Browse Popular Designs",
  exploreEyebrow: "Not sure what to stitch next?",
  exploreHeading: "Complete Your Project",
  exploreBody:
    "Browse the collection for designs that pair with what you're stitching now.",
  trustDownloadHeading: "1. Pay securely",
  trustDownloadBody: "Complete checkout with a secure payment.",
  trustFormatsHeading: "2. Get your ZIP",
  trustFormatsBody:
    "Download one embroidery ZIP for each design right after payment.",
  trustHelpHeading: "3. Stitch your project",
  trustHelpBody: "Open the files on your machine and start stitching.",
  somethingChanged: "Something Changed",
  somethingChangedBody:
    "One or more designs in your cart are no longer available. Please review your cart before continuing.",
  reviewCart: "Review Cart",
  embroideryDesign: "Embroidery Design",
} as const;

export const cartTrustItems = [
  {
    heading: cartCopy.trustDownloadHeading,
    body: cartCopy.trustDownloadBody,
  },
  {
    heading: cartCopy.trustFormatsHeading,
    body: cartCopy.trustFormatsBody,
  },
  {
    heading: cartCopy.trustHelpHeading,
    body: cartCopy.trustHelpBody,
  },
] as const;
