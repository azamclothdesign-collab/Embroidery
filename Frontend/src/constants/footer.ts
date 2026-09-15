export const footerCopy = {
  brand: "Embroidery",
  copyrightYear: "2026",
  tagline: "Beautiful embroidery designs, ready for your next creation.",
  newsletterHeading: "Newsletter",
  newsletterBody: "Get new designs and creative inspiration.",
  emailLabel: "Email Address",
  subscribe: "Subscribe",
} as const;

export const footerNavGroups = [
  {
    title: "Shop",
    links: [
      { href: "/designs", label: "Designs" },
      { href: "/categories", label: "Categories" },
      { href: "/#best-sellers", label: "Best Sellers" },
      { href: "/new-arrivals", label: "New Arrivals" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/licensing", label: "Licensing" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help-center", label: "Help Center" },
      { href: "/account/downloads", label: "My Downloads" },
      { href: "/account", label: "My Account" },
    ],
  },
] as const;

export const footerLegalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookie-policy", label: "Cookies" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/licensing", label: "Licensing" },
] as const;

export function footerHref(locale: string, href: string): string {
  return `/${locale}${href}`;
}
