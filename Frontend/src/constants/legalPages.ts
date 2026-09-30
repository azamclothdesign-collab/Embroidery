import {
  cookiePolicyHref,
  licensingHref,
  privacyHref,
  refundPolicyHref,
  shippingPolicyHref,
  termsHref,
} from "@/constants/siteNavigation";
import { businessContact } from "@/constants/businessContact";

export const legalNavItems = [
  { href: licensingHref, label: "License & Usage" },
  { href: refundPolicyHref, label: "Refund Policy" },
  { href: shippingPolicyHref, label: "Shipping & Service" },
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
  pendingNotice: "",
  relatedHeading: "Related Policies",
  contactHeading: "Questions About These Policies?",
  contactBody:
    "If you need help with a purchase, download, or policy question, contact support.",
  contactCta: "Contact Support",
  tocLabel: "On this page",
  lastUpdated: "Last updated: October 2026",
} as const;

const officeLines = [
  `Business: ${businessContact.brandLegalName}`,
  `Email: ${businessContact.email}`,
  `Phone / WhatsApp: ${businessContact.phoneDisplay}`,
  `Office: ${businessContact.address}`,
  `Website: ${businessContact.website}`,
] as const;

export const licensePageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "License & Usage Policy",
  intro:
    "This policy explains how you may use embroidery designs purchased from our store after payment and download.",
  pendingNotice: "",
  sections: [
    {
      id: "overview",
      heading: "Overview",
      paragraphs: [
        "Purchased designs are sold as digital embroidery files for you to stitch on your own projects.",
        "Each purchase grants a personal use license for the design files included in that order’s ZIP package, unless a specific product page states otherwise.",
      ],
    },
    {
      id: "personal-use",
      heading: "Personal Use",
      paragraphs: [
        "You may download the files for your own embroidery machine, stitch them on personal projects, and keep backup copies for your own use.",
        "You may stitch finished physical items for personal gifting.",
      ],
    },
    {
      id: "commercial-use",
      heading: "Commercial Use",
      paragraphs: [
        "You may sell finished physical products you embroider yourself using purchased designs, unless a product listing expressly restricts commercial use.",
        "Commercial use does not include reselling, sharing, or redistributing the digital design files themselves.",
      ],
    },
    {
      id: "redistribution",
      heading: "File Redistribution",
      paragraphs: [
        "You may not share, upload, sell, gift, or otherwise redistribute the digital embroidery files, ZIP packages, or converted formats to third parties.",
        "Uploading purchased designs to other marketplaces, file-sharing sites, or public libraries is prohibited.",
      ],
    },
    {
      id: "modification",
      heading: "Modification",
      paragraphs: [
        "You may resize or convert files as needed for your own machine workflow within the license for that purchase.",
        "Modified files remain subject to the same redistribution restrictions as the original files.",
      ],
    },
    {
      id: "contact",
      heading: "License Questions",
      paragraphs: [
        "For licensing questions, contact us using the details below.",
        ...officeLines,
      ],
    },
  ],
};

export const refundPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Refund & Return Policy",
  intro:
    "Our products are digital embroidery designs delivered electronically after successful payment. This policy explains when refunds may apply.",
  pendingNotice: "",
  sections: [
    {
      id: "digital-nature",
      heading: "Digital Product Nature",
      paragraphs: [
        "No physical product is shipped. You are purchasing digital embroidery files (ZIP packages) unlocked after successful payment.",
        "Because delivery is digital and immediate, standard physical return shipping does not apply.",
      ],
    },
    {
      id: "eligibility",
      heading: "Refund Eligibility",
      paragraphs: [
        "Once a design ZIP has been successfully downloaded, the purchase is generally non-refundable because the digital goods have been delivered.",
        "We may consider a refund or replacement if: payment was charged more than once for the same order; the delivered file is corrupt or incomplete and we cannot provide a working replacement; or a technical failure prevented delivery after a successful charge.",
      ],
    },
    {
      id: "wrong-format",
      heading: "Wrong Format or Machine",
      paragraphs: [
        "Please review Machine Compatibility and the formats listed on each product page before purchasing.",
        "Purchases made for an incompatible machine or format are not automatically refundable. Contact support promptly with your order number and machine model; we will help where a reasonable fix is available.",
      ],
    },
    {
      id: "duplicate-purchase",
      heading: "Duplicate Purchase",
      paragraphs: [
        "If you were charged twice for the same design due to a checkout or payment error, contact support with both order references. Confirmed duplicate charges will be refunded.",
      ],
    },
    {
      id: "corrupt-file",
      heading: "Corrupt or Incomplete File",
      paragraphs: [
        "If a download appears corrupt or incomplete, contact support with your order number and the format you attempted to download.",
        "We will first attempt to re-deliver a working package. If we cannot, we will refund the affected purchase.",
      ],
    },
    {
      id: "how-to-request",
      heading: "How to Request a Refund",
      paragraphs: [
        "Email or message support with your order number, purchase email, and a short description of the issue.",
        "Approved refunds are processed through the original payment method via our payment provider where applicable.",
        ...officeLines,
      ],
    },
  ],
};

