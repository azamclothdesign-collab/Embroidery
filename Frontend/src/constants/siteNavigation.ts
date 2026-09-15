export const primaryNavItems = [
  { href: "/designs", label: "Designs" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
] as const;

export const shopDesignsHref = "/designs";
export const howItWorksHref = "/how-it-works";
export const guidesHref = "/guides";
export const wishlistHref = "/wishlist";
export const cartHref = "/cart";
export const checkoutHref = "/checkout";
export const accountHref = "/account";
export const accountSettingsHref = "/account/settings";
export const accountOrdersHref = "/account/orders";
export const accountDownloadsHref = "/account/downloads";
export const accountLoginHref = "/account/login";
export const accountRegisterHref = "/account/register";
export const accountForgotHref = "/account/forgot-password";
export const orderSuccessHref = "/order/success";
export const downloadsHref = "/account/downloads";
export const contactHref = "/contact";
export const helpCenterHref = "/help-center";
export const termsHref = "/terms";
export const privacyHref = "/privacy";
export const licensingHref = "/licensing";
export const refundPolicyHref = "/refund-policy";
export const cookiePolicyHref = "/cookie-policy";

export function orderDetailPath(orderId: string): string {
  return `/orders/${orderId}`;
}

export function orderSuccessPath(orderId: string): string {
  return `${orderSuccessHref}/${orderId}`;
}

export function isPrimaryNavCurrent(
  pathname: string,
  localeRoot: string,
  itemHref: string,
): boolean {
  const href = `${localeRoot}${itemHref}`;

  if (itemHref === shopDesignsHref) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}
