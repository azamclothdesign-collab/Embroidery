import {
  cookiePolicyHref,
  licensingHref,
  privacyHref,
  refundPolicyHref,
  termsHref,
} from "@/constants/siteNavigation";

export const legalNavItems = [
  { href: licensingHref, label: "License & Usage" },
  { href: refundPolicyHref, label: "Refund Policy" },
  { href: privacyHref, label: "Privacy" },
  { href: termsHref, label: "Terms" },
  { href: cookiePolicyHref, label: "Cookies" },
] as const;

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs: readonly string[];
};

export type LegalPageContent = {
  eyebrow: string;
  heading: string;
  intro: string;
  pendingNotice: string;
  sections: readonly LegalSection[];
};

export const legalSharedCopy = {
  pendingNotice:
    "Full legal wording for this page is pending the client’s approved policy text. Sections below include only confirmed product facts plus placeholders so the structure is ready for the final copy.",
  relatedHeading: "Related Policies",
  contactHeading: "Questions About These Policies?",
  contactBody:
    "If you need help with a purchase, download, or policy question, contact support.",
  contactCta: "Contact Support",
  tocLabel: "On this page",
} as const;

export const licensePageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "License & Usage Policy",
  intro:
    "This page will explain how purchased embroidery designs may be used. Until the client’s full license is provided, only confirmed guidance appears below.",
  pendingNotice: legalSharedCopy.pendingNotice,
  sections: [
    {
      id: "overview",
      heading: "Overview",
      paragraphs: [
        "These files are sold as embroidery designs for you to stitch on your own projects.",
        "Please review the licensing information for each design before using it commercially or sharing the files.",
      ],
    },
    {
      id: "personal-use",
      heading: "Personal Use",
      paragraphs: [
        "Confirmed: designs are sold for stitching on your own projects.",
        "Detailed personal-use permissions (quantity limits, household use, and related rules) will be published when the client’s license text is provided.",
      ],
    },
    {
      id: "commercial-use",
      heading: "Commercial Use",
      paragraphs: [
        "Commercial use is not fully defined on this site yet. Do not assume commercial rights beyond what the final license states.",
        "When the approved license is available, this section will clarify whether finished physical products may be sold, and under what conditions.",
      ],
    },
    {
      id: "finished-products",
      heading: "Finished-Product Usage",
      paragraphs: [
        "Rules for selling or gifting finished embroidered goods will appear here from the client’s approved license.",
      ],
    },
    {
      id: "redistribution",
      heading: "File Redistribution",
      paragraphs: [
        "Sharing or redistributing the digital embroidery files themselves is a licensing matter. The final policy will state what is prohibited.",
        "Until that text is published, treat the digital files as licensed downloads for your stitching workflow—not files to redistribute.",
      ],
    },
    {
      id: "sharing",
      heading: "File Sharing",
      paragraphs: [
        "File-sharing permissions (including with contractors, digitizers, or collaborators) will be defined in the approved license.",
      ],
    },
    {
      id: "modification",
      heading: "Modification",
      paragraphs: [
        "Whether customers may edit, combine, or otherwise modify design files will be stated in the client’s license.",
      ],
    },
    {
      id: "reselling",
      heading: "Reselling",
      paragraphs: [
        "Reselling digital embroidery files will be addressed in the approved license. Do not assume resale rights for the digital files.",
      ],
    },
    {
      id: "marketplace",
      heading: "Marketplace Usage",
      paragraphs: [
        "Uploading purchased designs to other marketplaces or design libraries will be covered by the final license terms.",
      ],
    },
  ],
};

export const refundPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Refund & Digital Product Policy",
  intro:
    "Embroidery designs on this site are digital products. This page will state refund eligibility in the client’s approved language.",
  pendingNotice: legalSharedCopy.pendingNotice,
  sections: [
    {
      id: "digital-nature",
      heading: "Digital Product Nature",
      paragraphs: [
        "No physical product is shipped. You’re purchasing digital embroidery files.",
        "After successful payment, downloads are prepared for the formats included with each design (for named catalog designs, that currently includes PES, DST, and JEF where listed).",
      ],
    },
    {
      id: "eligibility",
      heading: "Refund Eligibility",
      paragraphs: [
        "Digital embroidery purchases are subject to the store’s refund terms.",
        "Specific eligibility rules (time limits, exclusions after download, and exceptions) will be published when the client’s refund policy is provided.",
      ],
    },
    {
      id: "wrong-format",
      heading: "Wrong Format",
      paragraphs: [
        "Use Machine Compatibility and the formats listed on each product page before purchasing.",
        "How wrong-format purchases are handled under refunds will follow the approved policy. Until then, contact support with your order details and machine information.",
      ],
    },
    {
      id: "duplicate-purchase",
      heading: "Duplicate Purchase",
      paragraphs: [
        "Duplicate-purchase handling will be defined in the approved refund policy. Contact support with both order references if you believe you purchased the same design twice.",
      ],
    },
    {
      id: "corrupt-file",
      heading: "Corrupt or Incomplete File",
      paragraphs: [
        "If a download appears corrupt or incomplete, contact support and include your order number and the format you attempted to download.",
        "Replacement or refund outcomes for file issues will follow the approved digital product policy.",
      ],
    },
    {
      id: "download-problems",
      heading: "Download Problems",
      paragraphs: [
        "After purchase, downloads are available from the order success experience and, when available on this device, from Orders and My Downloads.",
        "If you cannot access files, contact support with your order number and the format you need.",
      ],
    },
    {
      id: "support-process",
      heading: "Support Process",
      paragraphs: [
        "Use Contact to send a support request about downloads, formats, or order questions.",
        "Include your order number when available so the team can locate the purchase.",
      ],
    },
  ],
};