export const shippingPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Shipping & Service Policy",
  intro:
    "We sell digital embroidery designs only. There is no physical shipping. This page explains how digital delivery and customer service work.",
  pendingNotice: "",
  sections: [
    {
      id: "no-physical-shipping",
      heading: "No Physical Shipping",
      paragraphs: [
        "We do not ship fabric, thread, finished garments, USB sticks, or any physical goods.",
        "All purchases are digital downloads delivered online after successful payment.",
      ],
    },
    {
      id: "digital-delivery",
      heading: "Digital Delivery",
      paragraphs: [
        "After successful payment at checkout, your order is confirmed and embroidery ZIP packages become available for download on the order success page.",
        "Where accounts or order history are available, you may also return to your downloads from My Account / Orders.",
        "Delivery is typically instant after payment confirmation. Temporary delays may occur during maintenance or payment provider processing.",
      ],
    },
    {
      id: "service-scope",
      heading: "Service Scope",
      paragraphs: [
        "Our service includes: listing digital embroidery designs; accepting online payment; unlocking paid ZIP downloads; and customer support for order and download issues.",
        "We do not provide embroidery machine hardware, physical digitizing on-site, or courier delivery of goods.",
      ],
    },
    {
      id: "support-hours",
      heading: "Customer Support",
      paragraphs: [
        "Support is available by email, contact form, and WhatsApp for order confirmation, download access, and format questions.",
        "Please include your order number when requesting help so we can locate your purchase quickly.",
        ...officeLines,
      ],
    },
  ],
};

export const privacyPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Privacy Policy",
  intro:
    "This Privacy Policy explains what personal information we collect when you use our website, how we use it, and how you can contact us.",
  pendingNotice: "",
  sections: [
    {
      id: "overview",
      heading: "Overview",
      paragraphs: [
        "We operate an online store selling digital embroidery designs. We collect only the information needed to process orders, deliver downloads, and provide customer support.",
        "By using the website, contacting us, or completing checkout, you agree to this Privacy Policy.",
      ],
    },
    {
      id: "information-we-collect",
      heading: "Information We Collect",
      paragraphs: [
        "Checkout / orders: name, email address, phone number, order contents, amounts, and order identifiers.",
        "Contact form: name, email, topic, optional order number, and message content.",
        "Account (when you create one): email and account credentials necessary to sign in and access downloads.",
        "Technical data: basic device/browser information and essential site storage used for cart and session functions.",
      ],
    },
    {
      id: "how-we-use",
      heading: "How We Use Information",
      paragraphs: [
        "To create and fulfill digital orders and unlock ZIP downloads after payment.",
        "To send order confirmation and download-related communications.",
        "To respond to support requests and resolve payment or delivery issues.",
        "To operate, secure, and improve the website and prevent fraud or abuse.",
      ],
    },
    {
      id: "sharing",
      heading: "Sharing & Processors",
      paragraphs: [
        "Payment processing: when a payment gateway (such as Premier PayFast) is connected, payment details are processed by that provider according to their privacy and security terms. We do not store full card numbers on our servers.",
        "Hosting and infrastructure: our website and database are hosted on our service providers as needed to run the store.",
        "We do not sell your personal information.",
      ],
    },
    {
      id: "retention",
      heading: "Retention",
      paragraphs: [
        "Order and contact records are retained as needed for order history, support, accounting, and legal compliance.",
        "You may request deletion of personal data where applicable law allows; some transaction records may need to be kept for legitimate business or legal reasons.",
      ],
    },
    {
      id: "rights",
      heading: "Your Rights",
      paragraphs: [
        "Depending on applicable law, you may request access to, correction of, or deletion of personal information we hold about you.",
        "To exercise these rights, contact us using the details below and include enough information for us to verify your request.",
      ],
    },
    {
      id: "contact",
      heading: "Privacy Contact",
      paragraphs: [
        "For privacy questions or requests, contact:",
        ...officeLines,
      ],
    },
  ],
};

