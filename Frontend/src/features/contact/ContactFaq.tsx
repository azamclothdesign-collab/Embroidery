"use client";

import { useId, useMemo, useState } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import {
  contactFaqItems,
  contactPageCopy,
} from "@/constants/contactPageCopy";

export function ContactFaq() {
  const baseId = useId();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const categories = useMemo(() => {
    const map = new Map<string, Array<(typeof contactFaqItems)[number]>>();
    contactFaqItems.forEach((item) => {
      const current = map.get(item.category) ?? [];
      map.set(item.category, [...current, item]);
    });
    return [...map.entries()];
  }, []);

  return (
    <section
      id="contact-faqs"
      className="contactReveal scroll-mt-header-compact mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="contact-faq-heading"
    >
      <h2
        id="contact-faq-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {contactPageCopy.faqHeading}
      </h2>
      <div className="mt-12 space-y-12">
        {categories.map(([category, items]) => (
          <div key={category}>
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {category}
            </p>
            <ul className="mt-4 list-none border-b border-line p-0">
              {items.map((item) => {
                const isOpen = openKey === item.question;
                const panelId = `${baseId}-panel-${item.question}`;
                const buttonId = `${baseId}-button-${item.question}`;

                return (
                  <li key={item.question} className="border-t border-line">
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex min-h-11 w-full items-center justify-between gap-6 py-6 text-left text-body text-ink"
                        onClick={() => {
                          setOpenKey(isOpen ? null : item.question);
                        }}
                      >
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className={`collapse-chevron shrink-0 text-ink${isOpen ? " is-open" : ""}`}
                        >
                          <ChevronDownIcon />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      aria-hidden={!isOpen}
                      inert={!isOpen}
                      className={`collapse-panel${isOpen ? " is-open" : ""}`}
                    >
                      <div className="collapse-panel-inner">
                        <p className="max-w-2xl pb-6 text-body leading-8 text-ink-soft">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
