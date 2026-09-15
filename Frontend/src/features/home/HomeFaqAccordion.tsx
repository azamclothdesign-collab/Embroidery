"use client";

import { useId, useState } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { faqItems } from "@/constants/faq";

export function HomeFaqAccordion() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="mt-12 list-none border-b border-line p-0">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

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
                  setOpenIndex(isOpen ? null : index);
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
  );
}
