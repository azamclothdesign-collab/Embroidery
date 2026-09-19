"use client";

import { businessWhatsAppHref, businessContact } from "@/constants/businessContact";

type WhatsAppFloatingButtonProps = {
  prefill?: string;
};

export function WhatsAppFloatingButton({
  prefill = "Hi — I need help with an embroidery order.",
}: WhatsAppFloatingButtonProps) {
  return (
    <a
      href={businessWhatsAppHref(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp at ${businessContact.phoneDisplay}`}
      className="fixed bottom-5 right-5 z-50 inline-flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-105 hover:bg-[#1ebe57] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:bottom-8 md:right-8"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
      >
        <path d="M19.11 17.4c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.28-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.1-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.3s.98 2.67 1.12 2.85c.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.57.65.21 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32z" />
        <path d="M26.62 5.38C23.78 2.54 20.05 1 16.05 1 8.2 1 1.85 7.35 1.85 15.2c0 2.5.65 4.94 1.9 7.1L1 31l8.9-2.33c2.08 1.13 4.42 1.73 6.82 1.73h.01c7.85 0 14.2-6.35 14.2-14.2 0-3.79-1.48-7.35-4.31-10.19zM16.73 27.5h-.01c-2.12 0-4.2-.57-6.02-1.65l-.43-.26-4.64 1.22 1.24-4.52-.28-.46c-1.18-1.9-1.8-4.1-1.8-6.36 0-6.6 5.37-11.97 11.98-11.97 3.2 0 6.2 1.25 8.46 3.51 2.26 2.26 3.5 5.26 3.5 8.46-.01 6.61-5.38 11.98-12 11.98z" />
      </svg>
    </a>
  );
}
