export const businessContact = {
  email: "azamclothdesign@gmail.com",
  phone: "+923224725253",
  phoneDisplay: "+92 322 4725253",
  whatsappE164: "923224725253",
} as const;

export function businessMailtoHref(): string {
  return `mailto:${businessContact.email}`;
}

export function businessTelHref(): string {
  return `tel:${businessContact.phone}`;
}

export function businessWhatsAppHref(prefill?: string): string {
  const base = `https://wa.me/${businessContact.whatsappE164}`;

  if (prefill === undefined || prefill.trim().length === 0) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(prefill.trim())}`;
}