export const privacyPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Privacy Policy",
  intro:
    "This privacy policy page will describe how personal information is collected and used once the client’s approved policy is provided.",
  pendingNotice: legalSharedCopy.pendingNotice,
  sections: [
    {
      id: "overview",
      heading: "Overview",
      paragraphs: [
        "We only use the information you provide through Contact to respond to your request and provide customer support, subject to this Privacy Policy once fully published.",
        "Checkout on this device currently collects an email address for the local order confirmation experience. Broader account and marketing data practices will be described in the approved privacy text.",
      ],
    },
    {
      id: "information-we-collect",
      heading: "Information We Collect",
      paragraphs: [
        "Pending client policy: categories of information collected (account, checkout, support, analytics) will be listed here.",
      ],
    },
    {
      id: "how-we-use",
      heading: "How We Use Information",
      paragraphs: [
        "Pending client policy: purposes such as fulfilling orders, providing downloads, customer support, and site improvement will be described here.",
      ],
    },
    {
      id: "sharing",
      heading: "Sharing & Processors",
      paragraphs: [
        "Pending client policy: payment providers, hosting, and other processors will be named when selected and approved for disclosure.",
      ],
    },
    {
      id: "retention",
      heading: "Retention",
      paragraphs: [
        "Pending client policy: retention periods for account, order, and support records will appear here.",
      ],
    },
    {
      id: "rights",
      heading: "Your Rights",
      paragraphs: [
        "Pending client policy: access, correction, deletion, and related rights will be described according to applicable law and the client’s process.",
      ],
    },
    {
      id: "contact",
      heading: "Privacy Contact",
      paragraphs: [
        "For privacy questions, use Contact Support. A dedicated privacy contact will be published if the client provides one.",
      ],
    },
  ],
};

export const termsPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Terms & Conditions",
  intro:
    "These Terms & Conditions will govern website use, purchases, and related rules once the client’s approved terms are provided.",
  pendingNotice: legalSharedCopy.pendingNotice,
  sections: [
    {
      id: "website-usage",
      heading: "Website Usage",
      paragraphs: [
        "Pending client terms: acceptable use of the website, content, and accounts will be defined here.",
      ],
    },
    {
      id: "account-rules",
      heading: "Account Rules",
      paragraphs: [
        "Account sign-in is not fully connected yet. When accounts are available, rules for registration, security, and access will appear in the approved terms.",
      ],
    },
    {
      id: "purchases",
      heading: "Purchases",
      paragraphs: [
        "Checkout creates a digital purchase for embroidery designs listed in the catalog. Amounts shown are display values until a payment provider is connected.",
      ],
    },
    {
      id: "digital-products",
      heading: "Digital Products",
      paragraphs: [
        "No physical product is shipped. You’re purchasing digital embroidery files available after successful payment.",
      ],
    },
    {
      id: "licensing",
      heading: "Licensing",
      paragraphs: [
        "These files are sold as embroidery designs for you to stitch on your own projects.",
        "See the License & Usage Policy for the structured license topics; full commercial and redistribution rules await the client’s license text.",
      ],
    },
    {
      id: "ip",
      heading: "Intellectual Property",
      paragraphs: [
        "Pending client terms: ownership of designs, trademarks, and site content will be stated here.",
      ],
    },
    {
      id: "payments",
      heading: "Payments",
      paragraphs: [
        "Pending client terms: payment providers, currency, taxes, and failed-payment rules will be published when payment processing is connected.",
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      paragraphs: [
        "Digital embroidery purchases are subject to the store’s refund terms. See the Refund & Digital Product Policy.",
      ],
    },
    {
      id: "liability",
      heading: "Liability",
      paragraphs: [
        "Pending client terms: disclaimers and limitation of liability will appear here in approved legal language.",
      ],
    },
    {
      id: "termination",
      heading: "Account Termination",
      paragraphs: [
        "Pending client terms: suspension and termination rules will be published when accounts are connected.",
      ],
    },
  ],
};

export const cookiePageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Cookie Policy",
  intro:
    "This page explains cookies and similar storage used by the site. Analytics and marketing cookies are not currently implemented in the frontend.",
  pendingNotice: legalSharedCopy.pendingNotice,
  sections: [
    {
      id: "what-are-cookies",
      heading: "What Are Cookies?",
      paragraphs: [
        "Cookies and similar technologies help websites remember preferences, keep sessions working, and—when enabled—measure traffic.",
      ],
    },
    {
      id: "essential",
      heading: "Essential / Local Storage on This Device",
      paragraphs: [
        "This frontend currently uses browser storage for cart lines, wishlist items, local order history, and account preferences on this device.",
        "These are required for shopping, saving designs, and revisiting purchases on the same browser while you are signed in.",
      ],
    },
    {
      id: "analytics",
      heading: "Analytics & Marketing Cookies",
      paragraphs: [
        "No analytics or marketing cookie integrations are present in the current frontend codebase.",
        "If the client later enables analytics or advertising cookies, this section will be updated with the tools used, purposes, and choices available.",
      ],
    },
    {
      id: "choices",
      heading: "Your Choices",
      paragraphs: [
        "You can clear site data from your browser settings. Clearing storage removes local cart, wishlist, preferences, and on-device order history.",
        "A cookie preference center will be added if non-essential cookies are introduced.",
      ],
    },
    {
      id: "updates",
      heading: "Updates",
      paragraphs: [
        "This Cookie Policy will be revised when the client’s approved cookie language is provided or when new cookie technologies are added.",
      ],
    },
  ],
};

export function legalPageHref(locale: string, href: string): string {
  return `/${locale}${href}`;
}