export const termsPageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Terms & Conditions",
  intro:
    "These Terms & Conditions govern your use of this website and purchases of digital embroidery designs from Chand Designer / Azam Cloth Design.",
  pendingNotice: "",
  sections: [
    {
      id: "website-usage",
      heading: "Website Usage",
      paragraphs: [
        "You may browse and use this website for lawful purposes only.",
        "You must not attempt to disrupt the site, misuse payment flows, scrape content at scale, or access downloads without a valid paid order.",
      ],
    },
    {
      id: "business-model",
      heading: "Our Business",
      paragraphs: [
        "We sell digital embroidery design files online. Customers select designs, pay securely at checkout, and receive ZIP downloads after successful payment.",
        "No physical goods are shipped. See our Shipping & Service Policy for delivery details.",
      ],
    },
    {
      id: "purchases",
      heading: "Purchases",
      paragraphs: [
        "Prices shown at checkout are the amounts due for the selected digital designs.",
        "By placing an order you confirm that the contact details you provide are accurate so we can confirm the order and support your download access.",
      ],
    },
    {
      id: "digital-products",
      heading: "Digital Products",
      paragraphs: [
        "Products are digital files. After successful payment, downloads are made available on the order success experience and, where available, through your account orders/downloads.",
      ],
    },
    {
      id: "licensing",
      heading: "Licensing",
      paragraphs: [
        "Purchased files are licensed under our License & Usage Policy. Digital file redistribution is not allowed.",
      ],
    },
    {
      id: "ip",
      heading: "Intellectual Property",
      paragraphs: [
        "Designs, branding, text, and site content remain owned by Chand Designer / Azam Cloth Design or their respective rights holders.",
        "Purchase grants a license to use the embroidery files as described in the License & Usage Policy, not ownership of the underlying intellectual property beyond that license.",
      ],
    },
    {
      id: "payments",
      heading: "Payments",
      paragraphs: [
        "Payments are processed through our connected payment gateway provider.",
        "Successful payment is required before ZIP downloads are unlocked. Failed, cancelled, or incomplete payments do not grant download rights.",
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      paragraphs: [
        "Refunds are handled under our Refund & Return Policy.",
      ],
    },
    {
      id: "liability",
      heading: "Liability",
      paragraphs: [
        "We provide designs and downloads with reasonable care. We are not liable for machine incompatibility where format information was available before purchase, or for losses arising from misuse of files.",
        "To the extent permitted by law, our total liability for any purchase is limited to the amount you paid for that order.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [...officeLines],
    },
  ],
};

export const cookiePageContent: LegalPageContent = {
  eyebrow: "Legal",
  heading: "Cookie Policy",
  intro:
    "This Cookie Policy explains how we use cookies and similar browser storage on our website.",
  pendingNotice: "",
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
      heading: "Essential / Local Storage",
      paragraphs: [
        "We use essential browser storage for cart lines, wishlist items, local order confirmation on this device, and account/session preferences needed to operate the storefront.",
        "These technologies are required for shopping, checkout, and revisiting purchases on the same browser.",
      ],
    },
    {
      id: "analytics",
      heading: "Analytics & Marketing Cookies",
      paragraphs: [
        "We do not currently run third-party advertising or analytics cookies on the storefront.",
        "If we add analytics or advertising tools later, this policy will be updated with the tools used and any choices available to you.",
      ],
    },
    {
      id: "choices",
      heading: "Your Choices",
      paragraphs: [
        "You can clear site data from your browser settings. Clearing storage removes local cart, wishlist, preferences, and on-device order history.",
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [
        "Questions about this Cookie Policy can be sent to:",
        ...officeLines,
      ],
    },
  ],
};

export function legalPageHref(locale: string, href: string): string {
  return `/${locale}${href}`;
}
